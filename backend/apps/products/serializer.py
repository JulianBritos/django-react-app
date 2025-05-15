from rest_framework import serializers
from .models import Product, Category, ProductImages, Attribute, AttributeOption, ProductAttribute

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
    uploaded_images = ProductImagesSerializer(many=True, read_only=True)
    class Meta:
        model = ProductAttribute
        fields = '__all__'
    
    def validate(self, data):
 
        attributes = set(data.get('attribute', []))  # Convertir en conjunto para acceso rápido
        attribute_options = data.get('attributeoption', [])

        # Crear un diccionario {id_atributo: set(opciones_permitidas)}
        valid_options = {}
        for attribute in attributes:
            valid_options[attribute.id] = set(
                AttributeOption.objects.filter(attribute=attribute).values_list('id', flat=True)
            )
        
        # Verificar que cada opción seleccionada pertenezca a su atributo
        for option in attribute_options:
            if option.attribute_id not in valid_options or option.id not in valid_options[option.attribute_id]:
                raise serializers.ValidationError(
                    f"La opción de atributo '{option.name}' no pertenece a los atributos seleccionados."
            )

        return data


    def create(self, validated_data):

        attributes = validated_data.pop('attribute', None)  # Extraer atributo
        attribute_options = validated_data.pop('attributeoption', [])  # Extraer opciones de atributo
        uploaded_images = validated_data.pop('uploaded_images', [])
        

        product_attribute = ProductAttribute.objects.create(**validated_data)

        if attributes:
            product_attribute.attribute.set(attributes)  # Asignar atributo

        if attribute_options:
            product_attribute.attributeoption.set(attribute_options) 
        
        for image in uploaded_images:
            ProductImages.objects.create(product=product_attribute, image=image)

        return product_attribute
    
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
