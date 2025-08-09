from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from decimal import Decimal


class PaymentMethod(models.Model):
    PAYMENT_TYPES = [
        ('credit_card', 'Tarjeta de Crédito'),
        ('debit_card', 'Tarjeta de Débito'),
        ('bank_transfer', 'Transferencia Bancaria'),
        ('cash', 'Efectivo'),
        ('mercado_pago', 'MercadoPago'),
        ('paypal', 'PayPal'),
        ('crypto', 'Criptomonedas'),
    ]

    # Información básica
    name = models.CharField(max_length=100, unique=True, null=True, blank=True)
    code = models.CharField(max_length=50, unique=True, db_index=True, null=True, blank=True)
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPES, null=True, blank=True)
    
    # Estado
    is_active = models.BooleanField(default=True)
    
    # Configuración financiera
    interest_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0.00), MaxValueValidator(100.00)],
        help_text="Tasa de interés en porcentaje"
    )
    
    # Configuración de cuotas
    min_installments = models.PositiveIntegerField(default=1)
    max_installments = models.PositiveIntegerField(default=1)
    
    # Configuración del gateway
    gateway_config = models.JSONField(
        null=True,
        blank=True,
        help_text="Configuración específica del gateway de pagos"
    )
    
    # Límites
    min_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Monto mínimo para usar este método"
    )
    max_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Monto máximo para usar este método"
    )
    
    # Metadatos
    description = models.TextField(blank=True, null=True)
    icon = models.CharField(max_length=255, blank=True, null=True, help_text="URL o nombre del ícono")
    display_order = models.PositiveIntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['display_order', 'name']
        indexes = [
            models.Index(fields=['is_active', 'display_order']),
            models.Index(fields=['payment_type']),
        ]

    def __str__(self):
        return f"{self.name} ({self.get_payment_type_display()})"

    def calculate_interest_amount(self, amount, installments=1):
        """Calcula el monto de interés para un monto dado"""
        if installments <= 1 or self.interest_rate == 0:
            return Decimal('0.00')
        
        interest_decimal = self.interest_rate / 100
        return amount * interest_decimal

    def calculate_total_with_interest(self, amount, installments=1):
        """Calcula el monto total incluyendo intereses"""
        interest = self.calculate_interest_amount(amount, installments)
        return amount + interest

    def is_available_for_amount(self, amount):
        """Verifica si el método está disponible para un monto específico"""
        if not self.is_active:
            return False
        
        if self.min_amount and amount < self.min_amount:
            return False
            
        if self.max_amount and amount > self.max_amount:
            return False
            
        return True


class Payment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('processing', 'Procesando'),
        ('completed', 'Completado'),
        ('failed', 'Fallido'),
        ('cancelled', 'Cancelado'),
        ('refunded', 'Reembolsado'),
        ('partially_refunded', 'Parcialmente Reembolsado'),
    ]

    # Identificación
    payment_id = models.CharField(max_length=100, unique=True, db_index=True)
    external_payment_id = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        db_index=True,
        help_text="ID del pago en el gateway externo (MercadoPago, PayPal, etc.)"
    )
    
    # Relaciones
    order = models.ForeignKey(
        'orders.Order',
        on_delete=models.CASCADE,
        related_name='payments',
        null=True,
        blank=True
    )
    payment_method = models.ForeignKey(
        PaymentMethod,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    # Información financiera
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default='ARS')
    
    # Cuotas
    installments = models.PositiveIntegerField(default=1)
    installment_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Monto por cuota"
    )
    
    # Estado y fechas
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    payment_date = models.DateTimeField(null=True, blank=True)
    
    # Respuesta del gateway
    gateway_response = models.JSONField(
        null=True,
        blank=True,
        help_text="Respuesta completa del gateway de pagos"
    )
    
    # Información adicional
    failure_reason = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['order', 'status']),
            models.Index(fields=['external_payment_id']),
            models.Index(fields=['payment_date']),
        ]

    def __str__(self):
        return f"Pago {self.payment_id} - {self.get_status_display()}"

    def save(self, *args, **kwargs):
        # Generar payment_id si no existe
        if not self.payment_id:
            import uuid
            self.payment_id = f"PAY-{uuid.uuid4().hex[:8].upper()}"
        
        # Calcular monto por cuota si hay cuotas
        if self.installments > 1 and self.payment_method:
            total_with_interest = self.payment_method.calculate_total_with_interest(
                self.amount, self.installments
            )
            self.installment_amount = total_with_interest / self.installments
        
        super().save(*args, **kwargs)

    @property
    def is_successful(self):
        """Verifica si el pago fue exitoso"""
        return self.status == 'completed'

    @property
    def can_be_refunded(self):
        """Verifica si el pago puede ser reembolsado"""
        return self.status in ['completed']

    def get_refunded_amount(self):
        """Obtiene el monto total reembolsado"""
        return self.refunds.aggregate(
            total=models.Sum('amount')
        )['total'] or Decimal('0.00')

    @property
    def remaining_refundable_amount(self):
        """Calcula el monto que aún puede ser reembolsado"""
        return self.amount - self.get_refunded_amount()


