from django.db import models
from django.conf import settings
from django.utils import timezone
from apps.products.models import Product, ProductAttribute


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('confirmed', 'Confirmado'),
        ('processing', 'Procesando'),
        ('shipped', 'Enviado'),
        ('delivered', 'Entregado'),
        ('cancelled', 'Cancelado'),
        ('refunded', 'Reembolsado'),
    ]

    # Identificación
    id = models.AutoField(primary_key=True)
    order_number = models.CharField(max_length=20, unique=True, db_index=True, null=True, blank=True)
    
    # Usuario (nullable para guest checkout)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='orders'
    )
    
    # Datos de guest checkout
    guest_email = models.EmailField(null=True, blank=True)
    guest_phone = models.CharField(max_length=20, null=True, blank=True)
    guest_name = models.CharField(max_length=255, null=True, blank=True)
    
    # Estado y montos
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    shipping_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default='ARS')
    
    # Metadatos
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['order_number']),
            models.Index(fields=['user', 'status']),
            models.Index(fields=['guest_email', 'status']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"Orden {self.order_number} - {self.get_status_display()}"

    def save(self, *args, **kwargs):
        if not self.order_number:
            # Generar número de orden único
            import uuid
            self.order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    @property
    def customer_email(self):
        """Retorna el email del cliente (usuario registrado o guest)"""
        return self.user.email if self.user else self.guest_email

    @property
    def customer_name(self):
        """Retorna el nombre del cliente (usuario registrado o guest)"""
        if self.user:
            return f"{self.user.first_name} {self.user.last_name}".strip()
        return self.guest_name


class OrderItem(models.Model):
    # Relaciones
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    product_attribute = models.ForeignKey(
        ProductAttribute, 
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        help_text="Variante específica del producto"
    )
    
    # Snapshots al momento de la compra (para mantener historial)
    product_name = models.CharField(max_length=255, null=True, blank=True)
    product_sku = models.CharField(max_length=255, null=True, blank=True)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Cantidad y cálculos
    quantity = models.PositiveIntegerField(default=1)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Atributos seleccionados (JSON para flexibilidad)
    product_attributes_snapshot = models.JSONField(
        null=True, 
        blank=True,
        help_text="Snapshot de los atributos seleccionados al momento de la compra"
    )
    
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        indexes = [
            models.Index(fields=['order', 'product']),
        ]

    def __str__(self):
        return f"{self.product_name} x{self.quantity} - Orden {self.order.order_number}"

    def save(self, *args, **kwargs):
        # Calcular subtotal automáticamente
        self.subtotal = self.unit_price * self.quantity
        
        # Guardar snapshot de información del producto
        if not self.product_name and self.product:
            self.product_name = self.product.name
        
        if not self.product_sku and self.product_attribute:
            self.product_sku = self.product_attribute.sku
        
        super().save(*args, **kwargs)


class OrderStatusHistory(models.Model):
    # Relación con la orden
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='status_history')
    
    # Cambio de estado
    previous_status = models.CharField(max_length=20, null=True, blank=True)
    new_status = models.CharField(max_length=20, null=True, blank=True)
    
    # Usuario que hizo el cambio (puede ser automático)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='order_status_changes'
    )
    
    # Información adicional
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['order', 'created_at']),
        ]

    def __str__(self):
        return f"Orden {self.order.order_number}: {self.previous_status} → {self.new_status}"
