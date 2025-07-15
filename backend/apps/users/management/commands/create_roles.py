from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

class Command(BaseCommand):
    help = 'Crear usuarios con roles específicos'

    def add_arguments(self, parser):
        parser.add_argument('--admin', action='store_true', help='Crear usuario administrador')
        parser.add_argument('--vendedor', action='store_true', help='Crear usuario vendedor')
        parser.add_argument('--cliente', action='store_true', help='Crear usuario cliente')
        parser.add_argument('--email', type=str, required=True, help='Email del usuario')
        parser.add_argument('--password', type=str, required=True, help='Contraseña del usuario')
        parser.add_argument('--first-name', type=str, required=True, help='Nombre del usuario')
        parser.add_argument('--last-name', type=str, default='', help='Apellido del usuario')

    def handle(self, *args, **options):
        email = options['email']
        password = options['password']
        first_name = options['first_name']
        last_name = options['last_name']
        
        # Determinar el rol
        if options['admin']:
            role = 'admin'
        elif options['vendedor']:
            role = 'vendedor'
        elif options['cliente']:
            role = 'cliente'
        else:
            self.stdout.write(
                self.style.ERROR('Debe especificar un rol: --admin, --vendedor, o --cliente')
            )
            return

        try:
            with transaction.atomic():
                # Verificar si el usuario ya existe
                if User.objects.filter(email=email).exists():
                    self.stdout.write(
                        self.style.WARNING(f'El usuario con email {email} ya existe')
                    )
                    return

                # Crear el usuario
                user = User.objects.create_user(
                    email=email,
                    password=password,
                    first_name=first_name,
                    last_name=last_name,
                    role=role,
                    is_active=True
                )

                # Si es admin, también hacerlo staff
                if role == 'admin':
                    user.is_staff = True
                    user.save()

                self.stdout.write(
                    self.style.SUCCESS(
                        f'Usuario {role} creado exitosamente: {email}'
                    )
                )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error al crear usuario: {str(e)}')
            ) 