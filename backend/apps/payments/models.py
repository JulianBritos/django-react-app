from django.db import models
from django.core.validators import MinValueValidator
    
class PaymentMethod(models.Model):
    name = models.CharField(max_length=50, unique=True)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00, validators=[MinValueValidator(0.00)])  # Interés asociado

    def __str__(self):
        return self.name

class Payment(models.Model):
    payment_id = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=50)
    method = models.ForeignKey("PaymentMethod", on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Pago {self.payment_id} - {self.status}"
