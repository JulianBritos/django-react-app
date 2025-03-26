from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Product, Category, ProductImages, UserRole

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

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
        uploaded_images = validated_data.pop('uploaded_images', [])  # Extraer imágenes
        product = super().create(validated_data)  # Crear producto

        # Guardar imágenes en ProductImages
        for image in uploaded_images:
            ProductImages.objects.create(product=product, image=image)

        return product


User = get_user_model()
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name', 'email', 'phone', 
            'birth_date', 'address', 'city', 'country', 'role', 'date_joined', 'last_login'
        ]
        read_only_fields = ['role', 'date_joined', 'last_login']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'username', 'password', 'first_name', 'last_name', 'email', 
            'phone', 'birth_date', 'address', 'city', 'country'
        ]

    def create(self, validated_data):
        role = UserRole.objects.get_or_create(name="client")[0]
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            email=validated_data['email'],
            phone=validated_data.get('phone', ''),
            birth_date=validated_data.get('birth_date'),
            address=validated_data.get('address', ''),
            city=validated_data.get('city', ''),
            country=validated_data.get('country', ''),
            role=role # Siempre cliente por defecto al registrarse
        )
        return user

class ExtendedUserSerializer(UserSerializer):
    total_purchases = serializers.IntegerField(read_only=True)
    last_purchase_date = serializers.DateField(read_only=True)
    favorite_payment_method = serializers.CharField(read_only=True)

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + [
            'total_purchases', 'last_purchase_date', 'favorite_payment_method'
        ]