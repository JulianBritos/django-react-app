# Sistema de Roles y Permisos

## Descripción

Este sistema implementa un control de acceso basado en roles (RBAC) con tres niveles de usuario:

- **Administrador (admin)**: Acceso completo al sistema
- **Vendedor (vendedor)**: Acceso limitado a funciones de ventas
- **Cliente (cliente)**: Acceso básico a funciones de compra

## Roles Disponibles

### 1. Administrador (admin)

- **Permisos**: Acceso completo a todas las funcionalidades
- **Características**:
  - Gestión de usuarios
  - Gestión de productos
  - Gestión de categorías
  - Reportes y estadísticas
  - Configuración del sistema
  - Acceso al panel de administración de Django

### 2. Vendedor (vendedor)

- **Permisos**: Acceso a funciones de ventas y gestión de productos
- **Características**:
  - Gestión de productos
  - Gestión de inventario
  - Ver pedidos
  - Gestión de clientes
  - Reportes de ventas

### 3. Cliente (cliente)

- **Permisos**: Acceso básico para compras
- **Características**:
  - Ver productos
  - Realizar compras
  - Gestionar perfil
  - Ver historial de pedidos

## Implementación Técnica

### Modelo de Usuario

```python
class CustomUserModel(AbstractUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('admin', 'Administrador'),
        ('cliente', 'Cliente'),
        ('vendedor', 'Vendedor'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='cliente')

    @property
    def is_admin(self):
        return self.role == 'admin' or self.is_superuser

    @property
    def is_vendedor(self):
        return self.role == 'vendedor'

    @property
    def is_cliente(self):
        return self.role == 'cliente'
```

### Permisos Personalizados

- `IsAdminUser`: Solo administradores
- `IsVendedorUser`: Vendedores y administradores
- `IsAdminOrSelf`: Administradores o el propio usuario
- `IsAdminOrVendedorOrSelf`: Administradores, vendedores o el propio usuario
- `IsAuthenticatedUser`: Cualquier usuario autenticado

### APIs Disponibles

#### Gestión de Usuarios

- `GET /api/users/` - Listar usuarios (solo admin)
- `GET /api/users/{id}/` - Obtener usuario específico
- `PATCH /api/users/{id}/` - Actualizar usuario
- `PATCH /api/users/{id}/update_role/` - Actualizar rol
- `GET /api/users/me/` - Obtener usuario actual
- `GET /api/users/roles/` - Obtener roles disponibles

## Uso

### Crear Usuarios con Roles

```bash
# Crear administrador
python manage.py create_roles --admin --email admin@ejemplo.com --password admin123 --first-name Admin

# Crear vendedor
python manage.py create_roles --vendedor --email vendedor@ejemplo.com --password vendedor123 --first-name Vendedor

# Crear cliente
python manage.py create_roles --cliente --email cliente@ejemplo.com --password cliente123 --first-name Cliente
```

### Proteger Vistas

```python
from apps.users.permissions import IsAdminUser, IsVendedorUser

class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]  # Solo admins
```

### Verificar Roles en el Frontend

```javascript
// Obtener usuario actual
const user = await getCurrentUser();
console.log(user.role); // 'admin', 'vendedor', o 'cliente'

// Proteger rutas
<ProtectedRoute requiredRole="admin">
  <AdminPanel />
</ProtectedRoute>;
```

## Migración de Datos

Si tienes usuarios existentes sin rol asignado, puedes actualizarlos:

```python
# En Django shell
from django.contrib.auth import get_user_model
User = get_user_model()

# Asignar rol cliente a usuarios sin rol
User.objects.filter(role__isnull=True).update(role='cliente')

# Asignar rol admin a superusuarios
User.objects.filter(is_superuser=True).update(role='admin')
```

## Seguridad

- Los superusuarios de Django mantienen acceso completo
- Los roles se verifican en cada solicitud
- Las contraseñas se hashean automáticamente
- Los tokens JWT incluyen información del rol

## Próximos Pasos

1. Implementar permisos granulares por funcionalidad
2. Agregar auditoría de cambios de roles
3. Implementar notificaciones de cambios de permisos
4. Crear dashboard específico por rol
