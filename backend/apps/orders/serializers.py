from rest_framework import serializers
from django.contrib.auth import get_user_model
from decimal import Decimal
from .models import Order, OrderItem, OrderStatusHistory
from apps.products.models import Product, ProductAttribute
from apps.products.serializer import ProductSerializer, ProductAttributeSerializer
from apps.carts.models import Cart

User = get_user_model()


class OrderItemSerializer(serializers.ModelSerializer):
    """
    Serializer para items de la orden
    """
    product = ProductSerializer(read_only=True)
    product_attribute = ProductAttributeSerializer(read_only=True)
    
    # Campos calculados
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = OrderItem
        fields = [
            'id', 'order', 'product', 'product_attribute', 'product_name',
            'product_sku', 'unit_price', 'quantity', 'subtotal',
            'product_attributes_snapshot', 'created_at'
        ]
        read_only_fields = ['id', 'order', 'created_at', 'subtotal']


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    """
    Serializer para el historial de estados de la orden
    """
    changed_by_name = serializers.CharField(source='changed_by.get_full_name', read_only=True)

    class Meta:
        model = OrderStatusHistory
        fields = [
            'id', 'order', 'previous_status', 'new_status', 'changed_by',
            'changed_by_name', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'order', 'created_at']


class OrderSerializer(serializers.ModelSerializer):
    """
    Serializer principal para órdenes
    """
    items = OrderItemSerializer(many=True, read_only=True)
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)
    user = serializers.StringRelatedField(read_only=True)
    
    # Información del cliente
    customer_email = serializers.ReadOnlyField()
    customer_name = serializers.ReadOnlyField()
    
    # Información calculada
    items_count = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'user', 'guest_email', 'guest_phone', 'guest_name',
            'status', 'status_display', 'subtotal', 'tax_amount', 'shipping_cost',
            'discount_amount', 'total_amount', 'currency', 'notes',
            'created_at', 'updated_at', 'items', 'status_history',
            'customer_email', 'customer_name', 'items_count'
        ]
        read_only_fields = [
            'id', 'order_number', 'created_at', 'updated_at', 
            'customer_email', 'customer_name', 'items_count'
        ]

    def get_items_count(self, obj):
        """
        Obtener cantidad total de items en la orden
        """
        return obj.items.count()


class OrderCreateSerializer(serializers.ModelSerializer):
    """
    Serializer específico para crear órdenes desde el carrito
    """
    cart_id = serializers.IntegerField(write_only=True, required=False)
    items_data = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False,
        help_text="Lista de items si no se proporciona cart_id"
    )
    
    # Información de envío (para guest checkout)
    shipping_address = serializers.DictField(write_only=True, required=False)

    class Meta:
        model = Order
        fields = [
            'cart_id', 'items_data', 'guest_email', 'guest_phone', 'guest_name',
            'notes', 'shipping_address'
        ]

    def validate(self, data):
        """
        Validar que se proporcione cart_id o items_data
        """
        cart_id = data.get('cart_id')
        items_data = data.get('items_data')
        
        if not cart_id and not items_data:
            raise serializers.ValidationError(
                "Se debe proporcionar cart_id o items_data"
            )
        
        # Si hay cart_id, validar que existe
        if cart_id:
            try:
                cart = Cart.objects.get(id=cart_id)
                if not cart.items.exists():
                    raise serializers.ValidationError("El carrito está vacío")
                data['cart'] = cart
            except Cart.DoesNotExist:
                raise serializers.ValidationError("El carrito no existe")
        
        return data

    def create(self, validated_data):
        """
        Crear orden desde carrito o items directos
        """
        request = self.context.get('request')
        cart = validated_data.pop('cart', None)
        cart_id = validated_data.pop('cart_id', None)  # Remover cart_id también
        items_data = validated_data.pop('items_data', [])
        shipping_address = validated_data.pop('shipping_address', {})
        
        # Crear la orden con los datos restantes
        order = Order.objects.create(
            user=request.user if request.user.is_authenticated else None,
            **validated_data
        )
        
        # Agregar items desde carrito
        if cart:
            self._create_items_from_cart(order, cart)
        
        # Agregar items desde datos directos
        elif items_data:
            self._create_items_from_data(order, items_data)
        
        # Calcular totales
        self._calculate_totals(order)
        
        # Crear historial de estado inicial
        OrderStatusHistory.objects.create(
            order=order,
            new_status='pending',
            notes='Orden creada'
        )
        
        return order

    def _create_items_from_cart(self, order, cart):
        """
        Crear items de la orden desde el carrito
        """
        for cart_item in cart.items.all():
            # Obtener el precio unitario del carrito o calcularlo
            unit_price = cart_item.unit_price
            if not unit_price:
                if cart_item.product_attribute:
                    unit_price = cart_item.product_attribute.selling_price or cart_item.product_attribute.offer_price
                else:
                    unit_price = cart_item.product.initial_buying_price
            
            # Asegurar que el precio sea un Decimal
            if unit_price is None:
                unit_price = Decimal('0')
            else:
                # Convertir FloatField a Decimal
                unit_price = Decimal(str(unit_price))
            
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                product_attribute=cart_item.product_attribute,
                product_name=cart_item.product.name,
                product_sku=cart_item.product_attribute.sku if cart_item.product_attribute else '',
                unit_price=unit_price,
                quantity=cart_item.quantity,
                product_attributes_snapshot=cart_item.selected_attributes
            )

    def _create_items_from_data(self, order, items_data):
        """
        Crear items de la orden desde datos directos
        """
        for item_data in items_data:
            try:
                product = Product.objects.get(id=item_data['product_id'])
                product_attribute = None
                
                if item_data.get('product_attribute_id'):
                    product_attribute = ProductAttribute.objects.get(
                        id=item_data['product_attribute_id']
                    )
                
                unit_price = item_data.get('unit_price')
                if not unit_price and product_attribute:
                    unit_price = product_attribute.selling_price or product_attribute.offer_price
                
                # Asegurar que el precio sea un Decimal
                if unit_price is None:
                    unit_price = Decimal('0')
                else:
                    # Convertir FloatField a Decimal
                    unit_price = Decimal(str(unit_price))
                
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    product_attribute=product_attribute,
                    product_name=product.name,
                    product_sku=product_attribute.sku if product_attribute else '',
                    unit_price=unit_price,
                    quantity=item_data.get('quantity', 1),
                    product_attributes_snapshot=item_data.get('selected_attributes')
                )
            except (Product.DoesNotExist, ProductAttribute.DoesNotExist):
                continue  # Skip invalid items

    def _calculate_totals(self, order):
        """
        Calcular totales de la orden
        """
        subtotal = sum(item.subtotal for item in order.items.all())
        
        # Cálculos básicos (pueden ser más complejos después)
        tax_amount = subtotal * Decimal('0.21')  # IVA 21%
        shipping_cost = Decimal('4.99') if subtotal > 0 else Decimal('0')
        discount_amount = Decimal('0')  # Por ahora sin descuentos
        
        total_amount = subtotal + tax_amount + shipping_cost - discount_amount
        
        # Actualizar orden
        order.subtotal = subtotal
        order.tax_amount = tax_amount
        order.shipping_cost = shipping_cost
        order.discount_amount = discount_amount
        order.total_amount = total_amount
        order.save()


class OrderUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para actualizar órdenes (principalmente estado)
    """
    class Meta:
        model = Order
        fields = ['status', 'notes']

    def update(self, instance, validated_data):
        """
        Actualizar orden y crear historial de cambios
        """
        old_status = instance.status
        new_status = validated_data.get('status', old_status)
        
        # Actualizar orden
        instance = super().update(instance, validated_data)
        
        # Crear historial si cambió el estado
        if old_status != new_status:
            request = self.context.get('request')
            OrderStatusHistory.objects.create(
                order=instance,
                previous_status=old_status,
                new_status=new_status,
                changed_by=request.user if request and request.user.is_authenticated else None,
                notes=f'Estado cambiado de {old_status} a {new_status}'
            )
        
        return instance


class OrderListSerializer(serializers.ModelSerializer):
    """
    Serializer simplificado para listas de órdenes
    """
    customer_email = serializers.ReadOnlyField()
    customer_name = serializers.ReadOnlyField()
    items_count = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'customer_email', 'customer_name',
            'status', 'status_display', 'total_amount', 'currency',
            'created_at', 'items_count'
        ]

    def get_items_count(self, obj):
        return obj.items.count()


class CheckoutSerializer(serializers.Serializer):
    """
    Serializer para el proceso de checkout completo
    """
    cart_id = serializers.IntegerField()
    
    # Información del cliente (para guest checkout)
    guest_email = serializers.EmailField(required=False)
    guest_phone = serializers.CharField(max_length=20, required=False)
    guest_name = serializers.CharField(max_length=255, required=False)
    
    # Información de envío
    shipping_address = serializers.DictField()
    
    # Método de pago
    payment_method = serializers.CharField(max_length=50)
    
    # Notas adicionales
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate_cart_id(self, value):
        """
        Validar que el carrito existe y tiene items
        """
        try:
            cart = Cart.objects.get(id=value)
            if not cart.items.exists():
                raise serializers.ValidationError("El carrito está vacío")
            return value
        except Cart.DoesNotExist:
            raise serializers.ValidationError("El carrito no existe")

    def validate_shipping_address(self, value):
        """
        Validar campos requeridos en la dirección
        """
        required_fields = ['first_name', 'last_name', 'address_line_1', 'city', 'postal_code']
        for field in required_fields:
            if not value.get(field):
                raise serializers.ValidationError(f"El campo {field} es requerido")
        return value

    def validate(self, data):
        """
        Validaciones cruzadas para checkout
        """
        request = self.context.get('request')
        
        # Si no está autenticado, requiere datos de guest
        if not request or not request.user.is_authenticated:
            if not data.get('guest_email'):
                raise serializers.ValidationError(
                    "Se requiere guest_email para checkout sin cuenta"
                )
        
        return data
