#!/usr/bin/env python
"""
Script de prueba para verificar la configuración de email personalizada
Ejecutar: python test_email_setup.py
"""

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'projectsSettings.settings')
django.setup()

from django.template.loader import render_to_string
from django.conf import settings

def test_template_loading():
    """Prueba que las plantillas se pueden cargar correctamente"""
    print("🔍 Probando carga de plantillas...")
    
    templates_to_test = [
        'account/email/email_confirmation_message.html',
        'account/email/password_reset_key_message.html',
        'account/email/password_changed_message.html',
        'account/email/email_confirmation_message.txt',
        'account/email/password_reset_key_message.txt',
    ]
    
    for template_name in templates_to_test:
        try:
            # Contexto de prueba
            context = {
                'user': type('User', (), {
                    'first_name': 'Usuario',
                    'last_name': 'Prueba',
                    'email': 'test@example.com'
                })(),
                'activate_url': 'https://tutienda.com/confirmar-email/test-key/',
                'password_reset_url': 'https://tutienda.com/reset-password/test-token/',
            }
            
            # Intentar renderizar la plantilla
            rendered = render_to_string(template_name, context)
            
            if rendered:
                print(f"✅ {template_name} - OK")
            else:
                print(f"⚠️  {template_name} - Vacío")
                
        except Exception as e:
            print(f"❌ {template_name} - Error: {str(e)}")

def test_settings():
    """Prueba que las configuraciones están correctas"""
    print("\n🔍 Probando configuraciones...")
    
    settings_to_check = [
        ('ACCOUNT_EMAIL_SUBJECT_PREFIX', 'Prefijo de asunto'),
        ('ACCOUNT_EMAIL_VERIFICATION', 'Verificación de email'),
        ('ACCOUNT_EMAIL_CONFIRMATION_EXPIRE_DAYS', 'Días de expiración'),
        ('EMAIL_BACKEND', 'Backend de email'),
        ('DEFAULT_FROM_EMAIL', 'Email remitente'),
    ]
    
    for setting_name, description in settings_to_check:
        try:
            value = getattr(settings, setting_name, None)
            if value:
                print(f"✅ {description}: {value}")
            else:
                print(f"⚠️  {description}: No configurado")
        except Exception as e:
            print(f"❌ {description}: Error - {str(e)}")

def test_template_directories():
    """Prueba que los directorios de plantillas existen"""
    print("\n🔍 Probando directorios de plantillas...")
    
    template_dirs = [
        'templates',
        'templates/account',
        'templates/account/email',
    ]
    
    for dir_path in template_dirs:
        full_path = os.path.join(settings.BASE_DIR, dir_path)
        if os.path.exists(full_path):
            print(f"✅ {dir_path} - Existe")
        else:
            print(f"❌ {dir_path} - No existe")

def main():
    """Función principal"""
    print("🚀 Iniciando pruebas de configuración de email...\n")
    
    test_template_directories()
    test_settings()
    test_template_loading()
    
    print("\n✨ Pruebas completadas!")
    print("\n📝 Para probar el envío real de emails, ejecuta:")
    print("   python manage.py test_email_templates tu-email@ejemplo.com")

if __name__ == '__main__':
    main() 