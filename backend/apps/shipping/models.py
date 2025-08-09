from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from decimal import Decimal


class Address(models.Model):
    ADDRESS_TYPES = [
        ('billing', 'Facturación'),
        ('shipping', 'Envío'),
        ('both', 'Ambos'),
    ]

    # Usuario (nullable para direcciones de guest checkout)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='addresses'
    )
    
    # Información personal
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    company = models.CharField(max_length=255, blank=True, null=True)
    
    # Dirección
    address_line_1 = models.CharField(max_length=255, verbose_name="Dirección")
    address_line_2 = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="Apartamento, suite, etc."
    )
    city = models.CharField(max_length=100, verbose_name="Ciudad")
    state_province = models.CharField(max_length=100, verbose_name="Provincia/Estado")
    postal_code = models.CharField(max_length=20, verbose_name="Código Postal")
    country = models.CharField(max_length=100, default='Argentina')
    
    # Contacto
    phone = models.CharField(max_length=20, blank=True, null=True)
    
    # Tipo y configuración
    address_type = models.CharField(max_length=10, choices=ADDRESS_TYPES, default='both')
    is_default = models.BooleanField(default=False)
    
    # Metadatos
    instructions = models.TextField(
        blank=True,
        null=True,
        verbose_name="Instrucciones de entrega"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Addresses"
        indexes = [
            models.Index(fields=['user', 'address_type']),
            models.Index(fields=['postal_code', 'city']),
        ]

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.city}, {self.state_province}"

    def save(self, *args, **kwargs):
        # Si es la primera dirección del usuario, marcarla como default
        if self.user and not self.user.addresses.exists():
            self.is_default = True
        
        # Si se marca como default, desmarcar las otras
        if self.is_default and self.user:
            self.user.addresses.exclude(pk=self.pk).update(is_default=False)
        
        super().save(*args, **kwargs)

    @property
    def full_name(self):
        """Retorna el nombre completo"""
        return f"{self.first_name} {self.last_name}".strip()

    @property
    def full_address(self):
        """Retorna la dirección completa formateada"""
        address_parts = [self.address_line_1]
        
        if self.address_line_2:
            address_parts.append(self.address_line_2)
        
        address_parts.extend([
            f"{self.city}, {self.state_province}",
            self.postal_code,
            self.country
        ])
        
        return ", ".join(address_parts)


class ShippingZone(models.Model):
    # Información básica
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)
    
    # Cobertura geográfica
    countries = models.JSONField(
        default=list,
        help_text="Lista de países cubiertos por esta zona"
    )
    states_provinces = models.JSONField(
        default=list,
        help_text="Lista de provincias/estados cubiertos"
    )
    cities = models.JSONField(
        default=list,
        help_text="Lista de ciudades específicas (opcional)"
    )
    postal_codes = models.JSONField(
        default=list,
        help_text="Lista de códigos postales o rangos"
    )
    
    # Estado
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

    def covers_address(self, address):
        """Verifica si esta zona cubre una dirección específica"""
        # Verificar país
        if self.countries and address.country not in self.countries:
            return False
        
        # Verificar provincia/estado
        if self.states_provinces and address.state_province not in self.states_provinces:
            return False
        
        # Verificar ciudad
        if self.cities and address.city not in self.cities:
            return False
        
        # Verificar código postal (implementación básica)
        if self.postal_codes and address.postal_code not in self.postal_codes:
            return False
        
        return True


class ShippingMethod(models.Model):
    METHOD_TYPES = [
        ('standard', 'Envío Estándar'),
        ('express', 'Envío Express'),
        ('overnight', 'Envío Nocturno'),
        ('pickup', 'Retiro en Sucursal'),
        ('same_day', 'Envío el Mismo Día'),
    ]

    # Información básica
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True, db_index=True)
    method_type = models.CharField(max_length=20, choices=METHOD_TYPES)
    description = models.TextField(blank=True, null=True)
    
    # Zona de cobertura
    shipping_zone = models.ForeignKey(
        ShippingZone,
        on_delete=models.CASCADE,
        related_name='shipping_methods'
    )
    
    # Configuración de costos
    base_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    cost_per_kg = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Costo adicional por kilogramo"
    )
    
    # Límites
    min_weight = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Peso mínimo en kg"
    )
    max_weight = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Peso máximo en kg"
    )
    
    # Tiempos de entrega
    estimated_days_min = models.PositiveIntegerField(default=1)
    estimated_days_max = models.PositiveIntegerField(default=3)
    
    # Estado y configuración
    is_active = models.BooleanField(default=True)
    requires_signature = models.BooleanField(default=False)
    is_insured = models.BooleanField(default=False)
    
    # Configuración del transportista
    carrier_config = models.JSONField(
        null=True,
        blank=True,
        help_text="Configuración específica del transportista"
    )
    
    # Orden de visualización
    display_order = models.PositiveIntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['shipping_zone', 'display_order', 'name']
        unique_together = ['shipping_zone', 'code']
        indexes = [
            models.Index(fields=['is_active', 'display_order']),
            models.Index(fields=['method_type']),
        ]

    def __str__(self):
        return f"{self.name} - {self.shipping_zone.name}"

    def calculate_shipping_cost(self, weight=0, declared_value=0):
        """Calcula el costo de envío basado en peso y valor"""
        total_cost = self.base_cost
        
        # Agregar costo por peso
        if weight > 0 and self.cost_per_kg > 0:
            total_cost += weight * self.cost_per_kg
        
        return total_cost

    def is_available_for_weight(self, weight):
        """Verifica si el método está disponible para un peso específico"""
        if not self.is_active:
            return False
        
        if self.min_weight and weight < self.min_weight:
            return False
        
        if self.max_weight and weight > self.max_weight:
            return False
        
        return True

    @property
    def estimated_delivery_range(self):
        """Retorna el rango de días de entrega como string"""
        if self.estimated_days_min == self.estimated_days_max:
            return f"{self.estimated_days_min} día{'s' if self.estimated_days_min != 1 else ''}"
        return f"{self.estimated_days_min}-{self.estimated_days_max} días"


