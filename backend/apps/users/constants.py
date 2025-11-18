"""
Constantes para el sistema de autenticación y autorización
"""

# Rutas completamente públicas (sin autenticación)
PUBLIC_PATHS = [
    '/api/users/test/',
    '/dj_rest_auth/',
    '/dj_rest_auth/registration/',
    '/reset/password/',
    '/apps/products/products/',  # Ver productos (público)
    '/apps/products/categories/',  # Ver categorías (público)
    '/apps/products/attributes/',  # Ver atributos (público)
    '/apps/products/attributeoptions/',  # Ver opciones de atributos (público)
]

# Rutas que requieren autenticación pero permiten usuarios anónimos (guest checkout)
GUEST_ALLOWED_PATHS = [
    '/api/carts/',  # Gestión de carrito (permite guest checkout)
    '/apps/carts/',  # Rutas alternativas de carrito
    '/apps/carts/api/',  # Rutas de carrito con prefijo api
    '/apps/orders/',  # Crear órdenes (permite guest checkout)
    '/apps/payments/create_preference/',  # Crear preferencia de pago (guest checkout)
    '/apps/payments/webhook-mercadopago/',  # Webhook de MercadoPago
    '/apps/payments/payment_notification/',  # Notificaciones de pago
    '/apps/shipping/',  # Información de envío (permite guest checkout)
]

# Rutas que requieren permisos de administrador
ADMIN_ONLY_PATHS = [
    '/api/users/',  # Gestión de usuarios
    '/admin/',
    '/apps/products/productattributes/',  # Gestión de variantes de productos
    '/apps/products/productattributeoptionlinks/',  # Gestión de enlaces de atributos
]

# Rutas que requieren permisos de vendedor o administrador
VENDEDOR_PATHS = [
    '/apps/products/attributes/',  # Gestión de atributos (solo vendedores/admins)
    '/apps/orders/',  # Gestión de pedidos
]

# Permisos por defecto para usuarios guest
GUEST_PERMISSIONS = {
    'is_admin': False,
    'is_vendedor': False,
    'is_cliente': False,
    'is_guest': True,
}

# Mensajes de error estandarizados
ERROR_MESSAGES = {
    'authentication_required': {
        'error': 'Autenticación requerida',
        'detail': 'Debe estar autenticado para acceder a este recurso'
    },
    'token_required': {
        'error': 'Token de autenticación requerido',
        'detail': 'Debe incluir el header Authorization: Bearer <token>'
    },
    'invalid_token': {
        'error': 'Token inválido o expirado',
        'detail': 'El token de autenticación no es válido'
    },
    'user_not_found': {
        'error': 'Usuario no encontrado',
        'detail': 'El usuario asociado al token no existe'
    },
    'access_denied': {
        'error': 'Acceso denegado',
        'detail': 'Debe estar autenticado para acceder a este recurso'
    },
    'admin_required': {
        'error': 'Acceso denegado',
        'detail': 'Se requieren permisos de administrador'
    },
    'vendedor_required': {
        'error': 'Acceso denegado',
        'detail': 'Se requieren permisos de vendedor o administrador'
    },
    'insufficient_permissions': {
        'error': 'Permisos insuficientes',
        'detail': 'No tienes permisos para realizar esta acción'
    },
    'authentication_error': {
        'error': 'Error de autenticación',
        'detail': 'Error interno del servidor'
    }
} 