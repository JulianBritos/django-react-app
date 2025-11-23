from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils import timezone
from decimal import Decimal
from .models import Payment, PaymentMethod, PaymentTransaction, PaymentRefund
from apps.orders.models import Order
import mercadopago
import environ
import logging

env = environ.Env()
environ.Env.read_env()
logger = logging.getLogger(__name__)


class PaymentService:
    """Servicio para gestión de pagos"""
    
    @staticmethod
    def get_mercadopago_sdk():
        """
        Obtener instancia del SDK de MercadoPago
        """
        access_token = env("MERCADOPAGO_ACCESS_TOKEN", default=None)
        if not access_token:
            raise ValidationError("MERCADOPAGO_ACCESS_TOKEN no configurado")
        return mercadopago.SDK(access_token)
    
    @staticmethod
    def get_or_create_mercadopago_method():
        """
        Obtener o crear método de pago de MercadoPago
        """
        payment_method, created = PaymentMethod.objects.get_or_create(
            code='mercado_pago',
            defaults={
                'name': 'MercadoPago',
                'payment_type': 'mercado_pago',
                'is_active': True,
                'min_installments': 1,
                'max_installments': 12,
            }
        )
        return payment_method
    
    @staticmethod
    @transaction.atomic
    def create_payment_for_order(order, payment_method=None, amount=None, **kwargs):
        """
        Crear registro de pago para una orden
        """
        if not payment_method:
            payment_method = PaymentService.get_or_create_mercadopago_method()
        
        if amount is None:
            amount = order.total_amount
        
        payment = Payment.objects.create(
            order=order,
            payment_method=payment_method,
            amount=amount,
            currency=order.currency or 'ARS',
            status='pending',
            **kwargs
        )
        
        logger.info(f"Payment {payment.payment_id} creado para orden {order.order_number}")
        return payment
    
    @staticmethod
    @transaction.atomic
    def process_mercadopago_webhook(data):
        """
        Procesar webhook de MercadoPago y actualizar pago/orden
        """
        try:
            # Obtener información del pago desde MercadoPago
            payment_id = data.get("data", {}).get("id")
            if not payment_id:
                # Intentar obtener desde el body directamente
                payment_id = data.get("id")
            
            if not payment_id:
                raise ValidationError("No se proporcionó payment_id en el webhook")
            
            sdk = PaymentService.get_mercadopago_sdk()
            
            # Obtener información del pago desde MercadoPago
            payment_info = sdk.payment().get(payment_id)
            payment_data = payment_info.get("response", {})
            
            if not payment_data:
                raise ValidationError("No se pudo obtener información del pago desde MercadoPago")
            
            # Buscar orden por external_reference
            external_reference = payment_data.get("external_reference") or payment_data.get("metadata", {}).get("order_number")
            
            if not external_reference:
                raise ValidationError("No se encontró external_reference en el pago")
            
            try:
                order = Order.objects.get(order_number=external_reference)
            except Order.DoesNotExist:
                logger.error(f"Orden no encontrada para external_reference: {external_reference}")
                raise ValidationError(f"Orden no encontrada: {external_reference}")
            
            # Mapear estado de MercadoPago a nuestro estado
            mp_status = payment_data.get("status")
            status_mapping = {
                'approved': 'completed',
                'pending': 'processing',
                'authorized': 'processing',
                'in_process': 'processing',
                'in_mediation': 'processing',
                'rejected': 'failed',
                'cancelled': 'cancelled',
                'refunded': 'refunded',
                'charged_back': 'refunded',
            }
            
            payment_status = status_mapping.get(mp_status, 'pending')
            
            # Obtener o crear pago
            payment_method = PaymentService.get_or_create_mercadopago_method()
            payment, created = Payment.objects.get_or_create(
                external_payment_id=str(payment_id),
                defaults={
                    'order': order,
                    'payment_method': payment_method,
                    'amount': Decimal(str(payment_data.get("transaction_amount", order.total_amount))),
                    'currency': payment_data.get("currency_id", "ARS"),
                    'status': payment_status,
                    'payment_date': timezone.now() if payment_status == 'completed' else None,
                    'gateway_response': payment_data,
                }
            )
            
            if not created:
                # Actualizar pago existente
                old_status = payment.status
                payment.status = payment_status
                payment.gateway_response = payment_data
                
                if payment_status == 'completed' and not payment.payment_date:
                    payment.payment_date = timezone.now()
                
                payment.save()
                
                logger.info(f"Payment {payment.payment_id} actualizado: {old_status} -> {payment_status}")
            
            # Actualizar estado de la orden según el estado del pago
            if payment_status == 'completed' and order.status == 'pending':
                order.status = 'confirmed'
                order.save()
                logger.info(f"Orden {order.order_number} confirmada por pago exitoso")
            elif payment_status == 'failed' and order.status == 'pending':
                order.status = 'cancelled'
                order.save()
                logger.info(f"Orden {order.order_number} cancelada por pago fallido")
            
            # Crear transacción
            PaymentService.create_transaction_for_payment(payment, payment_data)
            
            return payment
            
        except Exception as e:
            logger.error(f"Error procesando webhook de MercadoPago: {str(e)}", exc_info=True)
            raise
    
    @staticmethod
    def create_transaction_for_payment(payment, payment_data):
        """
        Crear registro de transacción para un pago
        """
        transaction_type = 'charge'  # Por defecto
        
        # Determinar tipo de transacción según estado
        mp_status = payment_data.get("status")
        if mp_status == 'refunded' or mp_status == 'charged_back':
            transaction_type = 'refund'
        
        transaction, created = PaymentTransaction.objects.get_or_create(
            external_transaction_id=str(payment_data.get("id", payment.payment_id)),
            defaults={
                'payment': payment,
                'transaction_type': transaction_type,
                'amount': payment.amount,
                'currency': payment.currency,
                'status': 'completed' if payment.status == 'completed' else 'pending',
                'gateway_response': payment_data,
            }
        )
        
        return transaction
    
    @staticmethod
    @transaction.atomic
    def create_refund(payment, amount=None, reason=None, processed_by=None):
        """
        Crear reembolso para un pago
        """
        if not payment.can_be_refunded:
            raise ValidationError("Este pago no puede ser reembolsado")
        
        if amount is None:
            amount = payment.remaining_refundable_amount
        else:
            amount = Decimal(str(amount))
            if amount > payment.remaining_refundable_amount:
                raise ValidationError(f"El monto del reembolso excede el monto disponible: {payment.remaining_refundable_amount}")
        
        # Si es MercadoPago, procesar reembolso en el gateway
        if payment.payment_method and payment.payment_method.code == 'mercado_pago':
            try:
                sdk = PaymentService.get_mercadopago_sdk()
                refund_data = sdk.refund().create(payment.external_payment_id, {
                    "amount": float(amount)
                })
                
                refund_response = refund_data.get("response", {})
                external_refund_id = str(refund_response.get("id", ""))
            except Exception as e:
                logger.error(f"Error creando reembolso en MercadoPago: {str(e)}")
                external_refund_id = None
        else:
            external_refund_id = None
        
        # Crear registro de reembolso
        refund = PaymentRefund.objects.create(
            payment=payment,
            external_refund_id=external_refund_id,
            amount=amount,
            reason=reason,
            processed_by=processed_by,
            status='completed' if external_refund_id else 'pending',
        )
        
        # Actualizar estado del pago si se reembolsó todo
        if refund.amount >= payment.amount:
            payment.status = 'refunded'
        else:
            payment.status = 'partially_refunded'
        
        payment.save()
        
        logger.info(f"Refund {refund.refund_id} creado para payment {payment.payment_id}")
        return refund
    
    @staticmethod
    def get_payment_status(payment_id):
        """
        Obtener estado de un pago desde MercadoPago
        """
        try:
            sdk = PaymentService.get_mercadopago_sdk()
            payment_info = sdk.payment().get(payment_id)
            payment_data = payment_info.get("response", {})
            
            return {
                'status': payment_data.get("status"),
                'status_detail': payment_data.get("status_detail"),
                'transaction_amount': payment_data.get("transaction_amount"),
                'date_approved': payment_data.get("date_approved"),
            }
        except Exception as e:
            logger.error(f"Error obteniendo estado de pago desde MercadoPago: {str(e)}")
            return None

