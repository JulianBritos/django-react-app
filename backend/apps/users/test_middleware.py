from django.test import TestCase, RequestFactory
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from .middleware import JWTAuthenticationMiddleware, RoleBasedAccessMiddleware, GuestUserMiddleware
from .models import CustomUserModel
from .constants import PUBLIC_PATHS, GUEST_ALLOWED_PATHS

User = get_user_model()

class JWTAuthenticationMiddlewareTest(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.middleware = JWTAuthenticationMiddleware()
        self.user = CustomUserModel.objects.create_user(
            email='test@example.com',
            first_name='Test',
            password='testpass123',
            role='admin'
        )
        self.token = AccessToken.for_user(self.user)

    def test_valid_token(self):
        request = self.factory.get('/api/users/')
        request.META['HTTP_AUTHORIZATION'] = f'Bearer {self.token}'
        
        response = self.middleware.process_request(request)
        
        self.assertIsNone(response)  # No debe retornar respuesta (éxito)
        self.assertEqual(request.user, self.user)
        self.assertEqual(request.user_role, 'admin')

    def test_invalid_token(self):
        request = self.factory.get('/api/users/')
        request.META['HTTP_AUTHORIZATION'] = 'Bearer invalid_token'
        
        response = self.middleware.process_request(request)
        
        self.assertIsNotNone(response)
        self.assertEqual(response.status_code, 401)

    def test_missing_token(self):
        request = self.factory.get('/api/users/')
        
        response = self.middleware.process_request(request)
        
        self.assertIsNotNone(response)
        self.assertEqual(response.status_code, 401)

    def test_public_path(self):
        request = self.factory.get(PUBLIC_PATHS[0])  # Usar constante
        
        response = self.middleware.process_request(request)
        
        self.assertIsNone(response)  # No debe procesar rutas públicas

    def test_guest_checkout_path(self):
        request = self.factory.get(GUEST_ALLOWED_PATHS[0])  # Usar constante
        
        response = self.middleware.process_request(request)
        
        self.assertIsNone(response)  # Debe permitir acceso anónimo
        self.assertEqual(request.user_role, 'guest')

    def test_guest_checkout_with_valid_token(self):
        request = self.factory.get(GUEST_ALLOWED_PATHS[0])  # Usar constante
        request.META['HTTP_AUTHORIZATION'] = f'Bearer {self.token}'
        
        response = self.middleware.process_request(request)
        
        self.assertIsNone(response)  # Debe permitir acceso
        self.assertEqual(request.user, self.user)
        self.assertEqual(request.user_role, 'admin')

    def test_guest_checkout_with_invalid_token(self):
        request = self.factory.get(GUEST_ALLOWED_PATHS[0])  # Usar constante
        request.META['HTTP_AUTHORIZATION'] = 'Bearer invalid_token'
        
        response = self.middleware.process_request(request)
        
        self.assertIsNone(response)  # Debe permitir acceso como guest
        self.assertEqual(request.user_role, 'guest')

class RoleBasedAccessMiddlewareTest(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.middleware = RoleBasedAccessMiddleware()
        self.admin_user = CustomUserModel.objects.create_user(
            email='admin@example.com',
            first_name='Admin',
            password='admin123',
            role='admin'
        )
        self.vendedor_user = CustomUserModel.objects.create_user(
            email='vendedor@example.com',
            first_name='Vendedor',
            password='vendedor123',
            role='vendedor'
        )
        self.cliente_user = CustomUserModel.objects.create_user(
            email='cliente@example.com',
            first_name='Cliente',
            password='cliente123',
            role='cliente'
        )

    def test_admin_access_to_users(self):
        request = self.factory.get('/api/users/')
        request.user = self.admin_user
        request.user.is_authenticated = True
        
        response = self.middleware.process_request(request)
        
        self.assertIsNone(response)  # Debe permitir acceso

    def test_vendedor_denied_access_to_users(self):
        request = self.factory.get('/api/users/')
        request.user = self.vendedor_user
        request.user.is_authenticated = True
        
        response = self.middleware.process_request(request)
        
        self.assertIsNotNone(response)
        self.assertEqual(response.status_code, 403)

    def test_cliente_denied_access_to_users(self):
        request = self.factory.get('/api/users/')
        request.user = self.cliente_user
        request.user.is_authenticated = True
        
        response = self.middleware.process_request(request)
        
        self.assertIsNotNone(response)
        self.assertEqual(response.status_code, 403)

    def test_public_path_access(self):
        request = self.factory.get(PUBLIC_PATHS[4])  # Usar constante
        
        response = self.middleware.process_request(request)
        
        self.assertIsNone(response)  # Debe permitir acceso público

    def test_guest_checkout_access(self):
        request = self.factory.get(GUEST_ALLOWED_PATHS[0])  # Usar constante
        
        response = self.middleware.process_request(request)
        
        self.assertIsNone(response)  # Debe permitir acceso guest

    def test_vendedor_access_to_orders(self):
        request = self.factory.get('/apps/orders/')
        request.user = self.vendedor_user
        request.user.is_authenticated = True
        
        response = self.middleware.process_request(request)
        
        self.assertIsNone(response)  # Debe permitir acceso

    def test_cliente_denied_access_to_orders(self):
        request = self.factory.get('/apps/orders/')
        request.user = self.cliente_user
        request.user.is_authenticated = True
        
        response = self.middleware.process_request(request)
        
        self.assertIsNotNone(response)
        self.assertEqual(response.status_code, 403)

class GuestUserMiddlewareTest(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.middleware = GuestUserMiddleware()

    def test_guest_session_creation(self):
        request = self.factory.get('/apps/products/products/')
        request.session = {}
        
        response = self.middleware.process_request(request)
        
        self.assertIsNone(response)
        self.assertIsNotNone(request.guest_session_id)

    def test_guest_session_persistence(self):
        request = self.factory.get('/apps/products/products/')
        request.session = {'guest_session_id': 'test-session-id'}
        
        response = self.middleware.process_request(request)
        
        self.assertIsNone(response)
        self.assertEqual(request.guest_session_id, 'test-session-id')

    def test_non_ecommerce_path(self):
        request = self.factory.get('/api/users/')
        request.session = {}
        
        response = self.middleware.process_request(request)
        
        self.assertIsNone(response)
        self.assertFalse(hasattr(request, 'guest_session_id'))

class MiddlewareIntegrationTest(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.jwt_middleware = JWTAuthenticationMiddleware()
        self.role_middleware = RoleBasedAccessMiddleware()
        self.guest_middleware = GuestUserMiddleware()
        
        self.admin_user = CustomUserModel.objects.create_user(
            email='admin@example.com',
            first_name='Admin',
            password='admin123',
            role='admin'
        )
        self.token = AccessToken.for_user(self.admin_user)

    def test_full_middleware_chain_admin(self):
        request = self.factory.get('/api/users/')
        request.META['HTTP_AUTHORIZATION'] = f'Bearer {self.token}'
        request.session = {}
        
        # Simular cadena de middleware
        response1 = self.jwt_middleware.process_request(request)
        response2 = self.role_middleware.process_request(request)
        response3 = self.guest_middleware.process_request(request)
        
        self.assertIsNone(response1)
        self.assertIsNone(response2)
        self.assertIsNone(response3)
        self.assertEqual(request.user, self.admin_user)
        self.assertEqual(request.user_role, 'admin')

    def test_full_middleware_chain_guest(self):
        request = self.factory.get(GUEST_ALLOWED_PATHS[0])  # Usar constante
        request.session = {}
        
        # Simular cadena de middleware
        response1 = self.jwt_middleware.process_request(request)
        response2 = self.role_middleware.process_request(request)
        response3 = self.guest_middleware.process_request(request)
        
        self.assertIsNone(response1)
        self.assertIsNone(response2)
        self.assertIsNone(response3)
        self.assertEqual(request.user_role, 'guest')
        self.assertIsNotNone(request.guest_session_id)

    def test_public_product_access(self):
        request = self.factory.get(PUBLIC_PATHS[4])  # Usar constante
        request.session = {}
        
        # Simular cadena de middleware
        response1 = self.jwt_middleware.process_request(request)
        response2 = self.role_middleware.process_request(request)
        response3 = self.guest_middleware.process_request(request)
        
        self.assertIsNone(response1)
        self.assertIsNone(response2)
        self.assertIsNone(response3)
        self.assertIsNotNone(request.guest_session_id) 