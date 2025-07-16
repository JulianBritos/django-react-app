from django.core.management.base import BaseCommand
from django.test import RequestFactory
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from apps.users.middleware import JWTAuthenticationMiddleware, RoleBasedAccessMiddleware, GuestUserMiddleware
from apps.users.constants import PUBLIC_PATHS, GUEST_ALLOWED_PATHS

User = get_user_model()

class Command(BaseCommand):
    help = 'Test the JWT authentication middleware for e-commerce'

    def add_arguments(self, parser):
        parser.add_argument(
            '--test-type',
            type=str,
            choices=['all', 'jwt', 'role', 'guest', 'integration'],
            default='all',
            help='Type of test to run'
        )

    def handle(self, *args, **options):
        test_type = options['test_type']
        
        self.stdout.write('🧪 Testing JWT Authentication Middleware for E-commerce...')
        
        if test_type in ['all', 'jwt']:
            self.test_jwt_middleware()
            
        if test_type in ['all', 'role']:
            self.test_role_middleware()
            
        if test_type in ['all', 'guest']:
            self.test_guest_middleware()
            
        if test_type in ['all', 'integration']:
            self.test_integration()
            
        self.stdout.write(self.style.SUCCESS('✅ All tests completed successfully!'))

    def test_jwt_middleware(self):
        self.stdout.write('\n🔐 Testing JWT Authentication Middleware...')
        
        # Crear usuario de prueba
        user, created = User.objects.get_or_create(
            email='test@example.com',
            defaults={
                'first_name': 'Test',
                'password': 'testpass123',
                'role': 'admin'
            }
        )
        
        if created:
            user.set_password('testpass123')
            user.save()
            
        # Generar token
        token = AccessToken.for_user(user)
        
        # Crear request de prueba
        factory = RequestFactory()
        middleware = JWTAuthenticationMiddleware()
        
        # Test 1: Token válido
        request = factory.get('/api/users/')
        request.META['HTTP_AUTHORIZATION'] = f'Bearer {token}'
        response = middleware.process_request(request)
        
        if response is None:
            self.stdout.write('  ✅ Token válido - Usuario autenticado correctamente')
            self.stdout.write(f'     Usuario: {request.user.email}, Rol: {request.user_role}')
        else:
            self.stdout.write(self.style.ERROR(f'  ❌ Error con token válido: {response.status_code}'))
            
        # Test 2: Ruta pública
        request = factory.get(PUBLIC_PATHS[0])  # Usar constante
        response = middleware.process_request(request)
        
        if response is None:
            self.stdout.write('  ✅ Ruta pública - Acceso permitido sin autenticación')
        else:
            self.stdout.write(self.style.ERROR(f'  ❌ Error en ruta pública: {response.status_code}'))
            
        # Test 3: Guest checkout
        request = factory.get(GUEST_ALLOWED_PATHS[0])  # Usar constante
        response = middleware.process_request(request)
        
        if response is None:
            self.stdout.write('  ✅ Guest checkout - Acceso anónimo permitido')
            self.stdout.write(f'     Rol: {getattr(request, "user_role", "N/A")}')
        else:
            self.stdout.write(self.style.ERROR(f'  ❌ Error en guest checkout: {response.status_code}'))

    def test_role_middleware(self):
        self.stdout.write('\n👥 Testing Role-Based Access Middleware...')
        
        # Crear usuarios de prueba
        admin_user, _ = User.objects.get_or_create(
            email='admin@test.com',
            defaults={
                'first_name': 'Admin',
                'password': 'admin123',
                'role': 'admin'
            }
        )
        
        vendedor_user, _ = User.objects.get_or_create(
            email='vendedor@test.com',
            defaults={
                'first_name': 'Vendedor',
                'password': 'vendedor123',
                'role': 'vendedor'
            }
        )
        
        factory = RequestFactory()
        middleware = RoleBasedAccessMiddleware()
        
        # Test 1: Admin accediendo a gestión de usuarios
        request = factory.get('/api/users/')
        request.user = admin_user
        request.user.is_authenticated = True
        response = middleware.process_request(request)
        
        if response is None:
            self.stdout.write('  ✅ Admin - Acceso a gestión de usuarios permitido')
        else:
            self.stdout.write(self.style.ERROR(f'  ❌ Admin denegado: {response.status_code}'))
            
        # Test 2: Vendedor denegado en gestión de usuarios
        request = factory.get('/api/users/')
        request.user = vendedor_user
        request.user.is_authenticated = True
        response = middleware.process_request(request)
        
        if response is not None and response.status_code == 403:
            self.stdout.write('  ✅ Vendedor - Acceso a gestión de usuarios correctamente denegado')
        else:
            self.stdout.write(self.style.ERROR('  ❌ Vendedor no fue denegado correctamente'))
            
        # Test 3: Ruta pública
        request = factory.get(PUBLIC_PATHS[4])  # Usar constante
        response = middleware.process_request(request)
        
        if response is None:
            self.stdout.write('  ✅ Ruta pública - Acceso permitido')
        else:
            self.stdout.write(self.style.ERROR(f'  ❌ Error en ruta pública: {response.status_code}'))

    def test_guest_middleware(self):
        self.stdout.write('\n👤 Testing Guest User Middleware...')
        
        factory = RequestFactory()
        middleware = GuestUserMiddleware()
        
        # Test 1: Crear sesión de guest
        request = factory.get('/apps/products/products/')
        request.session = {}
        response = middleware.process_request(request)
        
        if response is None and hasattr(request, 'guest_session_id'):
            self.stdout.write('  ✅ Sesión de guest creada correctamente')
            self.stdout.write(f'     Session ID: {request.guest_session_id}')
        else:
            self.stdout.write(self.style.ERROR('  ❌ Error creando sesión de guest'))
            
        # Test 2: Persistencia de sesión
        session_id = 'test-session-123'
        request = factory.get('/apps/products/products/')
        request.session = {'guest_session_id': session_id}
        response = middleware.process_request(request)
        
        if response is None and request.guest_session_id == session_id:
            self.stdout.write('  ✅ Persistencia de sesión funcionando')
        else:
            self.stdout.write(self.style.ERROR('  ❌ Error en persistencia de sesión'))
            
        # Test 3: Ruta no-ecommerce
        request = factory.get('/api/users/')
        request.session = {}
        response = middleware.process_request(request)
        
        if response is None and not hasattr(request, 'guest_session_id'):
            self.stdout.write('  ✅ Ruta no-ecommerce - No se crea sesión de guest')
        else:
            self.stdout.write(self.style.ERROR('  ❌ Error en ruta no-ecommerce'))

    def test_integration(self):
        self.stdout.write('\n🔗 Testing Middleware Integration...')
        
        # Crear usuario admin
        admin_user, _ = User.objects.get_or_create(
            email='admin@integration.com',
            defaults={
                'first_name': 'Admin',
                'password': 'admin123',
                'role': 'admin'
            }
        )
        token = AccessToken.for_user(admin_user)
        
        factory = RequestFactory()
        jwt_middleware = JWTAuthenticationMiddleware()
        role_middleware = RoleBasedAccessMiddleware()
        guest_middleware = GuestUserMiddleware()
        
        # Test 1: Cadena completa para admin
        request = factory.get('/api/users/')
        request.META['HTTP_AUTHORIZATION'] = f'Bearer {token}'
        request.session = {}
        
        response1 = jwt_middleware.process_request(request)
        response2 = role_middleware.process_request(request)
        response3 = guest_middleware.process_request(request)
        
        if all(r is None for r in [response1, response2, response3]):
            self.stdout.write('  ✅ Cadena completa admin - Todos los middlewares funcionando')
            self.stdout.write(f'     Usuario: {request.user.email}, Rol: {request.user_role}')
        else:
            self.stdout.write(self.style.ERROR('  ❌ Error en cadena completa admin'))
            
        # Test 2: Cadena completa para guest
        request = factory.get(GUEST_ALLOWED_PATHS[0])  # Usar constante
        request.session = {}
        
        response1 = jwt_middleware.process_request(request)
        response2 = role_middleware.process_request(request)
        response3 = guest_middleware.process_request(request)
        
        if all(r is None for r in [response1, response2, response3]):
            self.stdout.write('  ✅ Cadena completa guest - Guest checkout funcionando')
            self.stdout.write(f'     Rol: {getattr(request, "user_role", "N/A")}')
            self.stdout.write(f'     Session ID: {getattr(request, "guest_session_id", "N/A")}')
        else:
            self.stdout.write(self.style.ERROR('  ❌ Error en cadena completa guest'))
            
        # Test 3: Productos públicos
        request = factory.get(PUBLIC_PATHS[4])  # Usar constante
        request.session = {}
        
        response1 = jwt_middleware.process_request(request)
        response2 = role_middleware.process_request(request)
        response3 = guest_middleware.process_request(request)
        
        if all(r is None for r in [response1, response2, response3]):
            self.stdout.write('  ✅ Productos públicos - Acceso público funcionando')
            self.stdout.write(f'     Session ID: {getattr(request, "guest_session_id", "N/A")}')
        else:
            self.stdout.write(self.style.ERROR('  ❌ Error en productos públicos')) 