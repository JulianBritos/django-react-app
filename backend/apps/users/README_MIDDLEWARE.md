# Middleware de Autenticación para APIs - E-commerce

## Descripción General

Este sistema implementa un middleware de autenticación robusto para APIs de e-commerce que permite **guest checkout** (compras sin registro) mientras protege las rutas administrativas. El middleware está diseñado específicamente para proyectos de e-commerce donde los clientes pueden realizar compras sin necesidad de estar registrados.

## Características Principales

### ✅ **Funcionalidades Implementadas**

1. **Autenticación JWT Automática**

   - Validación automática de tokens en todas las APIs
   - Manejo de tokens expirados e inválidos
   - Soporte para refresh tokens

2. **Control de Acceso Basado en Roles**

   - Administrador: Acceso completo
   - Vendedor: Gestión de productos y pedidos
   - Cliente: Acceso básico
   - Guest: Compras sin registro

3. **Guest Checkout**

   - Permite compras sin autenticación
   - Crea sesiones únicas para usuarios anónimos
   - Mantiene carrito de compras para guests

4. **Rutas Públicas**

   - Productos y categorías accesibles sin autenticación
   - APIs de información pública

5. **Logging y Auditoría**
   - Registro de todas las requests/responses
   - Información de usuarios y roles
   - Logs de errores de autenticación

## Arquitectura del Sistema

### 📁 **Estructura de Archivos**

```
backend/
├── apps/
│   └── users/
│       ├── middleware.py              # Middlewares principales
│       ├── decorators.py              # Decoradores de acceso
│       ├── api_utils.py               # Utilidades de API
│       ├── permissions.py             # Permisos personalizados
│       ├── test_middleware.py         # Tests del middleware
│       └── management/
│           └── commands/
│               └── test_middleware.py # Comando de testing
├── projectsSettings/
│   └── settings.py                    # Configuración de middlewares
└── logs/                              # Directorio de logs
    └── api.log                        # Logs de APIs

frontend/
└── app/
    └── src/
        └── api/
            └── api.js                 # Utilidades de API frontend
```

## Middlewares Implementados

### 1. **JWTAuthenticationMiddleware**

**Archivo:** `backend/apps/users/middleware.py`

**Función:** Valida tokens JWT y autentica usuarios

**Características:**

- Valida tokens automáticamente en rutas protegidas
- Permite acceso anónimo en rutas públicas
- Maneja guest checkout sin requerir autenticación
- Agrega información de usuario al request

**Rutas Públicas:**

```python
public_paths = [
    '/api/users/test/',
    '/dj_rest_auth/',
    '/dj_rest_auth/registration/',
    '/reset/password/',
    '/apps/products/products/',      # Ver productos
    '/apps/products/categories/',    # Ver categorías
    '/apps/products/attributes/',    # Ver atributos
    '/apps/products/attributeoptions/', # Ver opciones
]
```

**Rutas de Guest Checkout:**

```python
guest_allowed_paths = [
    '/apps/payments/create_preference/',  # Crear pago
    '/apps/payments/webhook-mercadopago/', # Webhook
    '/apps/payments/payment_notification/', # Notificaciones
]
```

### 2. **RoleBasedAccessMiddleware**

**Archivo:** `backend/apps/users/middleware.py`

**Función:** Controla acceso basado en roles

**Permisos por Rol:**

| Ruta                                   | Admin | Vendedor | Cliente | Guest |
| -------------------------------------- | ----- | -------- | ------- | ----- |
| `/api/users/`                          | ✅    | ❌       | ❌      | ❌    |
| `/apps/products/productattributes/`    | ✅    | ❌       | ❌      | ❌    |
| `/apps/products/attributes/` (gestión) | ✅    | ✅       | ❌      | ❌    |
| `/apps/orders/`                        | ✅    | ✅       | ❌      | ❌    |
| `/apps/products/products/` (ver)       | ✅    | ✅       | ✅      | ✅    |
| `/apps/payments/create_preference/`    | ✅    | ✅       | ✅      | ✅    |

