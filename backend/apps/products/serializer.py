from rest_framework import serializers
from .models import Product, Category, ProductImages, ProductVariant, Attribute, AttributeOption, ProductAttribute

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"

class ProductImagesSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImages
        fields = "__all__"

class AttributeOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttributeOption
        fields = '__all__'

class AttributeSerializer(serializers.ModelSerializer):
    options = AttributeOptionSerializer(many=True, read_only=True)  # Lista las opciones del atributo

    class Meta:
        model = Attribute
        fields = '__all__'


class ProductAttributeSerializer(serializers.ModelSerializer):
    attribute = AttributeSerializer(read_only=True)  # Detalle del atributo
    attribute_id = serializers.PrimaryKeyRelatedField(
        queryset=Attribute.objects.all(), source="attribute", write_only=True
    )  # Para creación/edición

    class Meta:
        model = ProductAttribute
        fields = ['id', 'product', 'attribute', 'attribute_id']


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)  # Para mostrar el nombre de la categoría
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source="category",  # Guarda en el campo 'category'
        write_only=True     # Solo al crear/editar
    )
    attributes = ProductAttributeSerializer(many=True, read_only=True)  # Lista atributos
    uploaded_images = ProductImagesSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = '__all__'
    
    def create(self, validated_data):
        request = self.context.get('request')
        uploaded_images = request.FILES.getlist('uploaded_images')  # Extraer imágenes
        product = Product.objects.create(**validated_data)   # Crear producto

        # Guardar imágenes en ProductImages
        for image in uploaded_images:
            ProductImages.objects.create(product=product, image=image)

        return product

class ProductVariantSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)  # Muestra detalles del producto
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source="product", write_only=True
    )  # Para creación/edición
    options = AttributeOptionSerializer(many=True, read_only=True)  # Lista opciones seleccionadas
    options_ids = serializers.PrimaryKeyRelatedField(
        queryset=AttributeOption.objects.all(), source="options", many=True, write_only=True
    )  # Para crear variantes con opciones

    class Meta:
        model = ProductVariant
        fields = ['id', 'product', 'product_id', 'options', 'options_ids', 'price', 'stock', 'sku']