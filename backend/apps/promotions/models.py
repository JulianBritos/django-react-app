from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from decimal import Decimal
from apps.products.models import Product, Category


class Coupon(models.Model):
    DISCOUNT_TYPES = [
        ('percentage', 'Porcentaje'),
        ('fixed_amount', 'Monto Fijo'),
        ('free_shipping', 'Envío Gratis'),
    ]

    USAGE_LIMIT_TYPES = [
        ('unlimited', 'Ilimitado'),
        ('limited', 'Limitado'),
        ('once_per_customer', 'Una vez por cliente'),
    ]

    # Información básica
    code = models.CharField(max_length=50, unique=True, db_index=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    
    # Tipo de descuento
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPES)
    discount_value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    
    # Límites de uso
    usage_limit_type = models.CharField(max_length=20, choices=USAGE_LIMIT_TYPES, default='unlimited')
    usage_limit = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Número máximo de usos (solo si usage_limit_type es 'limited')"
    )
    used_count = models.PositiveIntegerField(default=0)
    
    # Fechas de validez
    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField()
    
    # Estado
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['code', 'is_active']),
            models.Index(fields=['valid_from', 'valid_until']),
        ]

    def __str__(self):
        return f"Cupón {self.code} - {self.get_discount_type_display()}"

    def is_valid(self):
        """Verifica si el cupón está válido actualmente"""
        now = timezone.now()
        return (
            self.is_active and
            self.valid_from <= now <= self.valid_until and
            not self.is_usage_limit_reached()
        )

    def is_usage_limit_reached(self):
        """Verifica si se alcanzó el límite de uso"""
        if self.usage_limit_type == 'unlimited':
            return False
        elif self.usage_limit_type == 'limited':
            return self.used_count >= (self.usage_limit or 0)
        return False


class CouponUsage(models.Model):
    # Relaciones
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE, related_name='usages')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='coupon_usages'
    )
    order = models.ForeignKey(
        'orders.Order',
        on_delete=models.CASCADE,
        related_name='coupon_usages'
    )
    
    # Información del uso
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Timestamps
    used_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['coupon', 'user']),
            models.Index(fields=['used_at']),
        ]

    def __str__(self):
        return f"Uso de {self.coupon.code} - Descuento: ${self.discount_amount}"


class Promotion(models.Model):
    PROMOTION_TYPES = [
        ('buy_x_get_y', 'Compra X obtén Y'),
        ('bulk_discount', 'Descuento por volumen'),
        ('category_discount', 'Descuento por categoría'),
        ('flash_sale', 'Oferta relámpago'),
    ]

    # Información básica
    name = models.CharField(max_length=255)
    description = models.TextField()
    promotion_type = models.CharField(max_length=20, choices=PROMOTION_TYPES)
    
    # Configuración específica de la promoción (JSON flexible)
    promotion_config = models.JSONField(
        help_text="Configuración específica según el tipo de promoción"
    )
    
    # Fechas de validez
    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField()
    
    # Estado
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['promotion_type', 'is_active']),
            models.Index(fields=['valid_from', 'valid_until']),
        ]

    def __str__(self):
        return f"Promoción: {self.name} ({self.get_promotion_type_display()})"


class PromotionUsage(models.Model):
    # Relaciones
    promotion = models.ForeignKey(Promotion, on_delete=models.CASCADE, related_name='usages')
    order = models.ForeignKey(
        'orders.Order',
        on_delete=models.CASCADE,
        related_name='promotion_usages'
    )
    
    # Información del uso
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    items_affected = models.JSONField(
        help_text="Items de la orden que fueron afectados por esta promoción"
    )
    
    # Timestamps
    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['promotion', 'applied_at']),
        ]

    def __str__(self):
        return f"Uso de promoción {self.promotion.name} - Orden {self.order.order_number}"