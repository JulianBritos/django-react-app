import json
from rest_framework import serializers
from .models import Product, Category, ProductImages, Attribute, AttributeOption, ProductAttribute, ProductAttributeOptionLink

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
