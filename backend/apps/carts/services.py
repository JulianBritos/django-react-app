from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta
from apps.products.models import Product, ProductAttribute
from apps.promotions.models import Coupon
from .models import Cart, StockReservation
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)


class StockValidationService:
    """Servicio para validación de stock en tiempo real"""
    
    @staticmethod
    def validate_stock_availability(product_id, product_attribute_id=None, quantity=1):
        """
        Validar disponibilidad de stock para un producto/variante
        """
        try:
            product = Product.objects.get(id=product_id, status='ACTIVE')
            
            if product_attribute_id:
                # Validar stock de variante específica
                attr = ProductAttribute.objects.get(
                    id=product_attribute_id, 
                    product=product
                )
                available_stock = attr.stock
            else:
                # Validar stock total del producto
                available_stock = sum(
                    attr.stock for attr in product.product_attributes.all()
                )
            
            if available_stock < quantity:
                return {
                    'available': False,
                    'available_stock': available_stock,
                    'requested_quantity': quantity,
                    'message': f'Solo hay {available_stock} unidades disponibles'
                }
            
            return {
                'available': True,
                'available_stock': available_stock,
                'requested_quantity': quantity
            }
            
        except Product.DoesNotExist:
            raise ValidationError("El producto no existe o no está activo")
        except ProductAttribute.DoesNotExist:
            raise ValidationError("La variante del producto no existe")
    
    @staticmethod
    def reserve_stock(product_id, product_attribute_id=None, quantity=1):
        """
        Reservar stock temporalmente durante checkout
        """
        with transaction.atomic():
            if product_attribute_id:
                attr = ProductAttribute.objects.select_for_update().get(
                    id=product_attribute_id
                )
                if attr.stock < quantity:
                    raise ValidationError("Stock insuficiente")
                attr.stock -= quantity
                attr.save()
            else:
                # Reservar del primer atributo disponible
                attr = ProductAttribute.objects.select_for_update().filter(
                    product_id=product_id,
                    stock__gte=quantity
                ).first()
                if not attr:
                    raise ValidationError("Stock insuficiente")
                attr.stock -= quantity
                attr.save()
    
    @staticmethod
    def release_stock(product_id, product_attribute_id=None, quantity=1):
        """
        Liberar stock reservado si el checkout falla
        """
        with transaction.atomic():
            if product_attribute_id:
                attr = ProductAttribute.objects.select_for_update().get(
                    id=product_attribute_id
                )
                attr.stock += quantity
                attr.save()
            else:
                # Liberar en el primer atributo disponible
                attr = ProductAttribute.objects.select_for_update().filter(
                    product_id=product_id
                ).first()
                if attr:
                    attr.stock += quantity
                    attr.save()


