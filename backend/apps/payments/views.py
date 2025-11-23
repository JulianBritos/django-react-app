from django.db import transaction
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.core.exceptions import ValidationError
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from decimal import Decimal
from apps.orders.models import Order
from apps.payments.models import Payment, PaymentMethod, PaymentRefund
from apps.payments.services import PaymentService
from apps.payments.serializers import (
    PaymentSerializer, PaymentCreateSerializer, PaymentUpdateSerializer
)
import mercadopago
import json
import environ
import logging

# Cargar variables de entorno
env = environ.Env()
environ.Env.read_env()
logger = logging.getLogger(__name__)


@api_view(["POST"]) 
def create_preference(request):
    """
    Crear preferencia de pago en MercadoPago para una orden existente
    """
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            order_id = data.get("order_id")
            
            if not order_id:
                return JsonResponse({"error": "Se requiere order_id"}, status=400)
            
            try:
                order = Order.objects.get(id=order_id)
            except Order.DoesNotExist:
                return JsonResponse({"error": "Orden no encontrada"}, status=404)
            
            # Crear registro de pago si no existe
            payment, created = Payment.objects.get_or_create(
                order=order,
                defaults={
                    'payment_method': PaymentService.get_or_create_mercadopago_method(),
                    'amount': order.total_amount,
                    'currency': order.currency or 'ARS',
                    'status': 'pending'
                }
            )
            
            sdk = PaymentService.get_mercadopago_sdk()
            
            # Preparar items de la orden para MercadoPago
            items = []
            for item in order.items.all():
                items.append({
                    "id": str(item.product.id),
                    "title": item.product_name or item.product.name,
                    "currency_id": order.currency or "ARS",
                    "quantity": item.quantity,
                    "unit_price": float(item.unit_price)
                })
            
            # Si no hay items, usar datos básicos de la orden
            if not items:
                items = [{
                    "id": str(order.id),
                    "title": f"Orden {order.order_number}",
                    "currency_id": order.currency or "ARS",
                    "quantity": 1,
                    "unit_price": float(order.total_amount)
                }]
            
            # Datos para MercadoPago
            preference_data = {
                "items": items,
                "payer": {
                    "email": order.customer_email,
                },
                "back_urls": data.get("back_urls", {}),
                "auto_return": "approved",
                "notification_url": data.get("notification_url", "https://www.tusitio.com/webhook-mercadopago"),
                "external_reference": order.order_number,
                "metadata": {
                    "order_number": order.order_number,
                    "order_id": order.id,
                    "payment_id": payment.payment_id
                },
                "expires": True
            }

            preference_response = sdk.preference().create(preference_data)
            preference = preference_response.get("response")
            
            if not preference:
                return JsonResponse({"error": "Error al crear preferencia en MercadoPago"}, status=400)

            # Guardar ID de preferencia en el pago
            payment.external_payment_id = preference.get("id")
            payment.gateway_response = preference
            payment.save()

            return JsonResponse({
                "init_point": preference.get("init_point"),
                "sandbox_init_point": preference.get("sandbox_init_point"),
                "order_id": order.id,
                "payment_id": payment.payment_id,
                "preference_id": preference.get("id")
            })
        except Exception as e:
            logger.error(f"Error creando preferencia: {str(e)}", exc_info=True)
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Método no permitido"}, status=405)


@csrf_exempt
def webhook_mercadopago(request):
    """
    Webhook de MercadoPago para actualizar pagos
    """
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            
            # Procesar webhook usando el servicio
            payment = PaymentService.process_mercadopago_webhook(data)
            
            return JsonResponse({
                "message": "Pago actualizado correctamente",
                "payment_id": payment.payment_id,
                "status": payment.status
            })
        except Exception as e:
            logger.error(f"Error procesando webhook: {str(e)}", exc_info=True)
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Método no permitido"}, status=405)


@csrf_exempt
def payment_notification(request):
    """
    Endpoint de notificación de pago (compatibilidad con versión anterior)
    Redirige al webhook principal
    """
    return webhook_mercadopago(request)


class PaymentViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de pagos
    """
    serializer_class = PaymentSerializer
    permission_classes = [AllowAny]  # Permitir acceso público para webhooks
    
    def get_serializer_class(self):
        """
        Usar diferentes serializers según la acción
        """
        if self.action == 'create':
            return PaymentCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return PaymentUpdateSerializer
        return PaymentSerializer
    
    def get_queryset(self):
        """
        Filtrar pagos según usuario
        """
        user = self.request.user
        
        if user.is_authenticated:
            if hasattr(user, 'is_admin') and user.is_admin:
                # Admins ven todos los pagos
                return Payment.objects.all().select_related('order', 'payment_method').order_by('-created_at')
            else:
                # Usuarios normales solo sus pagos
                return Payment.objects.filter(
                    order__user=user
                ).select_related('order', 'payment_method').order_by('-created_at')
        else:
            # Para guest checkout, filtrar por email de sesión
            guest_email = self.request.session.get('guest_email')
            if guest_email:
                return Payment.objects.filter(
                    order__guest_email=guest_email,
                    order__user__isnull=True
                ).select_related('order', 'payment_method').order_by('-created_at')
            return Payment.objects.none()
    
    @action(detail=True, methods=['post'])
    def create_refund(self, request, pk=None):
        """
        Crear reembolso para un pago
        """
        payment = self.get_object()
        amount = request.data.get('amount')
        reason = request.data.get('reason')
        
        try:
            refund = PaymentService.create_refund(
                payment,
                amount=Decimal(str(amount)) if amount else None,
                reason=reason,
                processed_by=request.user if request.user.is_authenticated else None
            )
            
            return Response({
                'message': 'Reembolso creado exitosamente',
                'refund_id': refund.refund_id,
                'amount': str(refund.amount)
            }, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def status(self, request, pk=None):
        """
        Obtener estado actualizado del pago desde MercadoPago
        """
        payment = self.get_object()
        
        if payment.external_payment_id and payment.payment_method.code == 'mercado_pago':
            status_info = PaymentService.get_payment_status(payment.external_payment_id)
            
            if status_info:
                return Response({
                    'payment_id': payment.payment_id,
                    'current_status': payment.status,
                    'mercadopago_status': status_info
                })
        
        return Response({
            'payment_id': payment.payment_id,
            'current_status': payment.status,
            'mercadopago_status': None
        })