#!/usr/bin/env python
"""
Script simple para probar el sistema de roles
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'projectsSettings.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def test_roles():
    print("=== PRUEBA DEL SISTEMA DE ROLES ===")
    
    # Verificar usuarios existentes
    users = User.objects.all()
    print(f"Usuarios existentes: {users.count()}")
    
    for user in users:
        print(f"- {user.email}: rol={getattr(user, 'role', 'N/A')}, is_superuser={user.is_superuser}")
    
    # Crear usuario admin de prueba
    admin_email = "admin@test.com"
    if not User.objects.filter(email=admin_email).exists():
        try:
            admin_user = User.objects.create_user(
                email=admin_email,
                password="admin123",
                first_name="Admin",
                last_name="Test",
                role="admin",
                is_staff=True,
                is_active=True
            )
            print(f"✅ Usuario admin creado: {admin_user.email} (rol: {admin_user.role})")
        except Exception as e:
            print(f"❌ Error creando admin: {str(e)}")
    else:
        admin_user = User.objects.get(email=admin_email)
        print(f"ℹ️ Usuario admin ya existe: {admin_user.email} (rol: {admin_user.role})")
    
    # Crear usuario cliente de prueba (sin especificar role)
    cliente_email = "cliente@test.com"
    if not User.objects.filter(email=cliente_email).exists():
        try:
            cliente_user = User.objects.create_user(
                email=cliente_email,
                password="cliente123",
                first_name="Cliente",
                last_name="Test"
                # No especificar role, debería usar el default
            )
            print(f"✅ Usuario cliente creado: {cliente_user.email} (rol: {cliente_user.role})")
        except Exception as e:
            print(f"❌ Error creando cliente: {str(e)}")
    else:
        cliente_user = User.objects.get(email=cliente_email)
        print(f"ℹ️ Usuario cliente ya existe: {cliente_user.email} (rol: {cliente_user.role})")
    
    # Verificar propiedades
    print("\n=== VERIFICACIÓN DE PROPIEDADES ===")
    for user in User.objects.all():
        print(f"Usuario: {user.email}")
        print(f"  - Rol: {user.role}")
        print(f"  - is_admin: {user.is_admin}")
        print(f"  - is_vendedor: {user.is_vendedor}")
        print(f"  - is_cliente: {user.is_cliente}")
        print(f"  - is_superuser: {user.is_superuser}")
        print("")
    
    print("✅ Prueba completada")

if __name__ == "__main__":
    test_roles() 