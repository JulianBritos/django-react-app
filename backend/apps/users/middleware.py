import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
import logging
import re

logger = logging.getLogger(__name__)
User = get_user_model()

class JWTAuthenticationMiddleware(MiddlewareMixin):
    """
    Middleware personalizado para autenticación JWT en APIs
    Permite acceso público a rutas de e-commerce mientras protege rutas administrativas
    """
    
    def process_request(self, request):
        # Solo aplicar a rutas de API
        if not request.path.startswith('/api/') and not request.path.startswith('/apps/'):
            return None
            
        # Rutas completamente públicas (sin autenticación)
        public_paths = [
            '/api/users/test/',
            '/dj_rest_auth/',
            '/dj_rest_auth/registration/',
            '/reset/password/',
            '/apps/products/products/',  # Ver productos (público)
            '/apps/products/categories/',  # Ver categorías (público)
            '/apps/products/attributes/',  # Ver atributos (público)
            '/apps/products/attributeoptions/',  # Ver opciones de atributos (público)
        ]
        
        # Rutas que requieren autenticación pero permiten usuarios anónimos
        guest_allowed_paths = [
            '/apps/payments/create_preference/',  # Crear preferencia de pago (guest checkout)
            '/apps/payments/webhook-mercadopago/',  # Webhook de MercadoPago
            '/apps/payments/payment_notification/',  # Notificaciones de pago
        ]
        
        # Verificar si es una ruta pública
        if any(request.path.startswith(path) for path in public_paths):
            return None
            
        # Para rutas que permiten guest checkout, no requerir token pero validar si existe
        if any(request.path.startswith(path) for path in guest_allowed_paths):
            return self._handle_guest_request(request)
            
        # Para todas las demás rutas, requerir autenticación
        return self._handle_authenticated_request(request)
    
    def _handle_guest_request(self, request):
        """
        Maneja requests que permiten usuarios anónimos (guest checkout)
        """
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header.startswith('Bearer '):
            # Usuario anónimo - permitir acceso
            request.user = None
            request.user_role = 'guest'
            request.user_permissions = {
                'is_admin': False,
                'is_vendedor': False,
                'is_cliente': False,
                'is_guest': True,
            }
            logger.info(f"Usuario anónimo accediendo a: {request.path}")
            return None
            
        # Si hay token, validarlo pero no requerirlo
        token = auth_header.split(' ')[1]
        try:
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            user = User.objects.get(id=user_id, is_active=True)
            request.user = user
            request.user_role = user.role
            request.user_permissions = {
                'is_admin': user.is_admin,
                'is_vendedor': user.is_vendedor,
                'is_cliente': user.is_cliente,
                'is_guest': False,
            }
            logger.info(f"Usuario autenticado en guest checkout: {user.email} (Rol: {user.role})")
        except (InvalidToken, TokenError, User.DoesNotExist):
            # Token inválido pero permitir acceso como guest
            request.user = None
            request.user_role = 'guest'
            request.user_permissions = {
                'is_admin': False,
                'is_vendedor': False,
                'is_cliente': False,
                'is_guest': True,
            }
            logger.warning(f"Token inválido en guest checkout, permitiendo acceso anónimo: {request.path}")
            
        return None
    
    def _handle_authenticated_request(self, request):
        """
        Maneja requests que requieren autenticación obligatoria
        """
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header.startswith('Bearer '):
            return JsonResponse({
                'error': 'Token de autenticación requerido',
                'detail': 'Debe incluir el header Authorization: Bearer <token>'
            }, status=401)
            
        token = auth_header.split(' ')[1]
        
        try:
            # Validar token JWT
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            
            # Obtener usuario
            user = User.objects.get(id=user_id, is_active=True)
            request.user = user
            
            # Agregar información adicional al request
            request.user_role = user.role
            request.user_permissions = {
                'is_admin': user.is_admin,
                'is_vendedor': user.is_vendedor,
                'is_cliente': user.is_cliente,
                'is_guest': False,
            }
            
            logger.info(f"Usuario autenticado: {user.email} (Rol: {user.role}) - Path: {request.path}")
            
        except (InvalidToken, TokenError) as e:
            logger.warning(f"Token inválido: {str(e)} - Path: {request.path}")
            return JsonResponse({
                'error': 'Token inválido o expirado',
                'detail': 'El token de autenticación no es válido'
            }, status=401)
            
        except User.DoesNotExist:
            logger.warning(f"Usuario no encontrado para token - Path: {request.path}")
            return JsonResponse({
                'error': 'Usuario no encontrado',
                'detail': 'El usuario asociado al token no existe'
            }, status=401)
            
        except Exception as e:
            logger.error(f"Error en autenticación: {str(e)} - Path: {request.path}")
            return JsonResponse({
                'error': 'Error de autenticación',
                'detail': 'Error interno del servidor'
            }, status=500)
            
        return None

