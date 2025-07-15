from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Permite acceso solo a usuarios administradores.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and 
                   (request.user.is_admin or request.user.is_superuser))

class IsVendedorUser(permissions.BasePermission):
    """
    Permite acceso solo a usuarios vendedores o administradores.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and 
                   (request.user.is_vendedor or request.user.is_admin or request.user.is_superuser))

class IsAdminOrSelf(permissions.BasePermission):
    """
    Permite acceso a administradores o al propio usuario.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        return bool(request.user.is_admin or request.user.is_superuser or obj == request.user)

class IsAdminOrVendedorOrSelf(permissions.BasePermission):
    """
    Permite acceso a administradores, vendedores o al propio usuario.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        return bool(
            request.user.is_admin or 
            request.user.is_superuser or 
            request.user.is_vendedor or 
            obj == request.user
        )

class IsAuthenticatedUser(permissions.BasePermission):
    """
    Permite acceso solo a usuarios autenticados.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

class IsAdminOrVendedorForList(permissions.BasePermission):
    """
    Permite a administradores y vendedores listar usuarios, pero solo admins pueden crear.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Para listar usuarios
        if request.method == 'GET' and view.action == 'list':
            return bool(request.user.is_admin or request.user.is_superuser or request.user.is_vendedor)
        
        # Para crear usuarios (solo admins)
        if request.method == 'POST':
            return bool(request.user.is_admin or request.user.is_superuser)
        
        return True

    def has_object_permission(self, request, view, obj):
        # Solo admins pueden editar usuarios
        if request.method in ['PUT', 'PATCH']:
            return bool(request.user.is_admin or request.user.is_superuser)
        
        # Vendedores y admins pueden ver detalles
        if request.method == 'GET':
            return bool(request.user.is_admin or request.user.is_superuser or request.user.is_vendedor)
        
        return False 