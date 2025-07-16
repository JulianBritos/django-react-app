from functools import wraps
from django.http import JsonResponse
from rest_framework import status

def require_auth(view_func):
    """
    Decorador para requerir autenticación
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not hasattr(request, 'user') or not request.user:
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
            if not hasattr(request, 'user') or not request.user:
                return JsonResponse({
                    'error': 'Autenticación requerida',
                    'detail': 'Debe estar autenticado para acceder a este recurso'
                }, status=status.HTTP_401_UNAUTHORIZED)
                
            user_role = getattr(request, 'user_role', None)
            if user_role not in roles and not getattr(request.user, 'is_superuser', False):
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
        if not hasattr(request, 'user') or not request.user:
            return JsonResponse({
                'error': 'Autenticación requerida',
                'detail': 'Debe estar autenticado para acceder a este recurso'
            }, status=status.HTTP_401_UNAUTHORIZED)
            
        if not (request.user.is_vendedor or request.user.is_admin or getattr(request.user, 'is_superuser', False)):
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