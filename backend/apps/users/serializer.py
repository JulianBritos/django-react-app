from rest_framework import serializers
from .models import CustomUserModel

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUserModel
        fields = [
            'id', 'email', 'first_name', 'last_name', 'username',
            'phone', 'birth_date', 'address', 'city', 'country',
            'is_active', 'is_staff', 'is_superuser', 'role',
            'date_joined', 'last_login', 'profile_picture'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']
        extra_kwargs = {
            'password': {'write_only': True}
        }

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUserModel
        fields = [
            'email', 'first_name', 'last_name', 'username',
            'phone', 'birth_date', 'address', 'city', 'country',
            'role', 'password', 'password2'
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError("Las contraseñas no coinciden")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = CustomUserModel(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUserModel
        fields = [
            'email', 'first_name', 'last_name', 'username',
            'phone', 'birth_date', 'address', 'city', 'country',
            'role', 'is_active', 'is_staff', 'is_superuser'
        ]
        read_only_fields = ['email']  # No permitir cambiar el email

    def validate_role(self, value):
        """Validar que el rol sea válido"""
        valid_roles = ['admin', 'cliente', 'vendedor']
        if value not in valid_roles:
            raise serializers.ValidationError(f"Rol inválido. Roles válidos: {', '.join(valid_roles)}")
        return value