class RoleBasedAccessMiddleware(MiddlewareMixin):
    """
    Middleware para control de acceso basado en roles
    Considera usuarios anónimos para guest checkout
    """
    
    def process_request(self, request):
        # Solo aplicar a rutas de API
        if not request.path.startswith('/api/') and not request.path.startswith('/apps/'):
            return None
            
        # Rutas completamente públicas
        public_paths = [
            '/api/users/test/',
            '/dj_rest_auth/',
            '/dj_rest_auth/registration/',
            '/reset/password/',
            '/apps/products/products/',
            '/apps/products/categories/',
            '/apps/products/attributes/',
            '/apps/products/attributeoptions/',
        ]
        
        if any(request.path.startswith(path) for path in public_paths):
            return None
            
        # Rutas que permiten guest checkout
        guest_allowed_paths = [
            '/apps/payments/create_preference/',
            '/apps/payments/webhook-mercadopago/',
            '/apps/payments/payment_notification/',
        ]
        
        # Para rutas de guest checkout, permitir acceso
        if any(request.path.startswith(path) for path in guest_allowed_paths):
            return None
            
        # Rutas que requieren autenticación específica
        admin_only_paths = [
            '/api/users/',  # Gestión de usuarios
            '/admin/',
            '/apps/products/productattributes/',  # Gestión de variantes de productos
            '/apps/products/productattributeoptionlinks/',  # Gestión de enlaces de atributos
        ]
        
        vendedor_paths = [
            '/apps/products/attributes/',  # Gestión de atributos (solo vendedores/admins)
            '/apps/orders/',  # Gestión de pedidos
        ]
        
        # Verificar que el usuario esté autenticado para rutas protegidas
        if not hasattr(request, 'user') or not request.user:
            return JsonResponse({
                'error': 'Acceso denegado',
                'detail': 'Debe estar autenticado para acceder a este recurso'
            }, status=403)
            
        # Verificar acceso según rol
        if any(request.path.startswith(path) for path in admin_only_paths):
            if not request.user.is_admin and not request.user.is_superuser:
                return JsonResponse({
                    'error': 'Acceso denegado',
                    'detail': 'Se requieren permisos de administrador'
                }, status=403)
                
        elif any(request.path.startswith(path) for path in vendedor_paths):
            if not (request.user.is_vendedor or request.user.is_admin or request.user.is_superuser):
                return JsonResponse({
                    'error': 'Acceso denegado',
                    'detail': 'Se requieren permisos de vendedor o administrador'
                }, status=403)
                
        return None

class APILoggingMiddleware(MiddlewareMixin):
    """
    Middleware para logging de requests a APIs
    Incluye información sobre usuarios anónimos
    """
    
    def process_request(self, request):
        if request.path.startswith('/api/') or request.path.startswith('/apps/'):
            user_info = getattr(request.user, 'email', 'Anonymous')
            user_role = getattr(request, 'user_role', 'unknown')
            logger.info(f"API Request: {request.method} {request.path} - User: {user_info} (Role: {user_role})")
            
    def process_response(self, request, response):
        if request.path.startswith('/api/') or request.path.startswith('/apps/'):
            user_info = getattr(request.user, 'email', 'Anonymous')
            user_role = getattr(request, 'user_role', 'unknown')
            logger.info(f"API Response: {request.method} {request.path} - Status: {response.status_code} - User: {user_info} (Role: {user_role})")
        return response

class GuestUserMiddleware(MiddlewareMixin):
    """
    Middleware para manejar usuarios anónimos en e-commerce
    Crea un identificador de sesión para guest users
    """
    
    def process_request(self, request):
        # Solo aplicar a rutas de e-commerce
        if not request.path.startswith('/apps/products/') and not request.path.startswith('/apps/payments/'):
            return None
            
        # Si el usuario no está autenticado, crear un identificador de sesión
        if not hasattr(request, 'user') or not request.user:
            session_id = request.session.get('guest_session_id')
            if not session_id:
                import uuid
                session_id = str(uuid.uuid4())
                request.session['guest_session_id'] = session_id
                
            request.guest_session_id = session_id
            logger.info(f"Guest session created: {session_id} - Path: {request.path}")
            
        return None 