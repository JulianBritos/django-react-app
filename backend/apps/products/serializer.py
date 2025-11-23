import json
from rest_framework import serializers
from django.core.exceptions import ValidationError
from .models import (
    Product, Category, ProductImages, Attribute, AttributeOption, 
    ProductAttribute, ProductAttributeOptionLink, ProductReview, 
    ReviewHelpful, RelatedProduct, StockMovement
)

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"

class AttributeOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttributeOption
        fields = "__all__"

class AttributeSerializer(serializers.ModelSerializer):
    attributeoption_set = AttributeOptionSerializer(many=True, read_only=True)
    class Meta:
        model = Attribute
        fields = "__all__"
class ProductImagesSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImages
        fields = "__all__"

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)  # Para mostrar el nombre de la categoría
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',  # Guarda en el campo 'category'
        write_only=True     # Solo al crear/editar
    )
    uploaded_images = ProductImagesSerializer(many=True, read_only=True)
    class Meta:
        model = Product
        fields = '__all__'
    
    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])

        product = super().create(validated_data)

        for image in uploaded_images:
            ProductImages.objects.create(product=product, image=image)

        return product

class ProductAttributeSerializer(serializers.ModelSerializer):
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )
    images = ProductImagesSerializer(many=True, read_only=True, source='uploaded_images')
    attribute = serializers.IntegerField(write_only=True, required=False)
    attributeoption = serializers.IntegerField(write_only=True, required=False)
    attributes = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductAttribute
        fields = '__all__'

    def create(self, validated_data):
        # Remover campos de atributos si están presentes (se manejan por separado)
        validated_data.pop('attribute', None)
        validated_data.pop('attributeoption', None)
        uploaded_images = validated_data.pop('uploaded_images', [])

        product_attribute = ProductAttribute.objects.create(**validated_data)

        for image in uploaded_images:
            ProductImages.objects.create(productattribute=product_attribute, image=image)

        return product_attribute

    def get_attributes(self, obj):
        links = ProductAttributeOptionLink.objects.filter(product_attribute=obj)
        return [
            {
                "attribute_id": link.attribute.id,
                "attribute_name": link.attribute.name,
                "option_id": link.attributeoption.id,
                "option_name": link.attributeoption.name,
            }
            for link in links
        ]

class ProductWithAttributesSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True
    )
    product_attributes = ProductAttributeSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = '__all__'

class ProductAttributeOptionLinkSerializer(serializers.ModelSerializer):
    attribute_name = serializers.CharField(source="attribute.name", read_only=True)
    option_name = serializers.CharField(source="attributeoption.name", read_only=True)

    class Meta:
        model = ProductAttributeOptionLink
        fields = ['id', 'product_attribute', 'attribute', 'attributeoption', 'attribute_name', 'option_name']
        extra_kwargs = {
            'product_attribute': {'required': True},
            'attribute': {'required': True},
            'attributeoption': {'required': True}
        }

    def create(self, validated_data):
        print("ProductAttributeOptionLinkSerializer - validated_data:", validated_data)
        print("ProductAttributeOptionLinkSerializer - tipos de datos:")
        for key, value in validated_data.items():
            print(f"  {key}: {value} (tipo: {type(value)})")
        
        # Validar que la opción pertenece al atributo
        attribute_id = validated_data.get('attribute')
        option_id = validated_data.get('attributeoption')
        
        print("ProductAttributeOptionLinkSerializer - attribute_id:", attribute_id, "type:", type(attribute_id))
        print("ProductAttributeOptionLinkSerializer - option_id:", option_id, "type:", type(option_id))
        
        # Si se pasan IDs en lugar de objetos, convertirlos
        if isinstance(attribute_id, int):
            try:
                attribute_id = Attribute.objects.get(id=attribute_id)
                print("Atributo encontrado:", attribute_id.name)
            except Attribute.DoesNotExist:
                raise serializers.ValidationError(f"El atributo con ID {attribute_id} no existe.")
        
        if isinstance(option_id, int):
            try:
                option_id = AttributeOption.objects.get(id=option_id)
                print("Opción encontrada:", option_id.name)
            except AttributeOption.DoesNotExist:
                raise serializers.ValidationError(f"La opción con ID {option_id} no existe.")
        
        print("ProductAttributeOptionLinkSerializer - después de conversión:")
        print("  attribute_id:", attribute_id, "type:", type(attribute_id))
        print("  option_id:", option_id, "type:", type(option_id))
        
        # Validar que la opción pertenece al atributo
        if not AttributeOption.objects.filter(id=option_id.id, attribute_id=attribute_id.id).exists():
            raise serializers.ValidationError(
                f"La opción {option_id.id} no pertenece al atributo {attribute_id.id}."
            )
        
        validated_data['attribute'] = attribute_id
        validated_data['attributeoption'] = option_id
        
        print("ProductAttributeOptionLinkSerializer - datos finales para crear:", validated_data)
        
        return super().create(validated_data)


