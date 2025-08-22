from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Cart, CartItem, Wishlist, WishlistItem, SavedForLater, RecentlyViewed
from apps.products.models import Product, ProductAttribute
from apps.products.serializer import ProductSerializer, ProductAttributeSerializer

User = get_user_model()


class CartItemSerializer(serializers.ModelSerializer):
    """
    Serializer para items del carrito
    """
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    product_attribute = ProductAttributeSerializer(read_only=True)
    product_attribute_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    # Campos calculados
    subtotal = serializers.ReadOnlyField()
    
    # Información del producto para el frontend
    name = serializers.CharField(source='product.name', read_only=True)
    image = serializers.SerializerMethodField()
    price = serializers.DecimalField(source='unit_price', max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = [
            'id', 'cart', 'product', 'product_id', 'product_attribute', 
            'product_attribute_id', 'quantity', 'unit_price', 'selected_attributes',
            'notes', 'subtotal', 'added_at', 'updated_at',
            # Campos para el frontend
            'name', 'image', 'price'
        ]
        read_only_fields = ['id', 'cart', 'added_at', 'updated_at', 'unit_price']

    def get_image(self, obj):
        """
        Obtener la primera imagen del producto o atributo
        """
        if obj.product_attribute and obj.product_attribute.uploaded_images.exists():
            image = obj.product_attribute.uploaded_images.first()
            if image and image.image:
                return image.image.url
        
        # Si no hay imagen en el atributo, buscar en el producto principal
        if obj.product.product_attributes.exists():
            for attr in obj.product.product_attributes.all():
                if attr.uploaded_images.exists():
                    image = attr.uploaded_images.first()
                    if image and image.image:
                        return image.image.url
        
        return None

    def validate_product_id(self, value):
        """
        Validar que el producto existe
        """
        try:
            Product.objects.get(id=value)
        except Product.DoesNotExist:
            raise serializers.ValidationError("El producto no existe")
        return value

    def validate_product_attribute_id(self, value):
        """
        Validar que el atributo del producto existe (si se proporciona)
        """
        if value is not None:
            try:
                ProductAttribute.objects.get(id=value)
            except ProductAttribute.DoesNotExist:
                raise serializers.ValidationError("El atributo del producto no existe")
        return value

    def validate_quantity(self, value):
        """
        Validar cantidad positiva
        """
        if value <= 0:
            raise serializers.ValidationError("La cantidad debe ser mayor a 0")
        return value


class CartSerializer(serializers.ModelSerializer):
    """
    Serializer principal para el carrito
    """
    items = CartItemSerializer(many=True, read_only=True)
    user = serializers.StringRelatedField(read_only=True)
    
    # Campos calculados
    total_items = serializers.ReadOnlyField()
    total_amount = serializers.ReadOnlyField()
    is_expired = serializers.ReadOnlyField()
    
    # Información para el frontend
    subtotal = serializers.SerializerMethodField()
    shipping_cost = serializers.SerializerMethodField()
    total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = [
            'id', 'user', 'session_id', 'status', 'currency', 'expires_at',
            'created_at', 'updated_at', 'items', 'total_items', 'total_amount',
            'is_expired', 'subtotal', 'shipping_cost', 'total'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'session_id']

    def get_subtotal(self, obj):
        """
        Calcular subtotal del carrito con validación
        """
        try:
            return obj.total_amount or 0
        except Exception as e:
            # logger.error(f"Error calculando subtotal: {e}") # Assuming logger is available
            return 0

    def get_shipping_cost(self, obj):
        """
        Calcular costo de envío (lógica básica por ahora)
        """
        if obj.total_amount > 0:
            return 4.99  # Costo fijo por ahora
        return 0

    def get_total(self, obj):
        """
        Calcular total incluyendo envío
        """
        subtotal = obj.total_amount
        shipping = self.get_shipping_cost(obj)
        return subtotal + shipping


class CartItemCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer específico para crear/actualizar items del carrito
    """
    product_id = serializers.IntegerField()
    product_attribute_id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = CartItem
        fields = [
            'product_id', 'product_attribute_id', 'quantity', 
            'selected_attributes', 'notes'
        ]

    def validate_product_id(self, value):
        """
        Validar que el producto existe y está activo
        """
        try:
            product = Product.objects.get(id=value)
            if product.status != 'ACTIVE':
                raise serializers.ValidationError("El producto no está disponible")
        except Product.DoesNotExist:
            raise serializers.ValidationError("El producto no existe")
        return value

    def validate_product_attribute_id(self, value):
        """
        Validar que el atributo existe y tiene stock
        """
        if value is not None:
            try:
                attr = ProductAttribute.objects.get(id=value)
                if attr.stock <= 0:
                    raise serializers.ValidationError("El producto no tiene stock disponible")
            except ProductAttribute.DoesNotExist:
                raise serializers.ValidationError("La variante del producto no existe")
        return value

    def validate(self, data):
        """
        Validaciones cruzadas
        """
        product_id = data.get('product_id')
        product_attribute_id = data.get('product_attribute_id')
        quantity = data.get('quantity', 1)

        # Validar que si se proporciona un atributo, pertenece al producto
        if product_attribute_id:
            try:
                attr = ProductAttribute.objects.get(id=product_attribute_id)
                if attr.product.id != product_id:
                    raise serializers.ValidationError(
                        "El atributo no pertenece al producto seleccionado"
                    )
                
                # Validar stock disponible
                if attr.stock < quantity:
                    raise serializers.ValidationError(
                        f"Solo hay {attr.stock} unidades disponibles"
                    )
            except ProductAttribute.DoesNotExist:
                raise serializers.ValidationError("La variante del producto no existe")

        return data


class WishlistItemSerializer(serializers.ModelSerializer):
    """
    Serializer para items de la lista de deseos
    """
    product = ProductSerializer(read_only=True)
    product_attribute = ProductAttributeSerializer(read_only=True)

    class Meta:
        model = WishlistItem
        fields = [
            'id', 'wishlist', 'product', 'product_attribute', 
            'selected_attributes', 'priority', 'notes', 'added_at'
        ]
        read_only_fields = ['id', 'wishlist', 'added_at']


class WishlistSerializer(serializers.ModelSerializer):
    """
    Serializer para listas de deseos
    """
    items = WishlistItemSerializer(many=True, read_only=True)
    total_items = serializers.ReadOnlyField()

    class Meta:
        model = Wishlist
        fields = [
            'id', 'user', 'name', 'is_public', 'created_at', 
            'updated_at', 'items', 'total_items'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class RecentlyViewedSerializer(serializers.ModelSerializer):
    """
    Serializer para productos vistos recientemente
    """
    product = ProductSerializer(read_only=True)

    class Meta:
        model = RecentlyViewed
        fields = [
            'id', 'user', 'session_id', 'product', 'view_count',
            'first_viewed_at', 'last_viewed_at'
        ]
        read_only_fields = [
            'id', 'user', 'session_id', 'view_count', 
            'first_viewed_at', 'last_viewed_at'
        ]
