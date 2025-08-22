from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from apps.products.models import Product, ProductAttribute
import logging

logger = logging.getLogger(__name__)


class Cart(models.Model):
    STATUS_CHOICES = [
        ('active', 'Activo'),
        ('abandoned', 'Abandonado'),
        ('converted', 'Convertido'),
        ('expired', 'Expirado'),
    ]

    # Usuario (nullable para carritos de sesión)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='carts'
    )
    
    # ID de sesión para usuarios no registrados
    session_id = models.CharField(max_length=255, db_index=True, null=True, blank=True)
    
    # Estado y metadatos
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', db_index=True)
    currency = models.CharField(max_length=3, default='ARS')
    expires_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['session_id']),
            models.Index(fields=['status', 'expires_at']),
        ]

    def __str__(self):
        if self.user:
            return f"Carrito de {self.user.email}"
        return f"Carrito sesión {self.session_id}"

    def save(self, *args, **kwargs):
        # Establecer fecha de expiración si no existe
        if not self.expires_at:
            if self.user:
                # Carritos de usuarios registrados expiran en 30 días
                self.expires_at = timezone.now() + timedelta(days=30)
            else:
                # Carritos de sesión expiran en 7 días
                self.expires_at = timezone.now() + timedelta(days=7)
        super().save(*args, **kwargs)

    @property
    def total_items(self):
        """Retorna el número total de items en el carrito"""
        return self.items.aggregate(total=models.Sum('quantity'))['total'] or 0

    @property
    def total_amount(self):
        """Calcula el monto total del carrito"""
        total = 0
        for item in self.items.all():
            try:
                if item.product_attribute:
                    # Usar precio del atributo si existe
                    price = item.product_attribute.selling_price or item.product_attribute.offer_price
                    if price:
                        total += price * item.quantity
                else:
                    # Usar precio base del producto, con validación
                    price = item.product.initial_buying_price
                    if price is not None:
                        total += price * item.quantity
                    else:
                        # Si no hay precio, usar 0
                        logger.warning(f"Producto {item.product.name} sin precio base")
                        total += 0
            except Exception as e:
                logger.error(f"Error calculando precio para item {item.id}: {e}")
                total += 0
        return total

    def is_expired(self):
        """Verifica si el carrito ha expirado"""
        return timezone.now() > self.expires_at if self.expires_at else False


class CartItem(models.Model):
    # Relaciones
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    product_attribute = models.ForeignKey(
        ProductAttribute,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        help_text="Variante específica del producto"
    )
    
    # Cantidad y precio
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(
        max_digits=12, 
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Precio al momento de agregar al carrito"
    )
    
    # Atributos seleccionados (color, talla, etc.)
    selected_attributes = models.JSONField(
        null=True,
        blank=True,
        help_text="Atributos seleccionados como color, talla, etc."
    )
    
    # Notas del cliente
    notes = models.TextField(blank=True, null=True)
    
    # Timestamps
    added_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['cart', 'product', 'product_attribute']
        indexes = [
            models.Index(fields=['cart', 'product']),
        ]

    def __str__(self):
        return f"{self.product.name} x{self.quantity} en carrito"

    def save(self, *args, **kwargs):
        # Guardar precio actual si no existe
        if not self.unit_price:
            if self.product_attribute:
                self.unit_price = self.product_attribute.selling_price
            else:
                self.unit_price = self.product.initial_buying_price
        super().save(*args, **kwargs)

    @property
    def subtotal(self):
        """Calcula el subtotal del item"""
        if self.product_attribute:
            price = self.product_attribute.selling_price or self.product_attribute.offer_price
        else:
            price = self.unit_price or self.product.initial_buying_price
        
        # Validar que el precio no sea None
        if price is not None:
            return price * self.quantity
        else:
            logger.warning(f"Item {self.product.name} sin precio válido")
            return 0