### 3. **APILoggingMiddleware**

**Archivo:** `backend/apps/users/middleware.py`

**Función:** Registra requests y responses de APIs

**Información Registrada:**

- Método HTTP y ruta
- Usuario y rol
- Código de estado de respuesta
- Timestamp

**Ejemplo de Log:**

```
INFO 2025-01-15 10:30:45 apps.users.middleware API Request: GET /api/users/ - User: admin@example.com (Role: admin)
INFO 2025-01-15 10:30:45 apps.users.middleware API Response: GET /api/users/ - Status: 200 - User: admin@example.com (Role: admin)
```

### 4. **GuestUserMiddleware**

**Archivo:** `backend/apps/users/middleware.py`

**Función:** Maneja usuarios anónimos en e-commerce

**Características:**

- Crea sesiones únicas para guest users
- Persiste carrito de compras
- Identifica usuarios anónimos

## Decoradores de Acceso

### 📁 **Archivo:** `backend/apps/users/decorators.py`

### Decoradores Disponibles:

#### `@require_auth`

```python
@require_auth
def my_view(request):
    # Solo usuarios autenticados
    pass
```

#### `@require_role(['admin', 'vendedor'])`

```python
@require_role(['admin', 'vendedor'])
def admin_view(request):
    # Solo admins y vendedores
    pass
```

#### `@require_admin`

```python
@require_admin
def admin_only_view(request):
    # Solo administradores
    pass
```

#### `@require_vendedor`

```python
@require_vendedor
def vendedor_view(request):
    # Solo vendedores y admins
    pass
```

#### `@allow_guest`

```python
@allow_guest
def guest_checkout_view(request):
    # Permite usuarios anónimos
    pass
```

#### `@public_access`

```python
@public_access
def public_view(request):
    # Acceso completamente público
    pass
```

## Utilidades de API

### 📁 **Archivo:** `backend/apps/users/api_utils.py`

### Funciones Principales:

#### `get_user_info(request)`

```python
user_info = get_user_info(request)
# Retorna: {
#     'user': user_object,
#     'role': 'admin',
#     'permissions': {...},
#     'is_authenticated': True,
#     'is_guest': False
# }
```

#### `is_guest_user(request)`

```python
if is_guest_user(request):
    # Manejar usuario anónimo
    pass
```

#### `has_permission(request, 'is_admin')`

```python
if has_permission(request, 'is_admin'):
    # Usuario tiene permisos de admin
    pass
```

#### `create_api_response()`

```python
return create_api_response(
    data=my_data,
    message="Operación exitosa",
    status_code=200
)
```

## Configuración

### 📁 **Archivo:** `backend/projectsSettings/settings.py`

### Middlewares Registrados:

```python
MIDDLEWARE = [
    # ... middlewares de Django ...
    'apps.users.middleware.JWTAuthenticationMiddleware',
    'apps.users.middleware.RoleBasedAccessMiddleware',
    'apps.users.middleware.APILoggingMiddleware',
    'apps.users.middleware.GuestUserMiddleware',
]
```

### Configuración JWT:

```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(minutes=120),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    # ... más configuración
}
```

### Configuración de Logging:

```python
LOGGING = {
    'version': 1,
    'handlers': {
        'console': {'class': 'logging.StreamHandler'},
        'file': {
            'class': 'logging.FileHandler',
            'filename': 'logs/api.log',
        },
    },
    'loggers': {
        'apps.users.middleware': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
        },
    },
}
```

## Frontend Integration

### 📁 **Archivo:** `frontend/app/src/api/api.js`

### APIs Disponibles:

#### APIs Autenticadas:

```javascript
import { api } from "./api.js";

// Requiere autenticación
const users = await api.get("/api/users/");
const user = await api.post("/api/users/", userData);
```

#### APIs para Guest Checkout:

```javascript
import { api } from "./api.js";

// Permite guest users
const payment = await api.guest.post(
  "/apps/payments/create_preference/",
  paymentData
);
```