class PaymentTransaction(models.Model):
    TRANSACTION_TYPES = [
        ('charge', 'Cargo'),
        ('refund', 'Reembolso'),
        ('chargeback', 'Contracargo'),
        ('adjustment', 'Ajuste'),
    ]

    # Relación con el pago
    payment = models.ForeignKey(
        Payment,
        on_delete=models.CASCADE,
        related_name='transactions'
    )
    
    # Información de la transacción
    transaction_id = models.CharField(max_length=100, unique=True, db_index=True, null=True, blank=True)
    external_transaction_id = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text="ID de la transacción en el gateway externo"
    )
    
    # Tipo y monto
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES, null=True, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default='ARS')
    
    # Estado
    status = models.CharField(max_length=20, default='completed')
    
    # Información adicional
    description = models.TextField(blank=True, null=True)
    gateway_response = models.JSONField(null=True, blank=True)
    
    # Usuario que procesó la transacción (para reembolsos manuales)
    processed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='processed_transactions'
    )
    
    # Timestamps
    processed_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['payment', 'transaction_type']),
            models.Index(fields=['external_transaction_id']),
        ]

    def __str__(self):
        return f"{self.get_transaction_type_display()} {self.transaction_id} - ${self.amount}"

    def save(self, *args, **kwargs):
        # Generar transaction_id si no existe
        if not self.transaction_id:
            import uuid
            self.transaction_id = f"TXN-{uuid.uuid4().hex[:8].upper()}"
        
        super().save(*args, **kwargs)


class PaymentRefund(models.Model):
    # Relación con el pago
    payment = models.ForeignKey(
        Payment,
        on_delete=models.CASCADE,
        related_name='refunds'
    )
    
    # Información del reembolso
    refund_id = models.CharField(max_length=100, unique=True, db_index=True, null=True, blank=True)
    external_refund_id = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text="ID del reembolso en el gateway externo"
    )
    
    # Monto y estado
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=20, default='pending')
    
    # Razón del reembolso
    reason = models.TextField(null=True, blank=True)
    
    # Usuario que procesó el reembolso
    processed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='processed_refunds'
    )
    
    # Respuesta del gateway
    gateway_response = models.JSONField(null=True, blank=True)
    
    # Timestamps
    processed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['payment', 'status']),
        ]

    def __str__(self):
        return f"Reembolso {self.refund_id} - ${self.amount}"

    def save(self, *args, **kwargs):
        # Generar refund_id si no existe
        if not self.refund_id:
            import uuid
            self.refund_id = f"REF-{uuid.uuid4().hex[:8].upper()}"
        
        super().save(*args, **kwargs)
