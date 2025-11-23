from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone

class Category(models.Model):
    id=models.AutoField(primary_key=True)
    name=models.CharField(max_length=255)
    display_order=models.IntegerField(default=0)
    parent_id=models.ForeignKey('self',on_delete=models.CASCADE,blank=True,null=True)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Attribute(models.Model):
    id=models.AutoField(primary_key=True)
    name=models.CharField(max_length=255)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name

class AttributeOption(models.Model):
    id=models.AutoField(primary_key=True)
    name=models.CharField(max_length=255)
    attribute=models.ForeignKey(Attribute, on_delete=models.SET_NULL, null=True)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)   

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)    
    specifications=models.JSONField(blank=True, null=True)
    html_description=models.TextField(blank=True, null=True)
    highlights=models.JSONField(blank=True, null=True)
    initial_buying_price=models.FloatField( null=True)
    tax_percentage=models.FloatField(blank=True, null=True)
    brand=models.CharField(max_length=255,blank=True, null=True)
    brand_model=models.CharField(max_length=255,blank=True, null=True)
    status=models.CharField(max_length=255,choices=[('ACTIVE','ACTIVE'),('INACTIVE','INACTIVE')],default='ACTIVE')
    seo_title=models.CharField(max_length=255,blank=True, null=True)
    seo_description=models.TextField(blank=True, null=True)
    seo_keywords=models.JSONField(blank=True, null=True)
    # Rating promedio calculado automáticamente
    average_rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.00,
        help_text="Rating promedio calculado automáticamente"
    )
    total_reviews = models.PositiveIntegerField(default=0)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)
   

    def __str__(self):
        return self.name
    
    @property
    def rating_count(self):
        """Retorna el número de reseñas aprobadas"""
        return self.reviews.filter(is_approved=True).count()
    
class ProductAttribute(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='product_attributes')
    sku = models.CharField(max_length=255, blank=True, null=True)
    selling_price = models.FloatField(null=True)
    offer_price = models.FloatField(null=True)
    offer_start_date = models.DateTimeField(blank=True, null=True)
    offer_end_date = models.DateTimeField(blank=True, null=True)
    stock = models.PositiveIntegerField(default=0)
    stock_alert = models.PositiveIntegerField(default=0)
    barcode = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.product.name} - Variante {self.id}"

    
class ProductImages(models.Model):
    productattribute = models.ForeignKey(ProductAttribute, on_delete=models.CASCADE, related_name='uploaded_images')
    image = models.ImageField(upload_to='product_images/')

    def __str__(self):
        return self.image.url

