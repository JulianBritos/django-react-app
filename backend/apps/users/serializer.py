from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import User
from django.utils.timezone import now, timedelta
from .models import EmailVerification
from random import randint
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

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

        # Generate a 6-digit verification code
        verification_code = f"{randint(100000, 999999)}"
        expiration_time = now() + timedelta(minutes=2)

        EmailVerification.objects.create(
            user=user,
            verification_code=verification_code,
            expiration_time=expiration_time
        )

        # Send the verification code via email (placeholder for email logic)
        # send_email_verification(user.email, verification_code)

        return user


class ExtendedUserSerializer(UserSerializer):
    total_purchases = serializers.IntegerField(read_only=True)
    last_purchase_date = serializers.DateField(read_only=True)
    favorite_payment_method = serializers.CharField(read_only=True)

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + [
            'total_purchases', 'last_purchase_date', 'favorite_payment_method'
        ]

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['role'] = self.user.role  # Esto agrega el rol a la respuesta del login
        return data
