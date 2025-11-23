from django.db import transaction
from django.db.models import F
from django.core.exceptions import ValidationError
from django.utils import timezone
from decimal import Decimal
from .models import Product, ProductAttribute, StockMovement
import logging

logger = logging.getLogger(__name__)


class InventoryService:
    """Servicio para gestión de inventario y movimientos de stock"""
    
    @staticmethod
    @transaction.atomic
    def create_stock_movement(product, quantity, movement_type, product_attribute=None,
                             order=None, user=None, notes=None, reference_number=None):
        """
        Crear movimiento de stock y actualizar inventario
        """
        if product_attribute is None:
            # Si no se especifica atributo, usar el primero disponible
            product_attribute = product.product_attributes.first()
            if not product_attribute:
                raise ValidationError(f"No hay atributos de producto para {product.name}")
        
        stock_before = product_attribute.stock
        
        # Para ventas (cantidad negativa), verificar stock antes de actualizar
        if quantity < 0:
            if stock_before < abs(quantity):
                raise ValidationError(
                    f"Stock insuficiente. Stock actual: {stock_before}, cantidad solicitada: {abs(quantity)}"
                )
        
        stock_after = stock_before + quantity
        
        if stock_after < 0:
            raise ValidationError(
                f"Stock insuficiente. Stock actual: {stock_before}, cantidad solicitada: {abs(quantity)}"
            )
        
        # Actualizar stock
        product_attribute.stock = stock_after
        product_attribute.save()
        
        # Crear registro de movimiento
        movement = StockMovement.objects.create(
            product=product,
            product_attribute=product_attribute,
            movement_type=movement_type,
            quantity=quantity,
            stock_before=stock_before,
            stock_after=stock_after,
            order=order,
            user=user,
            notes=notes,
            reference_number=reference_number
        )
        
        logger.info(
            f"Movimiento de stock creado: {movement_type} - "
            f"{product.name} - Cantidad: {quantity} - "
            f"Stock: {stock_before} -> {stock_after}"
        )
        
        return movement
    
    @staticmethod
    @transaction.atomic
    def adjust_stock(product_attribute, new_quantity, user=None, notes=None):
        """
        Ajustar stock manualmente
        """
        if new_quantity < 0:
            raise ValidationError("El stock no puede ser negativo")
        
        product = product_attribute.product
        current_stock = product_attribute.stock
        quantity_diff = new_quantity - current_stock
        
        if quantity_diff == 0:
            logger.info(f"No hay cambio en el stock de {product.name}")
            return None
        
        movement = InventoryService.create_stock_movement(
            product=product,
            quantity=quantity_diff,
            movement_type='adjustment',
            product_attribute=product_attribute,
            user=user,
            notes=notes or f"Ajuste manual de stock de {current_stock} a {new_quantity}"
        )
        
        return movement
    
    @staticmethod
    @transaction.atomic
    def record_sale(product, product_attribute, quantity, order):
        """
        Registrar venta de producto
        """
        movement = InventoryService.create_stock_movement(
            product=product,
            quantity=-quantity,  # Negativo porque es salida
            movement_type='sale',
            product_attribute=product_attribute,
            order=order,
            notes=f"Venta de {quantity} unidades - Orden {order.order_number}"
        )
        
        return movement
    
    @staticmethod
    @transaction.atomic
    def record_purchase(product, product_attribute, quantity, user=None, reference_number=None, notes=None):
        """
        Registrar compra/entrada de producto
        """
        movement = InventoryService.create_stock_movement(
            product=product,
            quantity=quantity,  # Positivo porque es entrada
            movement_type='purchase',
            product_attribute=product_attribute,
            user=user,
            reference_number=reference_number,
            notes=notes or f"Compra de {quantity} unidades"
        )
        
        return movement
    
    @staticmethod
    @transaction.atomic
    def record_return(product, product_attribute, quantity, order, notes=None):
        """
        Registrar devolución de producto
        """
        movement = InventoryService.create_stock_movement(
            product=product,
            quantity=quantity,  # Positivo porque es entrada
            movement_type='return',
            product_attribute=product_attribute,
            order=order,
            notes=notes or f"Devolución de {quantity} unidades - Orden {order.order_number}"
        )
        
        return movement
    
    @staticmethod
    def get_stock_history(product_attribute, limit=50):
        """
        Obtener historial de movimientos de stock
        """
        return StockMovement.objects.filter(
            product_attribute=product_attribute
        ).select_related('product', 'order', 'user').order_by('-created_at')[:limit]
    
    @staticmethod
    def check_low_stock_alerts():
        """
        Verificar productos con stock bajo y retornar alertas
        """
        low_stock_items = ProductAttribute.objects.filter(
            stock__lte=F('stock_alert'),
            stock__gt=0
        ).select_related('product')
        
        alerts = []
        for item in low_stock_items:
            alerts.append({
                'product_id': item.product.id,
                'product_name': item.product.name,
                'sku': item.sku,
                'current_stock': item.stock,
                'alert_threshold': item.stock_alert,
                'product_attribute_id': item.id
            })
        
        return alerts


class StockAlertService:
    """Servicio para gestión de alertas de stock bajo"""
    
    @staticmethod
    def check_and_notify_low_stock():
        """
        Verificar stock bajo y enviar notificaciones
        """
        from apps.notifications.services import NotificationService
        from apps.notifications.models import NotificationTemplate
        
        alerts = InventoryService.check_low_stock_alerts()
        
        # Obtener template de notificación de stock bajo
        template = NotificationService.get_template('low_stock', 'email')
        
        if not template:
            logger.warning("No se encontró template de notificación para stock bajo")
            return alerts
        
        # Enviar notificaciones a administradores
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        admins = User.objects.filter(
            role='admin',
            is_active=True
        )
        
        for admin in admins:
            for alert in alerts:
                context = {
                    'product_name': alert['product_name'],
                    'sku': alert['sku'],
                    'current_stock': alert['current_stock'],
                    'alert_threshold': alert['alert_threshold'],
                    'admin_name': admin.first_name
                }
                
                NotificationService.send_immediate_notification(
                    trigger_event='low_stock',
                    recipient_email=admin.email,
                    recipient_name=admin.get_full_name(),
                    recipient_user=admin,
                    context=context
                )
        
        logger.info(f"Verificadas {len(alerts)} alertas de stock bajo")
        return alerts

