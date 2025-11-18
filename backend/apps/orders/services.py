# backend/apps/carts/services.py

from django.db import transaction
from django.core.exceptions import ValidationError
from apps.products.models import Product, ProductAttribute
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
            subtotal += item_subtotal
        
        # Calcular impuestos
        tax_amount = subtotal * tax_rate
        
        # Calcular envío (lógica básica)
        shipping_cost = CartCalculationService.calculate_shipping_cost(cart, subtotal)
        
        # Calcular descuentos (por ahora 0)
        discount_amount = Decimal('0')
        
        # Total final
        total_amount = subtotal + tax_amount + shipping_cost - discount_amount
        
        return {
            'subtotal': subtotal,
            'tax_amount': tax_amount,
            'tax_rate': tax_rate,
            'shipping_cost': shipping_cost,
            'discount_amount': discount_amount,
            'total_amount': total_amount
        }
    
    @staticmethod
    def calculate_shipping_cost(cart, subtotal):
        """
        Calcular costo de envío basado en reglas
        """
        # Lógica básica - puede ser más compleja
        if subtotal >= Decimal('10000'):  # Envío gratis sobre $10,000
            return Decimal('0')
        elif subtotal >= Decimal('5000'):  # Envío reducido sobre $5,000
            return Decimal('2.99')
        else:
            return Decimal('4.99')
    
    @staticmethod
    def apply_coupon(cart, coupon_code):
        """
        Aplicar cupón de descuento
        """
        # TODO: Implementar lógica de cupones
        return Decimal('0')


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
            
            # Reservar stock
            StockValidationService.reserve_stock(product_id, product_attribute_id, quantity)
            
            # Crear registro de reserva (necesitarás crear el modelo StockReservation)
            # Por ahora, solo reservamos el stock sin crear el registro
            # TODO: Implementar modelo StockReservation
            return {
                'product_id': product_id,
                'product_attribute_id': product_attribute_id,
                'quantity': quantity,
                'reserved': True
            }
    
    @staticmethod
    def consume_reservations(cart):
        """
        Consumir todas las reservas del carrito (al confirmar orden)
        """
        # Por ahora, no hay nada que hacer ya que no tenemos el modelo StockReservation
        # TODO: Implementar cuando tengas el modelo
        pass
    
    @staticmethod
    def cancel_reservations(cart):
        """
        Cancelar reservas y liberar stock
        """
        # Por ahora, no hay nada que hacer ya que no tenemos el modelo StockReservation
        # TODO: Implementar cuando tengas el modelo
        pass
    
    @staticmethod
    def cleanup_expired_reservations():
        """
        Limpiar reservas expiradas (ejecutar periódicamente)
        """
        # Por ahora, no hay nada que hacer ya que no tenemos el modelo StockReservation
        # TODO: Implementar cuando tengas el modelo
        pass


class OrderValidationService:
    """Servicio para validación de órdenes antes del checkout"""
    
    @staticmethod
    def validate_order_availability(cart):
        """
        Validar disponibilidad de stock para todos los items del carrito
        
        Returns:
            dict: {
                'errors': list of error messages,
                'warnings': list of warning messages
            }
        """
        from apps.carts.services import StockValidationService
        
        errors = []
        warnings = []
        
        if not cart.items.exists():
            errors.append('El carrito está vacío')
            return {'errors': errors, 'warnings': warnings}
        
        for cart_item in cart.items.all():
            try:
                product_id = cart_item.product.id
                product_attribute_id = cart_item.product_attribute.id if cart_item.product_attribute else None
                quantity = cart_item.quantity
                
                stock_validation = StockValidationService.validate_stock_availability(
                    product_id=product_id,
                    product_attribute_id=product_attribute_id,
                    quantity=quantity
                )
                
                if not stock_validation['available']:
                    product_name = cart_item.product.name
                    errors.append(
                        f'{product_name}: {stock_validation.get("message", "Stock insuficiente")}'
                    )
                elif stock_validation.get('available_stock', 0) <= quantity + 2:
                    # Advertencia si quedan pocas unidades
                    product_name = cart_item.product.name
                    warnings.append(
                        f'{product_name}: Solo quedan {stock_validation["available_stock"]} unidades disponibles'
                    )
                    
            except Exception as e:
                logger.error(f"Error validando disponibilidad para item {cart_item.id}: {str(e)}")
                errors.append(f'Error al validar disponibilidad del producto: {str(e)}')
        
        return {'errors': errors, 'warnings': warnings}
    
    @staticmethod
    def validate_shipping_address(shipping_address):
        """
        Validar estructura y campos requeridos de la dirección de envío
        
        Args:
            shipping_address: dict con los datos de la dirección
            
        Returns:
            dict: {
                'errors': list of error messages
            }
        """
        errors = []
        
        if not shipping_address:
            # La dirección es opcional en algunos casos, pero si se proporciona debe ser válida
            return {'errors': errors}
        
        if not isinstance(shipping_address, dict):
            errors.append('La dirección de envío debe ser un objeto válido')
            return {'errors': errors}
        
        # Campos requeridos
        required_fields = {
            'first_name': 'Nombre',
            'last_name': 'Apellido',
            'address_line_1': 'Dirección',
            'city': 'Ciudad',
            'postal_code': 'Código postal'
        }
        
        for field, label in required_fields.items():
            if not shipping_address.get(field):
                errors.append(f'El campo {label} es requerido en la dirección de envío')
        
        # Validaciones adicionales
        if shipping_address.get('postal_code'):
            postal_code = str(shipping_address['postal_code']).strip()
            if len(postal_code) < 4:
                errors.append('El código postal debe tener al menos 4 caracteres')
        
        if shipping_address.get('phone'):
            phone = str(shipping_address['phone']).strip()
            if len(phone) < 8:
                errors.append('El teléfono debe tener al menos 8 caracteres')
        
        return {'errors': errors}
