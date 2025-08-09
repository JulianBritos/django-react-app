from django.db import models
from django.conf import settings
from django.utils import timezone


class NotificationTemplate(models.Model):
    TEMPLATE_TYPES = [
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('push', 'Push Notification'),
        ('in_app', 'Notificación In-App'),
    ]

    TRIGGER_EVENTS = [
        ('order_created', 'Orden Creada'),
        ('order_confirmed', 'Orden Confirmada'),
        ('order_shipped', 'Orden Enviada'),
        ('order_delivered', 'Orden Entregada'),
        ('order_cancelled', 'Orden Cancelada'),
        ('payment_successful', 'Pago Exitoso'),
        ('payment_failed', 'Pago Fallido'),
        ('cart_abandoned', 'Carrito Abandonado'),
        ('welcome', 'Bienvenida'),
        ('password_reset', 'Reset de Contraseña'),
        ('email_verification', 'Verificación de Email'),
        ('low_stock', 'Stock Bajo'),
        ('promotion_available', 'Promoción Disponible'),
    ]

    # Información básica
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    template_type = models.CharField(max_length=20, choices=TEMPLATE_TYPES)
    trigger_event = models.CharField(max_length=30, choices=TRIGGER_EVENTS, db_index=True)
    
    # Contenido del template
    subject = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Asunto (para emails) o título (para push notifications)"
    )
    content_html = models.TextField(
        blank=True,
        null=True,
        help_text="Contenido HTML (para emails)"
    )
    content_text = models.TextField(
        help_text="Contenido de texto plano"
    )
    
    # Estado
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['trigger_event', 'template_type', 'is_active']),
        ]

    def __str__(self):
        return f"{self.name} ({self.get_template_type_display()} - {self.get_trigger_event_display()})"


class NotificationQueue(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('processing', 'Procesando'),
        ('sent', 'Enviado'),
        ('failed', 'Fallido'),
        ('cancelled', 'Cancelado'),
    ]

    # Relaciones
    template = models.ForeignKey(
        NotificationTemplate,
        on_delete=models.CASCADE,
        related_name='queued_notifications'
    )
    recipient_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='queued_notifications'
    )
    
    # Información del destinatario
    recipient_email = models.EmailField(null=True, blank=True)
    recipient_phone = models.CharField(max_length=20, null=True, blank=True)
    recipient_name = models.CharField(max_length=255, null=True, blank=True)
    
    # Contenido renderizado
    rendered_subject = models.CharField(max_length=255, blank=True, null=True)
    rendered_content_html = models.TextField(blank=True, null=True)
    rendered_content_text = models.TextField()
    
    # Estado
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    
    # Programación
    scheduled_for = models.DateTimeField(
        default=timezone.now,
        help_text="Fecha y hora programada para el envío"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['scheduled_for']
        indexes = [
            models.Index(fields=['status', 'scheduled_for']),
            models.Index(fields=['recipient_user', 'status']),
        ]

    def __str__(self):
        recipient = self.recipient_user.email if self.recipient_user else self.recipient_email
        return f"{self.template.name} → {recipient} ({self.get_status_display()})"


class NotificationLog(models.Model):
    # Información básica
    notification_queue = models.ForeignKey(
        NotificationQueue,
        on_delete=models.CASCADE,
        related_name='logs'
    )
    
    # Detalles del intento
    attempt_number = models.PositiveIntegerField()
    status = models.CharField(max_length=20)
    
    # Información técnica
    provider_used = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        help_text="Proveedor utilizado (SMTP, SendGrid, Twilio, etc.)"
    )
    
    # Información adicional
    error_details = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    
    # Timestamp
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['notification_queue', 'attempt_number']),
            models.Index(fields=['status', 'created_at']),
        ]

    def __str__(self):
        return f"Log #{self.attempt_number} - {self.notification_queue} - {self.status}"


class UserNotificationPreference(models.Model):
    # Usuario
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notification_preferences'
    )
    
    # Preferencias por canal
    email_enabled = models.BooleanField(default=True)
    sms_enabled = models.BooleanField(default=False)
    push_enabled = models.BooleanField(default=True)
    
    # Preferencias por tipo de evento
    order_notifications = models.BooleanField(default=True)
    payment_notifications = models.BooleanField(default=True)
    shipping_notifications = models.BooleanField(default=True)
    promotion_notifications = models.BooleanField(default=True)
    marketing_notifications = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Preferencias de {self.user.email}"
