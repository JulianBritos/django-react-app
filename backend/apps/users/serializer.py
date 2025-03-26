from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import User

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
    
        password = validated_data.pop('password')  # Extraer password antes de crear el usuario
        user = User.objects.create(**validated_data)  # Crear usuario sin role
        user.set_password(password)  # Encriptar la contraseña
        user.save()

        return user


class ExtendedUserSerializer(UserSerializer):
    total_purchases = serializers.IntegerField(read_only=True)
    last_purchase_date = serializers.DateField(read_only=True)
    favorite_payment_method = serializers.CharField(read_only=True)

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + [
            'total_purchases', 'last_purchase_date', 'favorite_payment_method'
        ]
