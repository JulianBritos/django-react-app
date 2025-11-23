from rest_framework import serializers
from .models import Address, ShippingZone, ShippingMethod, Shipment, TrackingEvent
from apps.orders.models import Order


class AddressSerializer(serializers.ModelSerializer):
    """Serializer para Address"""
    full_name = serializers.ReadOnlyField()
    full_address = serializers.ReadOnlyField()
    
    class Meta:
        model = Address
        fields = [
            'id', 'user', 'first_name', 'last_name', 'company',
            'address_line_1', 'address_line_2', 'city', 'state_province',
            'postal_code', 'country', 'phone', 'address_type',
            'is_default', 'instructions', 'full_name', 'full_address',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, data):
        """Validar que los campos requeridos estén presentes"""
        required_fields = ['first_name', 'last_name', 'address_line_1', 'city', 'postal_code']
        for field in required_fields:
            if not data.get(field):
                raise serializers.ValidationError(f"El campo {field} es requerido")
        return data


class ShippingZoneSerializer(serializers.ModelSerializer):
    """Serializer para ShippingZone"""
    
    class Meta:
        model = ShippingZone
        fields = [
            'id', 'name', 'description', 'countries', 'states_provinces',
            'cities', 'postal_codes', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ShippingMethodSerializer(serializers.ModelSerializer):
    """Serializer para ShippingMethod"""
    shipping_zone_name = serializers.CharField(source='shipping_zone.name', read_only=True)
    estimated_delivery_range = serializers.ReadOnlyField()
    
    class Meta:
        model = ShippingMethod
        fields = [
            'id', 'name', 'code', 'method_type', 'description',
            'shipping_zone', 'shipping_zone_name', 'base_cost', 'cost_per_kg',
            'min_weight', 'max_weight', 'estimated_days_min', 'estimated_days_max',
            'estimated_delivery_range', 'is_active', 'requires_signature',
            'is_insured', 'carrier_config', 'display_order',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_code(self, value):
        """Validar que el código sea único dentro de la zona"""
        shipping_zone = self.initial_data.get('shipping_zone')
        if shipping_zone and self.instance:
            existing = ShippingMethod.objects.filter(
                shipping_zone_id=shipping_zone,
                code=value
            ).exclude(pk=self.instance.pk)
            if existing.exists():
                raise serializers.ValidationError("Ya existe un método con este código en esta zona")
        return value


class TrackingEventSerializer(serializers.ModelSerializer):
    """Serializer para TrackingEvent"""
    event_type_display = serializers.CharField(source='get_event_type_display', read_only=True)
    is_delivery_event = serializers.ReadOnlyField()
    is_exception_event = serializers.ReadOnlyField()
    
    class Meta:
        model = TrackingEvent
        fields = [
            'id', 'shipment', 'event_type', 'event_type_display',
            'description', 'location', 'facility', 'event_datetime',
            'notes', 'carrier_event_code', 'carrier_raw_data',
            'is_delivery_event', 'is_exception_event', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ShipmentSerializer(serializers.ModelSerializer):
    """Serializer para Shipment"""
    shipping_method_name = serializers.CharField(source='shipping_method.name', read_only=True)
    shipping_address_data = AddressSerializer(source='shipping_address', read_only=True)
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_delivered = serializers.ReadOnlyField()
    is_in_transit = serializers.ReadOnlyField()
    delivery_delay_days = serializers.ReadOnlyField()
    tracking_events = TrackingEventSerializer(many=True, read_only=True)
    
    class Meta:
        model = Shipment
        fields = [
            'id', 'order', 'order_number', 'shipping_method', 'shipping_method_name',
            'shipping_address', 'shipping_address_data', 'tracking_number', 'carrier',
            'status', 'status_display', 'shipped_at', 'estimated_delivery_date',
            'actual_delivery_date', 'shipping_cost', 'weight', 'dimensions',
            'notes', 'special_instructions', 'recipient_signature', 'delivered_to',
            'is_delivered', 'is_in_transit', 'delivery_delay_days',
            'tracking_events', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'tracking_number', 'created_at', 'updated_at']
    
    def validate_order(self, value):
        """Validar que la orden exista y no tenga shipment ya"""
        if Shipment.objects.filter(order=value).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise serializers.ValidationError("Esta orden ya tiene un envío asociado")
        return value


class ShipmentCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear Shipment (sin tracking events)"""
    
    class Meta:
        model = Shipment
        fields = [
            'order', 'shipping_method', 'shipping_address', 'carrier',
            'shipping_cost', 'weight', 'dimensions', 'notes', 'special_instructions'
        ]
    
    def validate_order(self, value):
        """Validar que la orden no tenga shipment"""
        if Shipment.objects.filter(order=value).exists():
            raise serializers.ValidationError("Esta orden ya tiene un envío asociado")
        return value


class ShippingCostCalculationSerializer(serializers.Serializer):
    """Serializer para cálculo de costo de envío"""
    address_id = serializers.IntegerField(required=False)
    address_data = AddressSerializer(required=False)
    shipping_method_id = serializers.IntegerField(required=False)
    weight = serializers.DecimalField(max_digits=8, decimal_places=2, default=0)
    declared_value = serializers.DecimalField(max_digits=12, decimal_places=2, default=0)
    product_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        help_text="Lista de IDs de productos para calcular peso total"
    )
    
    def validate(self, data):
        """Validar que se proporcione address o address_data"""
        if not data.get('address_id') and not data.get('address_data'):
            raise serializers.ValidationError("Se requiere address_id o address_data")
        return data


class ShippingCostResponseSerializer(serializers.Serializer):
    """Serializer para respuesta de cálculo de costo"""
    shipping_method = ShippingMethodSerializer()
    cost = serializers.DecimalField(max_digits=10, decimal_places=2)
    estimated_days_min = serializers.IntegerField()
    estimated_days_max = serializers.IntegerField()
    estimated_delivery_range = serializers.CharField()
    is_available = serializers.BooleanField()

