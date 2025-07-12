from django.conf import settings

def get_email_subject_prefix():
    """Retorna el prefijo personalizado para los asuntos de email"""
    return getattr(settings, 'ACCOUNT_EMAIL_SUBJECT_PREFIX', 'Cosmo play')

# Configuración de asuntos personalizados
EMAIL_SUBJECTS = {
    'confirmation': f"{get_email_subject_prefix()}Confirma tu cuenta",
    'password_reset': f"{get_email_subject_prefix()}Restablece tu contraseña",
    'password_changed': f"{get_email_subject_prefix()}Tu contraseña ha sido cambiada",
} 