class Shipment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('processing', 'Procesando'),
        ('shipped', 'Enviado'),
        ('in_transit', 'En Tránsito'),
        ('out_for_delivery', 'En Reparto'),
        ('delivered', 'Entregado'),
        ('failed_delivery', 'Entrega Fallida'),
        ('returned', 'Devuelto'),
        ('cancelled', 'Cancelado'),
    ]

    # Relación con la orden
    order = models.OneToOneField(
        'orders.Order',
        on_delete=models.CASCADE,
        related_name='shipment'
    )
    
    # Método y dirección de envío
    shipping_method = models.ForeignKey(
        ShippingMethod,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    shipping_address = models.ForeignKey(
        Address,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='shipments'
    )
    
    # Información del envío
    tracking_number = models.CharField(
        max_length=255,
        unique=True,
        null=True,
        blank=True,
        db_index=True
    )
    carrier = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Transportista (Correo Argentino, OCA, Andreani, etc.)"
    )
    
    # Estado y fechas
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    shipped_at = models.DateTimeField(null=True, blank=True)
    estimated_delivery_date = models.DateTimeField(null=True, blank=True)
    actual_delivery_date = models.DateTimeField(null=True, blank=True)
    
    # Información física
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    weight = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Peso en kilogramos"
    )
    dimensions = models.JSONField(
        null=True,
        blank=True,
        help_text="Dimensiones del paquete: {length, width, height} en cm"
    )
    
    # Información adicional
    notes = models.TextField(blank=True, null=True)
    special_instructions = models.TextField(blank=True, null=True)
    
    # Información del destinatario
    recipient_signature = models.CharField(max_length=255, blank=True, null=True)
    delivered_to = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Persona que recibió el paquete"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['tracking_number']),
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['carrier', 'status']),
        ]

    def __str__(self):
        return f"Envío {self.tracking_number or self.id} - Orden {self.order.order_number}"

    def save(self, *args, **kwargs):
        # Generar número de seguimiento si no existe
        if not self.tracking_number:
            import uuid
            self.tracking_number = f"SHIP-{uuid.uuid4().hex[:10].upper()}"
        
        super().save(*args, **kwargs)

    @property
    def is_delivered(self):
        """Verifica si el envío fue entregado"""
        return self.status == 'delivered'

    @property
    def is_in_transit(self):
        """Verifica si el envío está en tránsito"""
        return self.status in ['shipped', 'in_transit', 'out_for_delivery']

    @property
    def delivery_delay_days(self):
        """Calcula los días de retraso en la entrega"""
        if not self.estimated_delivery_date or not self.actual_delivery_date:
            return 0
        
        delay = (self.actual_delivery_date - self.estimated_delivery_date).days
        return max(0, delay)


class TrackingEvent(models.Model):
    EVENT_TYPES = [
        ('created', 'Envío Creado'),
        ('picked_up', 'Recogido'),
        ('in_transit', 'En Tránsito'),
        ('arrived_facility', 'Llegó a Instalación'),
        ('departed_facility', 'Salió de Instalación'),
        ('out_for_delivery', 'En Reparto'),
        ('delivered', 'Entregado'),
        ('delivery_attempted', 'Intento de Entrega'),
        ('returned_to_sender', 'Devuelto al Remitente'),
        ('exception', 'Excepción'),
        ('customs_clearance', 'Despacho Aduanero'),
    ]

    # Relación con el envío
    shipment = models.ForeignKey(
        Shipment,
        on_delete=models.CASCADE,
        related_name='tracking_events'
    )
    
    # Información del evento
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)
    description = models.TextField()
    
    # Ubicación
    location = models.CharField(max_length=255, blank=True, null=True)
    facility = models.CharField(max_length=255, blank=True, null=True)
    
    # Fecha y hora del evento
    event_datetime = models.DateTimeField(db_index=True)
    
    # Información adicional
    notes = models.TextField(blank=True, null=True)
    
    # Datos del transportista
    carrier_event_code = models.CharField(max_length=50, blank=True, null=True)
    carrier_raw_data = models.JSONField(
        null=True,
        blank=True,
        help_text="Datos completos del evento del transportista"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-event_datetime']
        indexes = [
            models.Index(fields=['shipment', 'event_datetime']),
            models.Index(fields=['event_type']),
        ]

    def __str__(self):
        return f"{self.get_event_type_display()} - {self.shipment.tracking_number}"

    @property
    def is_delivery_event(self):
        """Verifica si es un evento de entrega"""
        return self.event_type in ['delivered', 'delivery_attempted']

    @property
    def is_exception_event(self):
        """Verifica si es un evento de excepción"""
        return self.event_type == 'exception'