#### APIs Públicas:

```javascript
import { api } from "./api.js";

// Sin autenticación
const products = await api.public.get("/apps/products/products/");
const categories = await api.public.get("/apps/products/categories/");
```

### Utilidades Específicas:

#### Guest Checkout:

```javascript
import { guestCheckout } from "./api.js";

const products = await guestCheckout.getProducts();
const payment = await guestCheckout.createPaymentPreference(paymentData);
```

#### Gestión de Usuarios:

```javascript
import { authenticatedApi } from "./api.js";

const users = await authenticatedApi.getUsers();
const currentUser = await authenticatedApi.getCurrentUser();
```

#### Gestión de Productos:

```javascript
import { productManagement } from "./api.js";

const product = await productManagement.createProduct(productData);
const updated = await productManagement.updateProduct(id, data);
```

## Testing

### 📁 **Archivo:** `backend/apps/users/test_middleware.py`

### Tests Disponibles:

#### Tests de JWT:

- Token válido
- Token inválido
- Token faltante
- Rutas públicas
- Guest checkout

#### Tests de Roles:

- Acceso de admin
- Acceso denegado para vendedor
- Acceso denegado para cliente
- Rutas públicas

#### Tests de Guest:

- Creación de sesión
- Persistencia de sesión
- Rutas no-ecommerce

### Comando de Testing:

```bash
# Activar entorno virtual
source venv/bin/activate.fish

# Ir al directorio backend
cd backend

# Ejecutar tests
python manage.py test apps.users.test_middleware

# Ejecutar comando de testing
python manage.py test_middleware

# Tests específicos
python manage.py test_middleware --test-type jwt
python manage.py test_middleware --test-type role
python manage.py test_middleware --test-type guest
python manage.py test_middleware --test-type integration
```

## Casos de Uso

### 1. **Cliente Anónimo (Guest)**

**Flujo:**

1. Usuario visita la tienda sin registrarse
2. Navega por productos (ruta pública)
3. Agrega productos al carrito
4. Procede al checkout como guest
5. Completa la compra sin registro

**Rutas Utilizadas:**

- `GET /apps/products/products/` (público)
- `GET /apps/products/categories/` (público)
- `POST /apps/payments/create_preference/` (guest)

### 2. **Cliente Registrado**

**Flujo:**

1. Usuario se registra/inicia sesión
2. Navega por productos
3. Gestiona su perfil
4. Realiza compras autenticadas

**Rutas Utilizadas:**

- `GET /api/users/me/` (autenticado)
- `PATCH /api/users/{id}/` (autenticado)
- `POST /apps/payments/create_preference/` (autenticado)

### 3. **Vendedor**

**Flujo:**

1. Vendedor inicia sesión
2. Gestiona productos
3. Ve pedidos
4. Actualiza inventario

**Rutas Utilizadas:**

- `GET /apps/products/products/` (gestión)
- `POST /apps/products/products/` (crear)
- `GET /apps/orders/` (ver pedidos)

### 4. **Administrador**

**Flujo:**

1. Admin inicia sesión
2. Gestiona usuarios
3. Configura sistema
4. Ve reportes

**Rutas Utilizadas:**

- `GET /api/users/` (gestión usuarios)
- `PATCH /api/users/{id}/update_role/` (cambiar roles)
- `GET /admin/` (panel admin)

## Seguridad

### ✅ **Medidas Implementadas:**

1. **Validación de Tokens**

   - Verificación de firma JWT
   - Validación de expiración
   - Verificación de usuario activo

2. **Control de Acceso**

   - Roles granulares
   - Permisos por ruta
   - Verificación de superusuarios

3. **Protección CSRF**

   - Middleware CSRF de Django
   - Tokens en formularios

4. **Logging de Seguridad**

   - Registro de intentos de acceso
   - Logs de errores de autenticación
   - Auditoría de cambios

5. **Manejo de Errores**
   - Respuestas estandarizadas
   - No exposición de información sensible
   - Rate limiting implícito

