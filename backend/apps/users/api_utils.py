from functools import wraps
from django.http import JsonResponse
from rest_framework import status
from rest_framework.response import Response

def get_user_info(request):
    """
    Obtiene información del usuario actual (autenticado o guest)
    """
    if hasattr(request, 'user') and request.user:
        return {
            'user': request.user,
            'role': getattr(request, 'user_role', 'unknown'),
            'permissions': getattr(request, 'user_permissions', {}),
            'is_authenticated': True,
            'is_guest': False
        }
    else:
        return {
            'user': None,
            'role': 'guest',
            'permissions': {
                'is_admin': False,
                'is_vendedor': False,
                'is_cliente': False,
                'is_guest': True,
            },
            'is_authenticated': False,
            'is_guest': True
        }

def require_auth(view_func):
    """
    Decorador para requerir autenticación
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        user_info = get_user_info(request)
        if not user_info['is_authenticated']:
            return JsonResponse({
                'error': 'Autenticación requerida',
                'detail': 'Debe estar autenticado para acceder a este recurso'
            }, status=status.HTTP_401_UNAUTHORIZED)
        return view_func(request, *args, **kwargs)
    return wrapper

def require_role(roles):
    """
    Decorador para requerir roles específicos
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            user_info = get_user_info(request)
            if not user_info['is_authenticated']:
                return JsonResponse({
                    'error': 'Autenticación requerida',
                    'detail': 'Debe estar autenticado para acceder a este recurso'
                }, status=status.HTTP_401_UNAUTHORIZED)
                
            if user_info['role'] not in roles and not getattr(user_info['user'], 'is_superuser', False):
                return JsonResponse({
                    'error': 'Permisos insuficientes',
                    'detail': f'Se requieren roles: {", ".join(roles)}'
                }, status=status.HTTP_403_FORBIDDEN)
                
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator

def require_admin(view_func):
    """
    Decorador para requerir rol de administrador
    """
    return require_role(['admin'])(view_func)

def require_vendedor(view_func):
    """
    Decorador para requerir rol de vendedor o administrador
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        user_info = get_user_info(request)
        if not user_info['is_authenticated']:
            return JsonResponse({
                'error': 'Autenticación requerida',
                'detail': 'Debe estar autenticado para acceder a este recurso'
            }, status=status.HTTP_401_UNAUTHORIZED)
            
        if not (user_info['permissions']['is_vendedor'] or 
                user_info['permissions']['is_admin'] or 
                getattr(user_info['user'], 'is_superuser', False)):
            return JsonResponse({
                'error': 'Permisos insuficientes',
                'detail': 'Se requieren permisos de vendedor o administrador'
            }, status=status.HTTP_403_FORBIDDEN)
            
        return view_func(request, *args, **kwargs)
    return wrapper

def allow_guest(view_func):
    """
    Decorador para permitir acceso a usuarios anónimos (guest checkout)
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        # Si no hay usuario, crear uno anónimo
        if not hasattr(request, 'user') or not request.user:
            request.user = None
            request.user_role = 'guest'
            request.user_permissions = {
                'is_admin': False,
                'is_vendedor': False,
                'is_cliente': False,
                'is_guest': True,
            }
        return view_func(request, *args, **kwargs)
    return wrapper

def require_auth_or_guest(view_func):
    """
    Decorador para requerir autenticación o permitir guest
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        # Si no hay usuario, crear uno anónimo
        if not hasattr(request, 'user') or not request.user:
            request.user = None
            request.user_role = 'guest'
            request.user_permissions = {
                'is_admin': False,
                'is_vendedor': False,
                'is_cliente': False,
                'is_guest': True,
            }
        return view_func(request, *args, **kwargs)
    return wrapper

def public_access(view_func):
    """
    Decorador para acceso completamente público
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        # No requiere ninguna validación
        return view_func(request, *args, **kwargs)
    return wrapper

def get_guest_session_id(request):
    """
    Obtiene el ID de sesión para usuarios guest
    """
    return getattr(request, 'guest_session_id', None)

def is_guest_user(request):
    """
    Verifica si el usuario actual es un guest
    """
    user_info = get_user_info(request)
    return user_info['is_guest']

def is_authenticated_user(request):
    """
    Verifica si el usuario actual está autenticado
    """
    user_info = get_user_info(request)
    return user_info['is_authenticated']

def has_permission(request, permission):
    """
    Verifica si el usuario tiene un permiso específico
    """
    user_info = get_user_info(request)
    return user_info['permissions'].get(permission, False)

def create_api_response(data=None, message=None, status_code=200, error=None):
    """
    Crea una respuesta de API estandarizada
    """
    response_data = {}
    
    if data is not None:
        response_data['data'] = data
        
    if message:
        response_data['message'] = message
        
    if error:
        response_data['error'] = error
        
    return Response(response_data, status=status_code)

def handle_api_error(error_message, status_code=400):
    """
    Maneja errores de API de forma estandarizada
    """
    return create_api_response(
        error=error_message,
        status_code=status_code
    ) 