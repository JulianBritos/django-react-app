from rest_framework import serializers
from .models import Product, Category, ProductImages, Variant, VariantOption, ProductVariant

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class ProductImagesSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImages
        fields = "__all__"

class VariantOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = VariantOption
        fields = '__all__'


class VariantSerializer(serializers.ModelSerializer):
    options = VariantOptionSerializer(many=True, read_only=True)

    class Meta:
        model = Variant
        fields = '__all__'

class ProductVariantSerializer(serializers.ModelSerializer):
    options = VariantOptionSerializer(many=True, read_only=True)
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())

    option_ids = serializers.PrimaryKeyRelatedField(
        queryset=VariantOption.objects.all(),
        source='options',
        many=True,
        write_only=True
    )
    
    class Meta:
        model = ProductVariant
        fields = '__all__'
    
    def create(self, validated_data):
        options_data = validated_data.pop('options', [])  # Ahora funciona gracias a option_ids
        variant = ProductVariant.objects.create(**validated_data)
        variant.options.set(options_data)
        return variant

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)  # Para mostrar el nombre de la categoría
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',  # Guarda en el campo 'category'
        write_only=True     # Solo al crear/editar
    )
    uploaded_images = ProductImagesSerializer(many=True, read_only=True)

    product_variants = ProductVariantSerializer(many=True, read_only=True)
    variant_ids = serializers.PrimaryKeyRelatedField(
        queryset=Variant.objects.all(),
        source='variants',
        many=True,
        write_only=True
    )
    class Meta:
        model = Product
        fields = '__all__'
    
    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])  # Extraer imágenes
        variants = validated_data.pop('variants', [])  # Extraer variantes
        product = super().create(validated_data)  # Crear producto
        variants = validated_data.pop('variants', [])
        product.variants.set(variants)

        # Guardar imágenes en ProductImages
        for image in uploaded_images:
            ProductImages.objects.create(product=product, image=image)

        return product

