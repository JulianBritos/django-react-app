from django.contrib.auth.models import BaseUserManager
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.core.validators import validate_email

class CustomUserManager(BaseUserManager):
    def email_validation(self, email):
        try:
            validate_email(email)
        except ValidationError:
            raise ValidationError(_("Tienes que agregar un correo valido"))
    def create_user(self, email, first_name, last_name=None, password=None, **extra_fields):
        """
        Create and return a user with an email and password.
        """
        if not email:
            raise ValueError(_("El usuario debe tener un correo electronico"))
        self.email_validation(email)
        email = self.normalize_email(email)
        if not first_name:
            raise ValueError(_("El usuario debe tener un nombre"))
        user = self.model(
            email=email,
            first_name=first_name,
            last_name=last_name,
            **extra_fields
        )
        user.set_password(password)
        extra_fields.setdefault('is_superuser', False)
        extra_fields.setdefault('is_staff', False)
        user.save()
        return user
    def create_superuser(self, email, first_name, last_name=None, password=None, **extra_fields):
        
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_active', True)

        if not email:
            raise ValueError(_("El usuario debe tener un correo electronico"))
        self.email_validation(email)
        email = self.normalize_email(email)
        
        if not first_name:
            raise ValueError(_("El usuario debe tener un nombre"))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_("El superusuario debe tener is_superuser=True."))
        if extra_fields.get('is_staff') is not True:
            raise ValueError(_("El superusuario debe tener is_staff=True."))
        user = self.create_user(email, first_name, last_name, password, **extra_fields)
        user.save()
        return user
     