class ProductReviewSerializer(serializers.ModelSerializer):
    """Serializer para ProductReview"""
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()
    product_name = serializers.CharField(source='product.name', read_only=True)
    rating_display = serializers.CharField(source='get_rating_display', read_only=True)
    is_helpful_by_user = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductReview
        fields = [
            'id', 'product', 'product_name', 'user', 'user_email', 'user_name',
            'order_item', 'rating', 'rating_display', 'comment', 'title',
            'is_approved', 'is_verified_purchase', 'helpful_count',
            'not_helpful_count', 'is_helpful_by_user', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'helpful_count', 'not_helpful_count', 'created_at', 'updated_at']
    
    def get_user_name(self, obj):
        """Obtener nombre del usuario"""
        if obj.user:
            return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.email
        return 'Anónimo'
    
    def get_is_helpful_by_user(self, obj):
        """Verificar si el usuario actual marcó esta reseña como útil"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            vote = ReviewHelpful.objects.filter(review=obj, user=request.user).first()
            if vote:
                return vote.is_helpful
        return None
    
    def validate(self, data):
        """Validar que el usuario haya comprado el producto si se requiere"""
        user = data.get('user') or (self.context.get('request').user if self.context.get('request') else None)
        product = data.get('product')
        order_item = data.get('order_item')
        
        # Si hay order_item, verificar que pertenezca al usuario y producto
        if order_item:
            if order_item.product != product:
                raise ValidationError("El item de orden no corresponde al producto")
            if user and order_item.order.user != user:
                raise ValidationError("El item de orden no pertenece al usuario")
        else:
            # Si no hay order_item pero hay user, intentar verificar compra
            if user and product:
                from apps.orders.models import OrderItem
                has_purchase = OrderItem.objects.filter(
                    order__user=user,
                    product=product,
                    order__status__in=['confirmed', 'processing', 'shipped', 'delivered']
                ).exists()
                
                # Permitir reseñas sin verificación de compra, pero marcarlas como no verificadas
                if not has_purchase:
                    data['is_verified_purchase'] = False
        
        return data
    
    def create(self, validated_data):
        """Crear reseña con usuario del request si no se proporciona"""
        request = self.context.get('request')
        if request and request.user.is_authenticated and 'user' not in validated_data:
            validated_data['user'] = request.user
        
        review = super().create(validated_data)
        
        # Actualizar rating promedio del producto
        ProductReview.update_product_rating(review.product)
        
        return review


class ProductReviewCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear reseñas"""
    
    class Meta:
        model = ProductReview
        fields = [
            'product', 'order_item', 'rating', 'comment', 'title'
        ]
    
    def validate(self, data):
        """Validar que el usuario haya comprado el producto"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            raise ValidationError("Debes estar autenticado para crear una reseña")
        
        user = request.user
        product = data.get('product')
        order_item = data.get('order_item')
        
        # Si hay order_item, verificar que pertenezca al usuario
        if order_item:
            if order_item.order.user != user:
                raise ValidationError("El item de orden no pertenece al usuario")
            if order_item.product != product:
                raise ValidationError("El item de orden no corresponde al producto")
        
        # Verificar que el usuario haya comprado el producto
        from apps.orders.models import OrderItem
        has_purchase = OrderItem.objects.filter(
            order__user=user,
            product=product,
            order__status__in=['confirmed', 'processing', 'shipped', 'delivered']
        ).exists()
        
        if not has_purchase and not order_item:
            raise ValidationError("Solo puedes reseñar productos que hayas comprado")
        
        # Verificar que no haya una reseña existente para este producto/usuario/order_item
        existing_review = ProductReview.objects.filter(
            product=product,
            user=user,
            order_item=order_item
        ).exists()
        
        if existing_review:
            raise ValidationError("Ya has creado una reseña para este producto/orden")
        
        return data
    
    def create(self, validated_data):
        """Crear reseña con usuario del request"""
        request = self.context.get('request')
        validated_data['user'] = request.user
        
        # Si hay order_item, marcar como compra verificada
        if validated_data.get('order_item'):
            validated_data['is_verified_purchase'] = True
        
        review = super().create(validated_data)
        
        # Actualizar rating promedio del producto
        ProductReview.update_product_rating(review.product)
        
        return review


class ReviewHelpfulSerializer(serializers.ModelSerializer):
    """Serializer para ReviewHelpful"""
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = ReviewHelpful
        fields = ['id', 'review', 'user', 'user_email', 'is_helpful', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def validate(self, data):
        """Validar que el usuario no sea el autor de la reseña"""
        request = self.context.get('request')
        review = data.get('review')
        
        if request and request.user.is_authenticated:
            if review.user == request.user:
                raise ValidationError("No puedes marcar tu propia reseña como útil")
        
        return data
    
    def create(self, validated_data):
        """Crear o actualizar voto útil"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['user'] = request.user
        
        review = validated_data['review']
        is_helpful = validated_data['is_helpful']
        
        # Obtener o crear voto
        vote, created = ReviewHelpful.objects.get_or_create(
            review=review,
            user=validated_data['user'],
            defaults={'is_helpful': is_helpful}
        )
        
        if not created:
            # Actualizar voto existente
            old_helpful = vote.is_helpful
            vote.is_helpful = is_helpful
            vote.save()
            
            # Actualizar contadores
            if old_helpful != is_helpful:
                if old_helpful:
                    review.helpful_count = max(0, review.helpful_count - 1)
                    review.not_helpful_count += 1
                else:
                    review.not_helpful_count = max(0, review.not_helpful_count - 1)
                    review.helpful_count += 1
                review.save()
        else:
            # Incrementar contador apropiado
            if is_helpful:
                review.helpful_count += 1
            else:
                review.not_helpful_count += 1
            review.save()
        
        return vote


