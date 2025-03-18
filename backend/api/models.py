from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.


class Category(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    image = models.ImageField(upload_to='product_images/', null=True, blank=True)

    def __str__(self):
        return self.name
    
class UserRole(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

class User(AbstractUser):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    birth_date = models.DateField(blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)

    role = models.ForeignKey(UserRole, on_delete=models.SET_NULL, null=True, related_name="users")

    # Solución para evitar conflictos con la clase AbstractUser
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_set',
        blank=True
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_permissions_set',
        blank=True
    )

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.role.name if self.role else 'Sin rol'})"

    
class PaymentMethod(models.Model):
    name = models.CharField(max_length=50, unique=True)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)  # Interés asociado

    def __str__(self):
        return self.name


class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    created_at = models.DateTimeField(auto_now_add=True)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.ForeignKey(PaymentMethod, on_delete=models.SET_NULL, null=True, related_name="orders")
    installments = models.PositiveIntegerField(default=1)  # Número de cuotas
    final_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)  # Total con interés

    def save(self, *args, **kwargs):
        """Calcula el total con intereses si el método de pago tiene interés y hay cuotas"""
        if self.payment_method and self.installments > 1:
            self.final_amount = self.total * (1 + (self.payment_method.interest_rate / 100))
        else:
            self.final_amount = self.total
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Pedido {self.id} - {self.user.username} ({self.installments} cuotas)"
