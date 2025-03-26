from django.db import models
from apps.payments.models import Payment
from apps.products.models import Product

class Order(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pendiente"),
        ("approved", "Aprobado"),
        ("rejected", "Rechazado"),
    ]

    product_id = models.CharField(max_length=100, null=True, blank=True)  # Permite valores nulos
    product_title = models.CharField(max_length=255, null=True, blank=True)
    quantity = models.IntegerField(null=True, blank=True)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    buyer_email = models.EmailField(null=True, blank=True)
    payment_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    external_reference = models.CharField(max_length=100, unique=True, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Pedido {self.external_reference} - {self.payment_status}"
    

class Purchase(models.Model):
    payment = models.ForeignKey(Payment, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=50)
    email = models.EmailField()
    items = models.JSONField()
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Compra {self.payment_id} - {self.status}"
    

class Cart(models.Model):
    session_id = models.CharField(max_length=255, db_index=True)  # ID único de sesión
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    selected_variant = models.JSONField(null=True, blank=True)  # Para manejar variantes como color/talla
    added_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Carrito {self.session_id} - {self.product.title} ({self.quantity})"