class ProductAttributeOptionLink(models.Model):
    product_attribute = models.ForeignKey('ProductAttribute', on_delete=models.CASCADE, related_name='attribute_links')
    attribute = models.ForeignKey(Attribute, on_delete=models.CASCADE)
    attributeoption = models.ForeignKey(AttributeOption, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('product_attribute', 'attribute')  # Asegura una sola opción por atributo
    def __str__(self):
        return f"{self.attribute.name}: {self.attributeoption.name}"


class ProductReview(models.Model):
    """Modelo para reseñas de productos"""
    RATING_CHOICES = [
        (1, '1 Estrella'),
        (2, '2 Estrellas'),
        (3, '3 Estrellas'),
        (4, '4 Estrellas'),
        (5, '5 Estrellas'),
    ]
    
    # Relaciones
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='product_reviews',
        null=True,
        blank=True
    )
    order_item = models.ForeignKey(
        'orders.OrderItem',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviews',
        help_text="Item de orden relacionado para validar compra"
    )
    
    # Contenido de la reseña
    rating = models.IntegerField(
        choices=RATING_CHOICES,
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(blank=True, null=True)
    title = models.CharField(max_length=255, blank=True, null=True)
    
    # Moderación
    is_approved = models.BooleanField(
        default=False,
        help_text="La reseña debe ser aprobada por un administrador"
    )
    is_verified_purchase = models.BooleanField(
        default=False,
        help_text="Indica si la reseña proviene de una compra verificada"
    )
    
    # Útil/No útil
    helpful_count = models.PositiveIntegerField(default=0)
    not_helpful_count = models.PositiveIntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['product', 'user', 'order_item']
        indexes = [
            models.Index(fields=['product', 'is_approved']),
            models.Index(fields=['product', 'rating']),
            models.Index(fields=['is_approved', 'created_at']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Reseña de {self.product.name} por {self.user.email if self.user else 'Anónimo'} - {self.rating} estrellas"
    
    def save(self, *args, **kwargs):
        """
        Marcar como compra verificada si hay order_item asociado
        """
        if self.order_item and not self.is_verified_purchase:
            self.is_verified_purchase = True
        super().save(*args, **kwargs)
        
        # Actualizar rating promedio del producto después de guardar
        ProductReview.update_product_rating(self.product)
    
    @staticmethod
    def update_product_rating(product):
        """
        Actualizar rating promedio y total de reseñas de un producto
        """
        from django.db.models import Avg, Count
        
        # Calcular rating promedio de reseñas aprobadas
        rating_stats = ProductReview.objects.filter(
            product=product,
            is_approved=True
        ).aggregate(
            avg_rating=Avg('rating'),
            total=Count('id')
        )
        
        product.average_rating = rating_stats['avg_rating'] or 0.00
        product.total_reviews = rating_stats['total'] or 0
        product.save(update_fields=['average_rating', 'total_reviews'])


class ReviewHelpful(models.Model):
    """Modelo para rastrear qué reseñas fueron marcadas como útiles"""
    review = models.ForeignKey(
        ProductReview,
        on_delete=models.CASCADE,
        related_name='helpful_votes'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='review_helpful_votes'
    )
    is_helpful = models.BooleanField(
        default=True,
        help_text="True si fue útil, False si no fue útil"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['review', 'user']
        indexes = [
            models.Index(fields=['review', 'user']),
        ]
    
    def __str__(self):
        action = "útil" if self.is_helpful else "no útil"
        return f"{self.user.email} marcó la reseña {self.review.id} como {action}"


class RelatedProduct(models.Model):
    """Modelo para productos relacionados"""
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='related_products'
    )
    related_product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='related_to_products'
    )
    relation_type = models.CharField(
        max_length=20,
        choices=[
            ('related', 'Relacionado'),
            ('cross_sell', 'Cross-sell'),
            ('up_sell', 'Up-sell'),
            ('also_bought', 'También comprado'),
        ],
        default='related'
    )
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['product', 'related_product', 'relation_type']
        indexes = [
            models.Index(fields=['product', 'relation_type', 'display_order']),
        ]
        ordering = ['display_order']
    
    def __str__(self):
        return f"{self.product.name} -> {self.related_product.name} ({self.get_relation_type_display()})"
    
    def clean(self):
        """Validar que un producto no esté relacionado consigo mismo"""
        from django.core.exceptions import ValidationError
        if self.product == self.related_product:
            raise ValidationError("Un producto no puede estar relacionado consigo mismo")


class StockMovement(models.Model):
    """Modelo para rastrear movimientos de stock"""
    MOVEMENT_TYPES = [
        ('sale', 'Venta'),
        ('purchase', 'Compra'),
        ('return', 'Devolución'),
        ('adjustment', 'Ajuste Manual'),
        ('transfer', 'Transferencia'),
        ('damage', 'Dañado'),
        ('expired', 'Vencido'),
        ('reserved', 'Reservado'),
        ('released', 'Liberado'),
    ]
    
    # Relaciones
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='stock_movements'
    )
    product_attribute = models.ForeignKey(
        ProductAttribute,
        on_delete=models.CASCADE,
        related_name='stock_movements',
        null=True,
        blank=True
    )
    order = models.ForeignKey(
        'orders.Order',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='stock_movements'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='stock_movements'
    )
    
    # Información del movimiento
    movement_type = models.CharField(
        max_length=20,
        choices=MOVEMENT_TYPES
    )
    quantity = models.IntegerField(
        help_text="Cantidad positiva para ingresos, negativa para salidas"
    )
    stock_before = models.PositiveIntegerField(
        help_text="Stock antes del movimiento"
    )
    stock_after = models.PositiveIntegerField(
        help_text="Stock después del movimiento"
    )
    
    # Información adicional
    notes = models.TextField(blank=True, null=True)
    reference_number = models.CharField(max_length=255, blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['product', 'created_at']),
            models.Index(fields=['product_attribute', 'created_at']),
            models.Index(fields=['movement_type', 'created_at']),
            models.Index(fields=['order']),
        ]
    
    def __str__(self):
        return f"{self.get_movement_type_display()} - {self.product.name} - Cantidad: {self.quantity} ({self.created_at})"