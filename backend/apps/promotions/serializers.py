from rest_framework import serializers
from .models import Coupon, CouponUsage, Promotion, PromotionUsage
from apps.orders.models import Order
from django.utils import timezone
from decimal import Decimal


class CouponSerializer(serializers.ModelSerializer):
    """Serializer para Coupon"""
    discount_type_display = serializers.CharField(source='get_discount_type_display', read_only=True)
    usage_limit_type_display = serializers.CharField(source='get_usage_limit_type_display', read_only=True)
    is_valid = serializers.SerializerMethodField()
    
    class Meta:
        model = Coupon
        fields = [
            'id', 'code', 'name', 'description', 'discount_type', 'discount_type_display',
            'discount_value', 'usage_limit_type', 'usage_limit_type_display',
            'usage_limit', 'used_count', 'valid_from', 'valid_until',
            'is_active', 'is_valid', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'used_count', 'created_at', 'updated_at']
    
    def get_is_valid(self, obj):
        """Verificar si el cupón está válido actualmente"""
        return obj.is_valid()
    
    def validate_code(self, value):
        """Validar que el código sea único y en mayúsculas"""
        value = value.upper().strip()
        queryset = Coupon.objects.filter(code=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("Ya existe un cupón con este código")
        return value
    
    def validate(self, data):
        """Validar que valid_until sea posterior a valid_from"""
        valid_from = data.get('valid_from', self.instance.valid_from if self.instance else None)
        valid_until = data.get('valid_until', self.instance.valid_until if self.instance else None)
        
        if valid_from and valid_until:
            if valid_until <= valid_from:
                raise serializers.ValidationError({
                    'valid_until': 'La fecha de expiración debe ser posterior a la fecha de inicio'
                })
        
        # Validar discount_value según tipo
        discount_type = data.get('discount_type', self.instance.discount_type if self.instance else None)
        discount_value = data.get('discount_value', self.instance.discount_value if self.instance else None)
        
        if discount_type == 'percentage' and discount_value:
            if discount_value > Decimal('100'):
                raise serializers.ValidationError({
                    'discount_value': 'El descuento porcentual no puede ser mayor a 100%'
                })
        
        return data


class CouponUsageSerializer(serializers.ModelSerializer):
    """Serializer para CouponUsage"""
    coupon_code = serializers.CharField(source='coupon.code', read_only=True)
    coupon_name = serializers.CharField(source='coupon.name', read_only=True)
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = CouponUsage
        fields = [
            'id', 'coupon', 'coupon_code', 'coupon_name', 'user', 'user_email',
            'order', 'order_number', 'discount_amount', 'used_at'
        ]
        read_only_fields = ['id', 'used_at']


class PromotionSerializer(serializers.ModelSerializer):
    """Serializer para Promotion"""
    promotion_type_display = serializers.CharField(source='get_promotion_type_display', read_only=True)
    is_active_now = serializers.SerializerMethodField()
    
    class Meta:
        model = Promotion
        fields = [
            'id', 'name', 'description', 'promotion_type', 'promotion_type_display',
            'promotion_config', 'valid_from', 'valid_until', 'is_active',
            'is_active_now', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_is_active_now(self, obj):
        """Verificar si la promoción está activa actualmente"""
        now = timezone.now()
        return (
            obj.is_active and
            obj.valid_from <= now <= obj.valid_until
        )
    
    def validate(self, data):
        """Validar que valid_until sea posterior a valid_from"""
        valid_from = data.get('valid_from', self.instance.valid_from if self.instance else None)
        valid_until = data.get('valid_until', self.instance.valid_until if self.instance else None)
        
        if valid_from and valid_until:
            if valid_until <= valid_from:
                raise serializers.ValidationError({
                    'valid_until': 'La fecha de expiración debe ser posterior a la fecha de inicio'
                })
        
        # Validar promotion_config según el tipo
        promotion_type = data.get('promotion_type', self.instance.promotion_type if self.instance else None)
        promotion_config = data.get('promotion_config', self.instance.promotion_config if self.instance else {})
        
        if promotion_type and promotion_config:
            # Validaciones básicas según tipo de promoción
            if promotion_type == 'bulk_discount':
                if 'min_quantity' not in promotion_config or 'discount_percentage' not in promotion_config:
                    raise serializers.ValidationError({
                        'promotion_config': 'Para descuento por volumen se requiere min_quantity y discount_percentage'
                    })
            
            elif promotion_type == 'buy_x_get_y':
                if 'buy_quantity' not in promotion_config or 'get_quantity' not in promotion_config:
                    raise serializers.ValidationError({
                        'promotion_config': 'Para compra X obtén Y se requiere buy_quantity y get_quantity'
                    })
            
            elif promotion_type == 'category_discount':
                if 'category_id' not in promotion_config or 'discount_percentage' not in promotion_config:
                    raise serializers.ValidationError({
                        'promotion_config': 'Para descuento por categoría se requiere category_id y discount_percentage'
                    })
        
        return data


class PromotionUsageSerializer(serializers.ModelSerializer):
    """Serializer para PromotionUsage"""
    promotion_name = serializers.CharField(source='promotion.name', read_only=True)
    promotion_type = serializers.CharField(source='promotion.promotion_type', read_only=True)
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    
    class Meta:
        model = PromotionUsage
        fields = [
            'id', 'promotion', 'promotion_name', 'promotion_type',
            'order', 'order_number', 'discount_amount', 'items_affected',
            'applied_at'
        ]
        read_only_fields = ['id', 'applied_at']


class CouponValidationSerializer(serializers.Serializer):
    """Serializer para validar un cupón"""
    coupon_code = serializers.CharField(max_length=50, required=True)
    cart_id = serializers.IntegerField(required=False)
    
    def validate_coupon_code(self, value):
        """Normalizar código del cupón"""
        return value.upper().strip()


class CouponApplySerializer(serializers.Serializer):
    """Serializer para aplicar un cupón"""
    coupon_code = serializers.CharField(max_length=50, required=True)
    cart_id = serializers.IntegerField(required=True)
    
    def validate_coupon_code(self, value):
        """Normalizar código del cupón"""
        return value.upper().strip()

