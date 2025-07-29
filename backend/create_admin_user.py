import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'projectsSettings.settings')
django.setup()

from django.contrib.auth import get_user_model
from allauth.account.models import EmailAddress

User = get_user_model()

# Crear superusuario si no existe
if not User.objects.filter(email='admin@example.com').exists():
    user = User.objects.create_superuser(
        email='admin@example.com',
        first_name='admin',
        password='admin'
    )
    # Establecer el rol como admin
    user.role = 'admin'
    user.save()
    
    # Crear el registro de EmailAddress verificado
    EmailAddress.objects.get_or_create(
        user=user,
        email=user.email,
        defaults={
            'primary': True,
            'verified': True
        }
    )
    
    print("Superusuario admin creado exitosamente")
    print(f"Email: {user.email}")
    print(f"Contraseña: admin")
    print(f"Rol: {user.role}")
    print(f"Es superusuario: {user.is_superuser}")
    print(f"Es staff: {user.is_staff}")
    print("Email verificado en allauth")
else:
    user = User.objects.get(email='admin@example.com')
    # Actualizar el rol si no es admin
    if user.role != 'admin':
        user.role = 'admin'
        user.save()
        print("Rol actualizado a admin")
    
    # Cambiar la contraseña a 'admin'
    user.set_password('admin')
    user.save()
    
    # Asegurar que el email esté verificado en allauth
    email_address, created = EmailAddress.objects.get_or_create(
        user=user,
        email=user.email,
        defaults={
            'primary': True,
            'verified': True
        }
    )
    
    if created:
        print("Email verificado creado en allauth")
    else:
        # Si ya existe, asegurar que esté verificado
        if not email_address.verified:
            email_address.verified = True
            email_address.save()
            print("Email marcado como verificado en allauth")
    
    print("Contraseña actualizada a 'admin'")
    print(f"Email: {user.email}")
    print(f"Contraseña: admin")
    print(f"Rol: {user.role}")
    print(f"Es superusuario: {user.is_superuser}")
    print(f"Es staff: {user.is_staff}")