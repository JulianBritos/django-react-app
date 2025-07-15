from django.shortcuts import render, redirect
from django.http import JsonResponse
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializer import UserSerializer, UserCreateSerializer, UserUpdateSerializer
from .permissions import IsAdminUser, IsAdminOrSelf, IsAuthenticatedUser, IsAdminOrVendedorForList

User = get_user_model()

def email_confirmation(request, key):
    return redirect(f'http://localhost:3000/dj-rest-auth/registration/account-confirm-email/{key}')

def reset_password_confirm(request, uid, token):
    return redirect(f'http://localhost:3000/reset/password/confirm/{uid}/{token}')

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticatedUser]  # Cambiado para ser más flexible

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer

    def get_permissions(self):
        if self.action == 'list':
            return [IsAdminOrVendedorForList()]  # Admins y vendedores pueden listar
        elif self.action == 'create':
            return [IsAdminUser()]  # Solo admins pueden crear
        elif self.action in ['retrieve', 'update', 'partial_update']:
            return [IsAdminOrSelf()]  # Solo admins pueden editar
        return super().get_permissions()



    def list(self, request, *args, **kwargs):
        """Listar usuarios con logging para debug"""
        print(f"Usuario solicitando lista: {request.user.email}, Rol: {getattr(request.user, 'role', 'N/A')}")
        print(f"Es admin: {getattr(request.user, 'is_admin', False)}")
        print(f"Es superuser: {request.user.is_superuser}")
        
        return super().list(request, *args, **kwargs)

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Obtener información del usuario actual"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def update_role(self, request, pk=None):
        """Actualizar solo el rol de un usuario"""
        user = self.get_object()
        new_role = request.data.get('role')
        
        if new_role not in dict(User.ROLE_CHOICES):
            return Response(
                {'error': 'Rol inválido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.role = new_role
        user.save()
        
        serializer = self.get_serializer(user)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def roles(self, request):
        """Obtener lista de roles disponibles"""
        return Response({
            'roles': dict(User.ROLE_CHOICES)
        })

    @action(detail=False, methods=['get'], permission_classes=[])
    def test(self, request):
        """Endpoint de prueba sin autenticación"""
        return Response({
            'message': 'API de usuarios funcionando correctamente',
            'total_users': User.objects.count(),
            'roles_available': dict(User.ROLE_CHOICES)
        })