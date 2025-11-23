from decimal import Decimal
from django.core.exceptions import ValidationError
from .models import Address, ShippingZone, ShippingMethod, Shipment
from apps.products.models import Product, ProductAttribute
from apps.orders.models import Order
import logging

logger = logging.getLogger(__name__)


class ShippingCalculationService:
    """Servicio para cálculo de costos de envío"""
    
    @staticmethod
    def get_shipping_zone_for_address(address):
        """
        Obtener la zona de envío que cubre una dirección
        """
        zones = ShippingZone.objects.filter(is_active=True)
        
        for zone in zones:
            if zone.covers_address(address):
                return zone
        
        return None
    
    @staticmethod
    def calculate_product_weight(product_ids):
        """
        Calcular peso total de una lista de productos
        Por ahora retorna un peso estimado basado en la cantidad de productos
        TODO: Agregar campo weight a Product en el futuro
        """
        if not product_ids:
            return Decimal('0')
        
        # Peso estimado por producto (en kg)
        # En una implementación real, esto vendría del modelo Product
        estimated_weight_per_product = Decimal('0.5')  # 500g por producto
        
        return Decimal(len(product_ids)) * estimated_weight_per_product
    
    @staticmethod
    def get_available_shipping_methods(address, weight=Decimal('0'), declared_value=Decimal('0')):
        """
        Obtener métodos de envío disponibles para una dirección
        """
        # Obtener zona de envío
        shipping_zone = ShippingCalculationService.get_shipping_zone_for_address(address)
        
        if not shipping_zone:
            logger.warning(f"No se encontró zona de envío para dirección: {address.full_address}")
            return []
        
        # Obtener métodos de envío activos para esta zona
        methods = ShippingMethod.objects.filter(
            shipping_zone=shipping_zone,
            is_active=True
        ).order_by('display_order', 'base_cost')
        
        # Filtrar por peso si es necesario
        available_methods = []
        for method in methods:
            if method.is_available_for_weight(weight):
                available_methods.append(method)
        
        return available_methods
    
    @staticmethod
    def calculate_shipping_cost(shipping_method, address, weight=Decimal('0'), declared_value=Decimal('0')):
        """
        Calcular costo de envío para un método específico
        """
        # Verificar que el método está disponible para esta dirección
        shipping_zone = ShippingCalculationService.get_shipping_zone_for_address(address)
        if not shipping_zone or shipping_method.shipping_zone != shipping_zone:
            raise ValidationError("El método de envío no está disponible para esta dirección")
        
        # Calcular costo usando el método del modelo
        cost = shipping_method.calculate_shipping_cost(weight, declared_value)
        
        return cost
    
    @staticmethod
    def get_shipping_options_for_address(address, product_ids=None, weight=None, declared_value=Decimal('0')):
        """
        Obtener todas las opciones de envío disponibles para una dirección
        """
        # Calcular peso si se proporcionan productos
        if product_ids and weight is None:
            weight = ShippingCalculationService.calculate_product_weight(product_ids)
        elif weight is None:
            weight = Decimal('0')
        
        # Obtener métodos disponibles
        methods = ShippingCalculationService.get_available_shipping_methods(address, weight, declared_value)
        
        # Calcular costos para cada método
        options = []
        for method in methods:
            try:
                cost = ShippingCalculationService.calculate_shipping_cost(
                    method, address, weight, declared_value
                )
                
                options.append({
                    'shipping_method': method,
                    'cost': cost,
                    'estimated_days_min': method.estimated_days_min,
                    'estimated_days_max': method.estimated_days_max,
                    'estimated_delivery_range': method.estimated_delivery_range,
                    'is_available': True,
                })
            except ValidationError as e:
                logger.warning(f"Error calculando costo para método {method.code}: {str(e)}")
                options.append({
                    'shipping_method': method,
                    'cost': Decimal('0'),
                    'estimated_days_min': method.estimated_days_min,
                    'estimated_days_max': method.estimated_days_max,
                    'estimated_delivery_range': method.estimated_delivery_range,
                    'is_available': False,
                    'error': str(e)
                })
        
        return options


class ShipmentService:
    """Servicio para gestión de envíos"""
    
    @staticmethod
    def create_shipment_for_order(order, shipping_method=None, shipping_address=None, **kwargs):
        """
        Crear shipment automáticamente para una orden
        """
        # Verificar que la orden no tenga shipment ya
        if hasattr(order, 'shipment'):
            raise ValidationError("Esta orden ya tiene un envío asociado")
        
        # Si no se proporciona dirección, usar la dirección del usuario o guest
        if not shipping_address:
            if order.user:
                # Intentar obtener dirección default del usuario
                shipping_address = order.user.addresses.filter(
                    address_type__in=['shipping', 'both'],
                    is_default=True
                ).first()
                
                if not shipping_address:
                    # Obtener cualquier dirección de envío
                    shipping_address = order.user.addresses.filter(
                        address_type__in=['shipping', 'both']
                    ).first()
        
        # Si no se proporciona método, obtener el primero disponible
        if not shipping_method and shipping_address:
            options = ShippingCalculationService.get_shipping_options_for_address(shipping_address)
            if options:
                shipping_method = options[0]['shipping_method']
                kwargs.setdefault('shipping_cost', options[0]['cost'])
        
        # Calcular peso total de la orden
        weight = Decimal('0')
        for item in order.items.all():
            # Peso estimado por item
            estimated_weight_per_item = Decimal('0.5')  # 500g por item
            weight += estimated_weight_per_item * Decimal(item.quantity)
        
        kwargs.setdefault('weight', weight)
        
        # Crear shipment
        shipment = Shipment.objects.create(
            order=order,
            shipping_method=shipping_method,
            shipping_address=shipping_address,
            shipping_cost=kwargs.get('shipping_cost', Decimal('0')),
            weight=kwargs.get('weight', weight),
            status='pending',
            **{k: v for k, v in kwargs.items() if k not in ['shipping_cost', 'weight']}
        )
        
        logger.info(f"Shipment {shipment.tracking_number} creado para orden {order.order_number}")
        return shipment
    
    @staticmethod
    def update_shipment_status(shipment, new_status, notes=None):
        """
        Actualizar estado de un shipment y crear evento de tracking
        """
        from .models import TrackingEvent
        from django.utils import timezone
        
        old_status = shipment.status
        shipment.status = new_status
        
        # Actualizar fechas según el estado
        if new_status == 'shipped' and not shipment.shipped_at:
            shipment.shipped_at = timezone.now()
        
        if new_status == 'delivered' and not shipment.actual_delivery_date:
            shipment.actual_delivery_date = timezone.now()
        
        shipment.save()
        
        # Mapear estados a tipos de evento
        status_event_map = {
            'shipped': 'picked_up',
            'in_transit': 'in_transit',
            'out_for_delivery': 'out_for_delivery',
            'delivered': 'delivered',
            'failed_delivery': 'delivery_attempted',
            'returned': 'returned_to_sender',
        }
        
        event_type = status_event_map.get(new_status, 'created')
        
        # Crear evento de tracking
        TrackingEvent.objects.create(
            shipment=shipment,
            event_type=event_type,
            description=notes or f"Estado cambiado de {old_status} a {new_status}",
            event_datetime=timezone.now()
        )
        
        logger.info(f"Estado de shipment {shipment.tracking_number} actualizado: {old_status} -> {new_status}")
        return shipment

