import logging
from django.utils.deprecation import MiddlewareMixin
from .constants import (
    PUBLIC_PATHS, GUEST_ALLOWED_PATHS, ADMIN_ONLY_PATHS, VENDEDOR_PATHS
)
from .utils import (
    is_api_path, is_public_path, is_guest_allowed_path, set_guest_user,
    set_authenticated_user, validate_jwt_token, create_error_response,
    extract_token_from_header, log_user_access
)

logger = logging.getLogger(__name__)

class JWTAuthenticationMiddleware(MiddlewareMixin):
    """
    Middleware personalizado para autenticación JWT en APIs
    Permite acceso público a rutas de e-commerce mientras protege rutas administrativas
    """
    
    def process_request(self, request):
        # Solo aplicar a rutas de API
        if not is_api_path(request.path):
            return None
            
        # Verificar si es una ruta pública
        if is_public_path(request.path, PUBLIC_PATHS):
            return None
            
        # Para rutas que permiten guest checkout, no requerir token pero validar si existe
        if is_guest_allowed_path(request.path, GUEST_ALLOWED_PATHS):
            return self._handle_guest_request(request)
            
        # Para todas las demás rutas, requerir autenticación
        return self._handle_authenticated_request(request)
    
    def _handle_guest_request(self, request):
        """
        Maneja requests que permiten usuarios anónimos (guest checkout)
        """
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        token = extract_token_from_header(auth_header)
        
        if not token:
            # Usuario anónimo - permitir acceso
            set_guest_user(request)
            log_user_access(request, {'email': 'Anonymous', 'role': 'guest'}, "anónimo accediendo a")
            return None
            
        # Si hay token, validarlo pero no requerirlo
        user, error = validate_jwt_token(token)
        if user:
            set_authenticated_user(request, user)
            user_info = {'email': getattr(user, 'email', 'Unknown'), 'role': getattr(user, 'role', 'Unknown')}
            log_user_access(request, user_info, "autenticado en guest checkout")
        else:
            # Token inválido pero permitir acceso como guest
            set_guest_user(request)
            logger.warning(f"Token inválido en guest checkout, permitiendo acceso anónimo: {request.path}")
            
        return None
    
    def _handle_authenticated_request(self, request):
        """
        Maneja requests que requieren autenticación obligatoria
        """
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        token = extract_token_from_header(auth_header)
        
        if not token:
            return create_error_response('token_required')
            
        user, error = validate_jwt_token(token)
        if error:
            return create_error_response(error)
            
        set_authenticated_user(request, user)
        log_user_access(request, {'email': user.email, 'role': user.role}, "autenticado")
        
        return None

class RoleBasedAccessMiddleware(MiddlewareMixin):
    """
    Middleware para control de acceso basado en roles
    Considera usuarios anónimos para guest checkout
    """
    
    def process_request(self, request):
        # Solo aplicar a rutas de API
        if not is_api_path(request.path):
            return None
            
        # Rutas completamente públicas
        if is_public_path(request.path, PUBLIC_PATHS):
            return None
            
        # Para rutas de guest checkout, permitir acceso
        if is_guest_allowed_path(request.path, GUEST_ALLOWED_PATHS):
            return None
            
        # Verificar que el usuario esté autenticado para rutas protegidas
        if not hasattr(request, 'user') or not request.user:
            return create_error_response('access_denied', 403)
            
        # Verificar acceso según rol
        if is_public_path(request.path, ADMIN_ONLY_PATHS):
            if not request.user.is_admin and not request.user.is_superuser:
                return create_error_response('admin_required', 403)
                
        elif is_public_path(request.path, VENDEDOR_PATHS):
            if not (request.user.is_vendedor or request.user.is_admin or request.user.is_superuser):
                return create_error_response('vendedor_required', 403)
                
        return None

class APILoggingMiddleware(MiddlewareMixin):
    """
    Middleware para logging de requests a APIs
    Incluye información sobre usuarios anónimos
    """
    
    def process_request(self, request):
        if is_api_path(request.path):
            user_info = getattr(request.user, 'email', 'Anonymous')
            user_role = getattr(request, 'user_role', 'unknown')
            logger.info(f"API Request: {request.method} {request.path} - User: {user_info} (Role: {user_role})")
            
    def process_response(self, request, response):
        if is_api_path(request.path):
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
        if not (request.path.startswith('/apps/products/') or request.path.startswith('/apps/payments/')):
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