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
    uploaded_images = ProductImagesSerializer(many=True, read_only=True)
    attribute_options = serializers.ListField(
        child=serializers.CharField(), write_only=True,
        required=False,
        help_text='Lista de objetos JSON string con clave "attribute" y "option"'
    )
    attributes = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductAttribute
        fields = '__all__'

    def create(self, validated_data):
        attribute_option_data = validated_data.pop('attribute_options', [])
        uploaded_images = validated_data.pop('uploaded_images', [])

        product_attribute = ProductAttribute.objects.create(**validated_data)

        for link_str in attribute_option_data:
            parsed = json.loads(link_str)
            attribute_id = parsed["attribute"]
            option_id = parsed["option"]

            # Validación de consistencia atributo-opción
            if not AttributeOption.objects.filter(id=option_id, attribute_id=attribute_id).exists():
                raise serializers.ValidationError(
                    f"La opción {option_id} no pertenece al atributo {attribute_id}."
                )

            ProductAttributeOptionLink.objects.create(
                product_attribute=product_attribute,
                attribute_id=attribute_id,
                option_id=option_id
            )

        for image in uploaded_images:
            ProductImages.objects.create(productattribute=product_attribute, image=image)

        return product_attribute

    def get_attributes(self, obj):
        links = ProductAttributeOptionLink.objects.filter(product_attribute=obj)
        return [
            {
                "attribute_id": link.attribute.id,
                "attribute_name": link.attribute.name,
                "option_id": link.option.id,
                "option_name": link.option.name,
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
    option_name = serializers.CharField(source="option.name", read_only=True)

    class Meta:
        model = ProductAttributeOptionLink
        fields = ['id', 'attribute', 'option', 'attribute_name', 'option_name']