class CouponService:
    """Servicio para gestión de cupones"""
    
    @staticmethod
    def validate_coupon(coupon_code, user=None, cart=None):
        """
        Validar si un cupón puede ser aplicado
        """
        try:
            coupon = Coupon.objects.get(code=coupon_code.upper())
        except Coupon.DoesNotExist:
            return {
                'valid': False,
                'message': 'El cupón no existe'
            }
        
        # Validar si el cupón está activo y en período válido
        if not coupon.is_valid():
            return {
                'valid': False,
                'message': 'El cupón no está disponible o ha expirado'
            }
        
        # Validar uso por cliente (si aplica)
        if coupon.usage_limit_type == 'once_per_customer' and user:
            if coupon.usages.filter(user=user).exists():
                return {
                    'valid': False,
                    'message': 'Ya has utilizado este cupón anteriormente'
                }
        
        # Validar si el cupón ya está aplicado en otro carrito activo del usuario
        if user:
            active_cart_with_coupon = Cart.objects.filter(
                user=user,
                status='active',
                coupon=coupon
            ).exclude(pk=cart.pk if cart else None).exists()
            
            if active_cart_with_coupon:
                return {
                    'valid': False,
                    'message': 'Este cupón ya está aplicado en otro carrito'
                }
        
        return {
            'valid': True,
            'coupon': coupon,
            'message': 'Cupón válido'
        }
    
    @staticmethod
    def calculate_discount(coupon, subtotal, shipping_cost):
        """
        Calcular el descuento basado en el tipo de cupón
        """
        if coupon.discount_type == 'percentage':
            # Descuento porcentual
            discount = subtotal * (coupon.discount_value / Decimal('100'))
            return min(discount, subtotal)  # No puede ser mayor al subtotal
        
        elif coupon.discount_type == 'fixed_amount':
            # Descuento por monto fijo
            return min(coupon.discount_value, subtotal)
        
        elif coupon.discount_type == 'free_shipping':
            # Envío gratis
            return Decimal('0')  # El descuento se aplica al shipping_cost
        
        return Decimal('0')
    
    @staticmethod
    def apply_coupon_to_cart(cart, coupon_code):
        """
        Aplicar un cupón al carrito
        """
        # Validar el cupón
        validation = CouponService.validate_coupon(coupon_code, user=cart.user, cart=cart)
        
        if not validation['valid']:
            raise ValidationError(validation['message'])
        
        coupon = validation['coupon']
        
        # Aplicar el cupón al carrito
        cart.coupon = coupon
        cart.save()
        
        # Recalcular totales
        totals = CartCalculationService.calculate_cart_totals(cart)
        
        return {
            'success': True,
            'message': f'Cupón {coupon.code} aplicado correctamente',
            'coupon': {
                'code': coupon.code,
                'name': coupon.name,
                'discount_type': coupon.discount_type,
                'discount_value': str(coupon.discount_value),
            },
            'discount_amount': str(totals['discount_amount']),
            'totals': totals
        }
    
    @staticmethod
    def remove_coupon_from_cart(cart):
        """
        Remover cupón del carrito
        """
        if not cart.coupon:
            raise ValidationError('No hay cupón aplicado en el carrito')
        
        cart.coupon = None
        cart.save()
        
        # Recalcular totales
        totals = CartCalculationService.calculate_cart_totals(cart)
        
        return {
            'success': True,
            'message': 'Cupón removido correctamente',
            'totals': totals
        }


class CartCalculationService:
    """Servicio para cálculos automáticos del carrito"""
    
    @staticmethod
    def calculate_cart_totals(cart):
        """
        Calcular todos los totales del carrito
        """
        subtotal = Decimal('0')
        tax_rate = Decimal('0.21')  # IVA 21%
        
        for item in cart.items.all():
            item_subtotal = item.subtotal
            subtotal += Decimal(str(item_subtotal))
        
        # Calcular impuestos sobre el subtotal
        tax_amount = subtotal * tax_rate
        
        # Calcular envío (lógica básica)
        shipping_cost = CartCalculationService.calculate_shipping_cost(cart, subtotal)
        
        # Calcular descuentos del cupón (si existe)
        discount_amount = Decimal('0')
        adjusted_shipping_cost = shipping_cost
        
        if cart.coupon:
            if cart.coupon.discount_type == 'free_shipping':
                # Envío gratis
                discount_amount = shipping_cost
                adjusted_shipping_cost = Decimal('0')
            else:
                # Descuento sobre subtotal
                discount_amount = CouponService.calculate_discount(
                    cart.coupon, subtotal, shipping_cost
                )
        
        # Total final (después de descuentos pero antes de impuestos si el descuento se aplica antes)
        # En este caso, aplicamos el descuento al subtotal antes de calcular impuestos
        subtotal_after_discount = subtotal - discount_amount
        tax_amount = subtotal_after_discount * tax_rate
        
        total_amount = subtotal_after_discount + tax_amount + adjusted_shipping_cost
        
        return {
            'subtotal': subtotal,
            'tax_amount': tax_amount,
            'tax_rate': tax_rate,
            'shipping_cost': adjusted_shipping_cost,
            'discount_amount': discount_amount,
            'total_amount': total_amount
        }
    
    @staticmethod
    def calculate_shipping_cost(cart, subtotal):
        """
        Calcular costo de envío basado en reglas
        """
        # Si hay cupón de envío gratis, no calcular shipping aquí (se maneja en calculate_cart_totals)
        if cart.coupon and cart.coupon.discount_type == 'free_shipping':
            return Decimal('0')
        
        # Lógica básica - puede ser más compleja
        if subtotal >= Decimal('10000'):  # Envío gratis sobre $10,000
            return Decimal('0')
        elif subtotal >= Decimal('5000'):  # Envío reducido sobre $5,000
            return Decimal('2.99')
        else:
            return Decimal('4.99')


