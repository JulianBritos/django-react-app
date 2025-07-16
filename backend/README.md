# 🚀 Backend - Django E-commerce API

## 📋 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Configuración Inicial](#configuración-inicial)
- [Autenticación y Autorización](#autenticación-y-autorización)
- [Sistema de Roles](#sistema-de-roles)
- [Middleware de Autenticación](#middleware-de-autenticación)
- [Plantillas de Email](#plantillas-de-email)
- [APIs Disponibles](#apis-disponibles)
- [Base de Datos](#base-de-datos)
- [Despliegue](#despliegue)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## 🎯 Descripción General

Este backend implementa una API REST completa para un sistema de e-commerce con las siguientes características:

- ✅ **Autenticación JWT** con refresh tokens
- ✅ **Sistema de roles** (Admin, Vendedor, Cliente)
- ✅ **Guest checkout** para compras sin registro
- ✅ **Gestión de productos** con variantes y atributos
- ✅ **Sistema de pagos** integrado con MercadoPago
- ✅ **Plantillas de email** personalizadas
- ✅ **Middleware de seguridad** robusto
- ✅ **Logging completo** para auditoría

## 🏗️ Arquitectura del Sistema

### Estructura de Directorios

```
backend/
├── apps/
│   ├── users/           # Gestión de usuarios y autenticación
│   ├── products/        # Gestión de productos y categorías
│   ├── orders/          # Gestión de pedidos
│   ├── payments/        # Integración de pagos
│   └── importer/        # Importación masiva de datos
├── projectsSettings/    # Configuración del proyecto
├── templates/           # Plantillas de email
├── logs/               # Archivos de log
└── docker/             # Configuración Docker
```

### Tecnologías Utilizadas

- **Django 5.1+** - Framework web
- **Django REST Framework** - API REST
- **Django Allauth** - Autenticación avanzada
- **Simple JWT** - Tokens JWT
- **PostgreSQL** - Base de datos
- **MercadoPago** - Procesamiento de pagos
- **Docker** - Containerización

## ⚙️ Configuración Inicial

### 1. Instalación de Dependencias

```bash
# Activar entorno virtual
source venv/bin/activate.fish

# Instalar dependencias
pip install -r requirements.txt
```

### 2. Configuración de Variables de Entorno

Crear archivo `.env` en `backend/projectsSettings/`:

```env
# Django
DJANGO_TOKEN=tu-secret-key-aqui
DEBUG=True

# Base de Datos
DB_ENGINE=django.db.backends.postgresql
DB_NAME=ecommerce
DB_USER=admin
DB_PASSWORD=tu-password
DB_HOST=localhost
DB_PORT=5432

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_USE_TLS=True
EMAIL_PORT=587
EMAIL_HOST_USER=tu-email@gmail.com
EMAIL_HOST_PASSWORD=tu-app-password
DEFAULT_FROM_EMAIL=tu-email@gmail.com

# MercadoPago
MERCADO_PAGO_ACCESS_TOKEN=tu-token-mercadopago

# CORS
CORS_ALLOW_ALL_ORIGINS=False
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# JWT
ACCESS_TOKEN_LIFETIME_MINUTES=30
REFRESH_TOKEN_LIFETIME_MINUTES=120
```

### 3. Configuración de Base de Datos

```sql
-- Crear base de datos
CREATE DATABASE ecommerce;

-- Crear usuario
CREATE USER admin WITH PASSWORD 'tu-password';

-- Asignar privilegios
GRANT ALL PRIVILEGES ON DATABASE ecommerce TO admin;
GRANT USAGE ON SCHEMA public TO admin;
GRANT CREATE ON SCHEMA public TO admin;
```

### 4. Migraciones y Setup

```bash
# Aplicar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Crear roles de prueba
python manage.py create_roles --admin --email admin@ejemplo.com --password admin123
python manage.py create_roles --vendedor --email vendedor@ejemplo.com --password vendedor123
python manage.py create_roles --cliente --email cliente@ejemplo.com --password cliente123

# Crear directorio de logs
mkdir logs
```

## 🔐 Autenticación y Autorización

### Sistema JWT

El sistema utiliza JWT (JSON Web Tokens) para autenticación:

- **Access Token**: 30 minutos de duración
- **Refresh Token**: 120 minutos de duración
- **Rotación automática** de tokens
- **Blacklist** de tokens expirados

### Endpoints de Autenticación

```bash
# Registro
POST /dj_rest_auth/registration/

# Login
POST /dj_rest_auth/login/

# Logout
POST /dj_rest_auth/logout/

# Refresh Token
POST /dj_rest_auth/token/refresh/

# Reset Password
POST /dj_rest_auth/password/reset/

# Confirm Email
POST /dj_rest_auth/registration/verify-email/
```

## 👥 Sistema de Roles

### Roles Disponibles

| Rol          | Permisos | Descripción                   |
| ------------ | -------- | ----------------------------- |
| **Admin**    | Completo | Acceso total al sistema       |
| **Vendedor** | Limitado | Gestión de productos y ventas |
| **Cliente**  | Básico   | Compras y perfil personal     |

### Propiedades del Usuario

```python
# Verificar roles
user.is_admin      # True si es admin o superuser
user.is_vendedor   # True si es vendedor
user.is_cliente    # True si es cliente
```

### Permisos Personalizados

- `IsAdminUser` - Solo administradores
- `IsVendedorUser` - Vendedores y administradores
- `IsAdminOrSelf` - Administradores o propio usuario
- `IsAuthenticatedUser` - Cualquier usuario autenticado

## 🛡️ Middleware de Autenticación

### Middlewares Implementados

1. **JWTAuthenticationMiddleware** - Validación de tokens JWT
2. **RoleBasedAccessMiddleware** - Control de acceso por roles
3. **APILoggingMiddleware** - Logging de requests/responses
4. **GuestUserMiddleware** - Manejo de usuarios anónimos

### Rutas Públicas

```python
PUBLIC_PATHS = [
    '/api/users/test/',
    '/dj_rest_auth/',
    '/apps/products/products/',      # Ver productos
    '/apps/products/categories/',    # Ver categorías
    '/apps/products/attributes/',    # Ver atributos
]
```

### Rutas de Guest Checkout

```python
GUEST_ALLOWED_PATHS = [
    '/apps/payments/create_preference/',
    '/apps/payments/webhook-mercadopago/',
    '/apps/payments/payment_notification/',
]
```

### Testing del Middleware

```bash
# Probar middleware completo
python manage.py test_middleware

# Probar tipos específicos
python manage.py test_middleware --test-type jwt
python manage.py test_middleware --test-type role
python manage.py test_middleware --test-type guest
```

## 📧 Plantillas de Email

### Tipos de Email Implementados

1. **Confirmación de Registro** - Bienvenida y activación
2. **Reset de Contraseña** - Recuperación de acceso
3. **Cambio de Contraseña** - Notificación de cambio

### Características

- ✅ **Diseño responsivo** para móviles y desktop
- ✅ **Branding personalizable** con colores corporativos
- ✅ **Seguridad** con mensajes de advertencia
- ✅ **Accesibilidad** con alto contraste

### Personalización

```python
# En settings.py
ACCOUNT_EMAIL_SUBJECT_PREFIX = "[Tu Tienda Online] "
ACCOUNT_EMAIL_VERIFICATION = 'mandatory'
ACCOUNT_EMAIL_CONFIRMATION_EXPIRE_DAYS = 3
```

### Testing de Emails

```bash
# Verificar configuración
python test_email_setup.py

# Probar envío real
python manage.py test_email_templates tu-email@ejemplo.com
```

## 🔌 APIs Disponibles

### Gestión de Usuarios

```bash
GET    /api/users/                    # Listar usuarios (admin)
GET    /api/users/{id}/               # Obtener usuario
PATCH  /api/users/{id}/               # Actualizar usuario
PATCH  /api/users/{id}/update_role/   # Cambiar rol (admin)
GET    /api/users/me/                 # Usuario actual
GET    /api/users/roles/              # Roles disponibles
```

### Gestión de Productos

```bash
GET    /apps/products/products/                    # Listar productos
POST   /apps/products/products/                    # Crear producto
GET    /apps/products/products/{id}/               # Obtener producto
PATCH  /apps/products/products/{id}/               # Actualizar producto
DELETE /apps/products/products/{id}/               # Eliminar producto

GET    /apps/products/categories/                  # Listar categorías
GET    /apps/products/attributes/                  # Listar atributos
GET    /apps/products/attributeoptions/            # Listar opciones
```

### Gestión de Pedidos

```bash
GET    /apps/orders/                   # Listar pedidos
POST   /apps/orders/                   # Crear pedido
GET    /apps/orders/{id}/              # Obtener pedido
PATCH  /apps/orders/{id}/              # Actualizar pedido
```

### Pagos

```bash
POST   /apps/payments/create_preference/           # Crear preferencia
POST   /apps/payments/webhook-mercadopago/         # Webhook MercadoPago
POST   /apps/payments/payment_notification/        # Notificación de pago
```

## 🗄️ Base de Datos

### Modelos Principales

#### Usuario Personalizado

```python
class CustomUserModel(AbstractUser):
    email = models.EmailField(unique=True)
    role = models.CharField(choices=ROLE_CHOICES, default='cliente')
    # ... otros campos
```

#### Producto

```python
class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.SET_NULL)
    # ... otros campos
```

#### Variante de Producto

```python
class ProductAttribute(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    sku = models.CharField(max_length=255)
    selling_price = models.FloatField()
    stock = models.PositiveIntegerField(default=0)
    # ... otros campos
```

### Migraciones

```bash
# Crear migración
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Ver estado de migraciones
python manage.py showmigrations
```

## 🚀 Despliegue

### Docker

```bash
# Construir imagen
docker build -f docker/dockerfile -t ecommerce-backend .

# Ejecutar contenedor
docker run -p 8000:8000 ecommerce-backend
```

### Docker Compose

```bash
# Levantar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f backend

# Detener servicios
docker-compose down
```

### Variables de Producción

```env
DEBUG=False
ALLOWED_HOSTS=tu-dominio.com,www.tu-dominio.com
CORS_ALLOWED_ORIGINS=https://tu-dominio.com
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

## 🧪 Testing

### Tests Unitarios

```bash
# Ejecutar todos los tests
python manage.py test

# Tests específicos
python manage.py test apps.users
python manage.py test apps.products
python manage.py test apps.users.test_middleware
```

### Tests de Middleware

```bash
# Probar middleware completo
python manage.py test_middleware --test-type all

# Probar autenticación JWT
python manage.py test_middleware --test-type jwt

# Probar control de roles
python manage.py test_middleware --test-type role

# Probar guest checkout
python manage.py test_middleware --test-type guest
```

### Tests de Email

```bash
# Verificar configuración
python test_email_setup.py

# Probar envío
python manage.py test_email_templates email@ejemplo.com
```

## 🔧 Troubleshooting

### Problemas Comunes

#### 1. Error de Conexión a Base de Datos

```bash
# Verificar configuración
python manage.py check

# Verificar conexión
python manage.py dbshell
```

#### 2. Tokens JWT Expirados

```bash
# Verificar configuración JWT
python manage.py shell
>>> from rest_framework_simplejwt.tokens import AccessToken
>>> token = AccessToken()
>>> print(token.lifetime)
```

#### 3. Emails No Se Envían

```bash
# Verificar configuración SMTP
python test_email_setup.py

# Verificar logs
tail -f logs/api.log
```

#### 4. Middleware No Funciona

```bash
# Verificar orden de middlewares
python manage.py check

# Probar middleware
python manage.py test_middleware
```

### Logs

Los logs se guardan en `backend/logs/api.log`:

```bash
# Ver logs en tiempo real
tail -f logs/api.log

# Buscar errores
grep "ERROR" logs/api.log

# Buscar por usuario
grep "admin@ejemplo.com" logs/api.log
```

### Comandos Útiles

```bash
# Verificar configuración
python manage.py check

# Shell de Django
python manage.py shell

# Crear superusuario
python manage.py createsuperuser

# Recolectar archivos estáticos
python manage.py collectstatic

# Limpiar cache
python manage.py clearcache
```

## 📚 Recursos Adicionales

### Documentación Específica

- [README del Middleware](apps/users/README_MIDDLEWARE.md) - Documentación detallada del middleware
- [README de Roles](apps/users/README_ROLES.md) - Sistema de roles y permisos
- [README de Email Templates](EMAIL_TEMPLATES_SUMMARY.md) - Plantillas de email
- [README de Configuración](projectsSettings/README_IMPORTANTE.md) - Configuración importante

### Enlaces Útiles

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Simple JWT](https://django-rest-framework-simplejwt.readthedocs.io/)
- [Django Allauth](https://django-allauth.readthedocs.io/)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**¡El backend está listo para producción!** 🎉

Para soporte técnico, contacta al equipo de desarrollo.
