from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    ROLE_CHOICES = (
        (0, 'client'),
        (1, 'admin'),
        (2, 'superadmin'),)

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    birth_date = models.DateField(blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    role = models.IntegerField(choices=ROLE_CHOICES, default="0")

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

    