class StockReservationService:
    """Servicio para gestión de reservas de stock"""
    
    @staticmethod
    def create_reservation(cart, product_id, product_attribute_id=None, quantity=1):
        """
        Crear reserva de stock para el carrito
        """
        with transaction.atomic():
            # Validar stock disponible
            stock_validation = StockValidationService.validate_stock_availability(
                product_id, product_attribute_id, quantity
            )
            
            if not stock_validation['available']:
                raise ValidationError(stock_validation['message'])
            
            # Obtener producto y atributo
            product = Product.objects.get(id=product_id)
            product_attribute = None
            if product_attribute_id:
                product_attribute = ProductAttribute.objects.get(id=product_attribute_id)
            
            # Verificar si ya existe una reserva activa para este item en el carrito
            existing_reservation = StockReservation.objects.filter(
                cart=cart,
                product=product,
                product_attribute=product_attribute,
                status='active'
            ).first()
            
            if existing_reservation:
                # Actualizar cantidad de la reserva existente
                old_quantity = existing_reservation.quantity
                
                # Si la cantidad es la misma, solo actualizar la fecha de expiración
                if old_quantity == quantity:
                    existing_reservation.expires_at = timezone.now() + timedelta(minutes=15)
                    existing_reservation.save()
                    return existing_reservation
                
                # Validar que hay suficiente stock para la nueva cantidad
                # Necesitamos considerar el stock disponible + el stock que ya está reservado
                stock_validation = StockValidationService.validate_stock_availability(
                    product_id, product_attribute_id, quantity
                )
                if not stock_validation['available']:
                    raise ValidationError(stock_validation['message'])
                
                # Calcular la diferencia
                quantity_diff = quantity - old_quantity
                
                if quantity_diff > 0:
                    # Necesitamos reservar más stock
                    StockValidationService.reserve_stock(
                        product_id, 
                        product_attribute_id, 
                        quantity_diff
                    )
                elif quantity_diff < 0:
                    # Necesitamos liberar stock
                    StockValidationService.release_stock(
                        product_id, 
                        product_attribute_id, 
                        abs(quantity_diff)
                    )
                
                # Actualizar reserva existente
                existing_reservation.quantity = quantity
                existing_reservation.expires_at = timezone.now() + timedelta(minutes=15)
                existing_reservation.save()
                return existing_reservation
            else:
                # Reservar stock
                StockValidationService.reserve_stock(product_id, product_attribute_id, quantity)
                
                # Crear registro de reserva
                reservation = StockReservation.objects.create(
                    cart=cart,
                    product=product,
                    product_attribute=product_attribute,
                    quantity=quantity,
                    status='active',
                    expires_at=timezone.now() + timedelta(minutes=15)
                )
                
                return reservation
    
    @staticmethod
    def consume_reservations(cart):
        """
        Consumir todas las reservas del carrito (al confirmar orden)
        El stock ya está restado, solo marcamos las reservas como consumidas
        """
        with transaction.atomic():
            reservations = StockReservation.objects.filter(
                cart=cart,
                status='active'
            )
            
            for reservation in reservations:
                reservation.status = 'consumed'
                reservation.save()
            
            return reservations.count()
    
    @staticmethod
    def cancel_reservations(cart):
        """
        Cancelar reservas y liberar stock
        """
        with transaction.atomic():
            reservations = StockReservation.objects.filter(
                cart=cart,
                status='active'
            )
            
            for reservation in reservations:
                # Liberar stock
                StockValidationService.release_stock(
                    reservation.product.id,
                    reservation.product_attribute.id if reservation.product_attribute else None,
                    reservation.quantity
                )
                # Marcar como cancelada
                reservation.status = 'cancelled'
                reservation.save()
            
            return reservations.count()
    
    @staticmethod
    def cleanup_expired_reservations():
        """
        Limpiar reservas expiradas (ejecutar periódicamente)
        """
        with transaction.atomic():
            now = timezone.now()
            expired_reservations = StockReservation.objects.filter(
                status='active',
                expires_at__lt=now
            )
            
            count = 0
            for reservation in expired_reservations:
                # Liberar stock
                StockValidationService.release_stock(
                    reservation.product.id,
                    reservation.product_attribute.id if reservation.product_attribute else None,
                    reservation.quantity
                )
                # Marcar como expirada
                reservation.status = 'expired'
                reservation.save()
                count += 1
            
            return count