### 🔒 **Buenas Prácticas:**

1. **Tokens JWT**

   - Vida útil limitada (30 min)
   - Refresh tokens automáticos
   - Blacklist de tokens

2. **Roles y Permisos**

   - Principio de menor privilegio
   - Verificación en cada request
   - Roles específicos por funcionalidad

3. **Guest Checkout**
   - Sesiones únicas
   - Validación de datos
   - Límites de compra

## Monitoreo y Logs

### 📊 **Información Registrada:**

#### Requests:

- Método HTTP
- Ruta completa
- Usuario y rol
- Timestamp
- IP del cliente

#### Responses:

- Código de estado
- Tiempo de respuesta
- Errores de autenticación
- Errores de permisos

#### Errores:

- Tokens inválidos
- Accesos denegados
- Usuarios no encontrados
- Errores de sistema

### 📁 **Archivo de Logs:** `backend/logs/api.log`

### Ejemplo de Logs:

```
INFO 2025-01-15 10:30:45 apps.users.middleware API Request: GET /api/users/ - User: admin@example.com (Role: admin)
INFO 2025-01-15 10:30:45 apps.users.middleware API Response: GET /api/users/ - Status: 200 - User: admin@example.com (Role: admin)
WARNING 2025-01-15 10:31:00 apps.users.middleware Token inválido en guest checkout, permitiendo acceso anónimo: /apps/payments/create_preference/
INFO 2025-01-15 10:31:00 apps.users.middleware Usuario anónimo accediendo a: /apps/payments/create_preference/
```

## Troubleshooting

### ❌ **Problemas Comunes:**

#### 1. Token Expirado

**Síntoma:** Error 401 en requests autenticados
**Solución:** Implementar refresh token automático

#### 2. Acceso Denegado

**Síntoma:** Error 403 en rutas protegidas
**Solución:** Verificar rol del usuario y permisos

#### 3. Guest Checkout No Funciona

**Síntoma:** Error 401 en rutas de guest
**Solución:** Verificar configuración de rutas públicas

#### 4. Logs No Se Generan

**Síntoma:** No hay archivos de log
**Solución:** Verificar permisos del directorio logs/

### 🔧 **Comandos de Debug:**

```bash
# Verificar configuración
python manage.py check

# Probar middleware
python manage.py test_middleware

# Ver logs en tiempo real
tail -f backend/logs/api.log

# Verificar usuarios y roles
python manage.py shell
>>> from django.contrib.auth import get_user_model
>>> User = get_user_model()
>>> User.objects.all().values('email', 'role')
```

## Próximos Pasos

### 🚀 **Mejoras Futuras:**

1. **Rate Limiting**

   - Implementar límites por IP
   - Límites por usuario
   - Protección contra DDoS

2. **Auditoría Avanzada**

   - Logs de cambios de datos
   - Historial de accesos
   - Alertas de seguridad

3. **Autenticación Multi-Factor**

   - 2FA para admins
   - Verificación por email
   - Biometría

4. **API Versioning**

   - Versionado de APIs
   - Compatibilidad hacia atrás
   - Documentación automática

5. **Caché de Permisos**
   - Cache de roles
   - Optimización de performance
   - Reducción de queries

## Conclusión

Este middleware de autenticación proporciona una base sólida y segura para APIs de e-commerce, permitiendo tanto la funcionalidad de guest checkout como la protección robusta de rutas administrativas. La implementación es escalable, mantenible y sigue las mejores prácticas de seguridad.

### ✅ **Beneficios Obtenidos:**

- **Seguridad Robusta:** Validación automática de tokens y roles
- **Flexibilidad:** Soporte para guest checkout y usuarios autenticados
- **Mantenibilidad:** Código modular y bien documentado
- **Escalabilidad:** Arquitectura preparada para crecimiento
- **Monitoreo:** Logging completo para debugging y auditoría

El sistema está listo para producción y puede ser extendido según las necesidades específicas del proyecto.