class RelatedProductSerializer(serializers.ModelSerializer):
    """Serializer para RelatedProduct"""
    related_product_name = serializers.CharField(source='related_product.name', read_only=True)
    related_product_data = ProductSerializer(source='related_product', read_only=True)
    relation_type_display = serializers.CharField(source='get_relation_type_display', read_only=True)
    
    class Meta:
        model = RelatedProduct
        fields = [
            'id', 'product', 'related_product', 'related_product_name',
            'related_product_data', 'relation_type', 'relation_type_display',
            'display_order', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def validate(self, data):
        """Validar que el producto relacionado sea diferente"""
        product = data.get('product', self.instance.product if self.instance else None)
        related_product = data.get('related_product', self.instance.related_product if self.instance else None)
        
        if product and related_product and product == related_product:
            raise ValidationError("Un producto no puede estar relacionado consigo mismo")
        
        return data


class StockMovementSerializer(serializers.ModelSerializer):
    """Serializer para StockMovement"""
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_attribute_sku = serializers.CharField(source='product_attribute.sku', read_only=True)
    movement_type_display = serializers.CharField(source='get_movement_type_display', read_only=True)
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = StockMovement
        fields = [
            'id', 'product', 'product_name', 'product_attribute', 'product_attribute_sku',
            'movement_type', 'movement_type_display', 'quantity', 'stock_before',
            'stock_after', 'order', 'order_number', 'user', 'user_email',
            'notes', 'reference_number', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
