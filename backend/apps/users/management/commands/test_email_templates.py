from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.contrib.auth import get_user_model
from django.conf import settings

User = get_user_model()

class Command(BaseCommand):
    help = 'Prueba las plantillas de email personalizadas'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='Email para enviar la prueba')

    def handle(self, *args, **options):
        email = options['email']
        
        # Crear un usuario de prueba
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'first_name': 'Usuario',
                'last_name': 'Prueba',
                'username': 'testuser'
            }
        )
        
        # Contexto para las plantillas
        context = {
            'user': user,
            'activate_url': 'https://tutienda.com/confirmar-email/test-key/',
            'password_reset_url': 'https://tutienda.com/reset-password/test-token/',
        }
        
        # Probar email de confirmación
        html_message = render_to_string('account/email/email_confirmation_message.html', context)
        text_message = render_to_string('account/email/email_confirmation_message.txt', context)
        
        send_mail(
            subject='[Prueba] Confirmación de Email',
            message=text_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            html_message=html_message,
        )
        
        self.stdout.write(
            f'Email de prueba enviado a {email}'
        ) 