class Wishlist(models.Model):
    # Usuario propietario
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='wishlists'
    )
    
    # Información de la lista
    name = models.CharField(max_length=255, default='Mi Lista de Deseos')
    is_public = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'name']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['is_public']),
        ]

    def __str__(self):
        return f"{self.name} - {self.user.email}"

    @property
    def total_items(self):
        """Retorna el número total de items en la wishlist"""
        return self.items.count()


class WishlistItem(models.Model):
    PRIORITY_CHOICES = [
        (1, 'Alta'),
        (2, 'Media'),
        (3, 'Baja'),
    ]

    # Relaciones
    wishlist = models.ForeignKey(Wishlist, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    product_attribute = models.ForeignKey(
        ProductAttribute,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    
    # Atributos seleccionados
    selected_attributes = models.JSONField(null=True, blank=True)
    
    # Prioridad y notas
    priority = models.IntegerField(choices=PRIORITY_CHOICES, default=2)
    notes = models.TextField(blank=True, null=True)
    
    # Timestamp
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['wishlist', 'product', 'product_attribute']
        indexes = [
            models.Index(fields=['wishlist', 'priority']),
        ]

    def __str__(self):
        return f"{self.product.name} en {self.wishlist.name}"


class SavedForLater(models.Model):
    # Usuario
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='saved_items'
    )
    
    # Producto
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    product_attribute = models.ForeignKey(
        ProductAttribute,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    
    # Atributos y notas
    selected_attributes = models.JSONField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    
    # Timestamp
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'product', 'product_attribute']
        indexes = [
            models.Index(fields=['user', 'saved_at']),
        ]

    def __str__(self):
        return f"{self.product.name} guardado por {self.user.email}"


class RecentlyViewed(models.Model):
    # Usuario (nullable para usuarios no registrados)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='recently_viewed'
    )
    
    # ID de sesión para usuarios no registrados
    session_id = models.CharField(max_length=255, db_index=True, null=True, blank=True)
    
    # Producto
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    
    # Contadores y timestamps
    view_count = models.PositiveIntegerField(default=1)
    first_viewed_at = models.DateTimeField(auto_now_add=True)
    last_viewed_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [
            ['user', 'product'],
            ['session_id', 'product']
        ]
        indexes = [
            models.Index(fields=['user', 'last_viewed_at']),
            models.Index(fields=['session_id', 'last_viewed_at']),
        ]

    def __str__(self):
        identifier = self.user.email if self.user else f"Sesión {self.session_id}"
        return f"{self.product.name} visto por {identifier}"


class CartAbandonmentTracking(models.Model):
    ABANDONMENT_STAGES = [
        ('added_items', 'Items Agregados'),
        ('checkout_started', 'Checkout Iniciado'),
        ('payment_failed', 'Pago Fallido'),
    ]

    # Carrito
    cart = models.OneToOneField(
        Cart,
        on_delete=models.CASCADE,
        related_name='abandonment_tracking'
    )
    
    # Información de contacto
    email = models.EmailField(help_text="Email para enviar recordatorios")
    
    # Estado del abandono
    abandonment_stage = models.CharField(
        max_length=20,
        choices=ABANDONMENT_STAGES,
        default='added_items'
    )
    
    # Seguimiento de actividad
    last_activity_at = models.DateTimeField(auto_now=True)
    
    # Recordatorios enviados
    reminder_sent_count = models.PositiveIntegerField(default=0)
    last_reminder_sent_at = models.DateTimeField(null=True, blank=True)
    
    # Recuperación
    recovered_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Fecha en que se completó la compra"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['email', 'abandonment_stage']),
            models.Index(fields=['last_activity_at']),
            models.Index(fields=['recovered_at']),
        ]

    def __str__(self):
        return f"Abandono de carrito - {self.email} ({self.get_abandonment_stage_display()})"

    @property
    def is_recovered(self):
        """Verifica si el carrito fue recuperado"""
        return self.recovered_at is not None

    @property
    def days_since_abandonment(self):
        """Días desde el último abandono"""
        return (timezone.now() - self.last_activity_at).days