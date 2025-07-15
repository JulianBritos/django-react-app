from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

class Command(BaseCommand):
    help = 'Probar el sistema de roles y crear usuarios de prueba'

    def handle(self, *args, **options):
        self.stdout.write("=== PRUEBA DEL SISTEMA DE ROLES ===")
        
        # Verificar usuarios existentes
        users = User.objects.all()
        self.stdout.write(f"Usuarios existentes: {users.count()}")
        
        for user in users:
            self.stdout.write(f"- {user.email}: rol={getattr(user, 'role', 'N/A')}, is_superuser={user.is_superuser}")
        
        # Crear usuario admin de prueba si no existe
        admin_email = "admin@test.com"
        if not User.objects.filter(email=admin_email).exists():
            try:
                with transaction.atomic():
                    admin_user = User.objects.create_user(
                        email=admin_email,
                        password="admin123",
                        first_name="Admin",
                        last_name="Test",
                        role="admin",
                        is_staff=True,
                        is_active=True
                    )
                    self.stdout.write(
                        self.style.SUCCESS(f"Usuario admin creado: {admin_user.email} (rol: {admin_user.role})")
                    )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"Error creando admin: {str(e)}")
                )
        else:
            admin_user = User.objects.get(email=admin_email)
            self.stdout.write(f"Usuario admin ya existe: {admin_user.email} (rol: {admin_user.role})")
        
        # Crear usuario cliente de prueba
        cliente_email = "cliente@test.com"
        if not User.objects.filter(email=cliente_email).exists():
            try:
                with transaction.atomic():
                    cliente_user = User.objects.create_user(
                        email=cliente_email,
                        password="cliente123",
                        first_name="Cliente",
                        last_name="Test"
                        # No especificar role, debería usar el default
                    )
                    self.stdout.write(
                        self.style.SUCCESS(f"Usuario cliente creado: {cliente_user.email} (rol: {cliente_user.role})")
                    )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"Error creando cliente: {str(e)}")
                )
        else:
            cliente_user = User.objects.get(email=cliente_email)
            self.stdout.write(f"Usuario cliente ya existe: {cliente_user.email} (rol: {cliente_user.role})")
        
        # Crear usuario vendedor de prueba
        vendedor_email = "vendedor@test.com"
        if not User.objects.filter(email=vendedor_email).exists():
            try:
                with transaction.atomic():
                    vendedor_user = User.objects.create_user(
                        email=vendedor_email,
                        password="vendedor123",
                        first_name="Vendedor",
                        last_name="Test",
                        role="vendedor"
                    )
                    self.stdout.write(
                        self.style.SUCCESS(f"Usuario vendedor creado: {vendedor_user.email} (rol: {vendedor_user.role})")
                    )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"Error creando vendedor: {str(e)}")
                )
        else:
            vendedor_user = User.objects.get(email=vendedor_email)
            self.stdout.write(f"Usuario vendedor ya existe: {vendedor_user.email} (rol: {vendedor_user.role})")
        
        # Verificar propiedades
        self.stdout.write("\n=== VERIFICACIÓN DE PROPIEDADES ===")
        for user in User.objects.all():
            self.stdout.write(f"Usuario: {user.email}")
            self.stdout.write(f"  - Rol: {user.role}")
            self.stdout.write(f"  - is_admin: {user.is_admin}")
            self.stdout.write(f"  - is_vendedor: {user.is_vendedor}")
            self.stdout.write(f"  - is_cliente: {user.is_cliente}")
            self.stdout.write(f"  - is_superuser: {user.is_superuser}")
            self.stdout.write("")
        
        self.stdout.write(self.style.SUCCESS("Prueba completada")) 