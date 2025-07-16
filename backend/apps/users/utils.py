"""
Utilidades para el sistema de autenticación y autorización
"""

import logging
from django.http import JsonResponse
from rest_framework import status
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth import get_user_model
from .constants import GUEST_PERMISSIONS, ERROR_MESSAGES

logger = logging.getLogger(__name__)
User = get_user_model()

def is_api_path(path):
    """
    Verifica si la ruta es una ruta de API
    """
    return path.startswith('/api/') or path.startswith('/apps/')

def is_public_path(path, public_paths):
    """
    Verifica si la ruta es pública
    """
    return any(path.startswith(public_path) for public_path in public_paths)

def is_guest_allowed_path(path, guest_paths):
    """
    Verifica si la ruta permite guest checkout
    """
    return any(path.startswith(guest_path) for guest_path in guest_paths)

def set_guest_user(request):
    """
    Configura un usuario guest en el request
    """
    request.user = None
    request.user_role = 'guest'
    request.user_permissions = GUEST_PERMISSIONS.copy()

def set_authenticated_user(request, user):
    """
    Configura un usuario autenticado en el request
    """
    request.user = user
    request.user_role = user.role
    request.user_permissions = {
        'is_admin': user.is_admin,
        'is_vendedor': user.is_vendedor,
        'is_cliente': user.is_cliente,
        'is_guest': False,
    }

def validate_jwt_token(token):
    """
    Valida un token JWT y retorna el usuario
    """
    try:
        access_token = AccessToken(token)
        user_id = access_token['user_id']
        user = User.objects.get(id=user_id, is_active=True)
        return user, None
    except (InvalidToken, TokenError) as e:
        logger.warning(f"Token inválido: {str(e)}")
        return None, 'invalid_token'
    except User.DoesNotExist:
        logger.warning("Usuario no encontrado para token")
        return None, 'user_not_found'
    except Exception as e:
        logger.error(f"Error en autenticación: {str(e)}")
        return None, 'authentication_error'

def create_error_response(error_key, status_code=None):
    """
    Crea una respuesta de error estandarizada
    """
    error_data = ERROR_MESSAGES.get(error_key, ERROR_MESSAGES['authentication_error'])
    return JsonResponse(error_data, status=status_code or status.HTTP_401_UNAUTHORIZED)

def extract_token_from_header(auth_header):
    """
    Extrae el token del header de autorización
    """
    if not auth_header.startswith('Bearer '):
        return None
    return auth_header.split(' ')[1]

def log_user_access(request, user_info, action="accessing"):
    """
    Registra el acceso del usuario
    """
    user_email = user_info.get('email', 'Anonymous')
    user_role = user_info.get('role', 'unknown')
    logger.info(f"Usuario {action}: {user_email} (Rol: {user_role}) - Path: {request.path}")

def get_user_info(request):
    """
    Obtiene información del usuario actual (autenticado o guest)
    """
    if hasattr(request, 'user') and request.user:
        return {
            'user': request.user,
            'email': request.user.email,
            'role': getattr(request, 'user_role', 'unknown'),
            'permissions': getattr(request, 'user_permissions', {}),
            'is_authenticated': True,
            'is_guest': False
        }
    else:
        return {
            'user': None,
            'email': 'Anonymous',
            'role': 'guest',
            'permissions': GUEST_PERMISSIONS.copy(),
            'is_authenticated': False,
            'is_guest': True
        } 