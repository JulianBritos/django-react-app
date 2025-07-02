# Plantillas de Email Personalizadas

Este directorio contiene las plantillas personalizadas para los emails automáticos del sistema.

## Plantillas Disponibles

### 1. Confirmación de Email (`email_confirmation_message.html` y `.txt`)

- **Propósito**: Email enviado cuando un usuario se registra
- **Variables disponibles**:
  - `{{ user }}`: Objeto del usuario
  - `{{ user.first_name }}`: Nombre del usuario
  - `{{ activate_url }}`: URL para confirmar el email

### 2. Reset de Contraseña (`password_reset_key_message.html` y `.txt`)

- **Propósito**: Email enviado cuando se solicita reset de contraseña
- **Variables disponibles**:
  - `{{ password_reset_url }}`: URL para restablecer la contraseña

### 3. Contraseña Cambiada (`password_changed_message.html`)

- **Propósito**: Notificación cuando se cambia la contraseña exitosamente
- **Variables disponibles**:
  - `{{ user }}`: Objeto del usuario
  - `{{ user.first_name }}`: Nombre del usuario

## Personalización

### Colores y Branding

Los colores principales utilizados son:

- **Primario**: `#8b5cf6` (Violeta)
- **Secundario**: `#dc2626` (Rojo para reset de contraseña)
- **Éxito**: `#10b981` (Verde)
- **Advertencia**: `#f59e0b` (Amarillo)
- **Info**: `#3b82f6` (Azul)

### Logo y Nombre

Cambia el logo y nombre en cada plantilla:

```html
<div class="logo">🛍️ Tu Tienda Online</div>
```

### Configuración en settings.py

Las configuraciones relevantes están en `backend/projectsSettings/settings.py`:

```python
ACCOUNT_EMAIL_SUBJECT_PREFIX = "[Tu Tienda Online] "
ACCOUNT_EMAIL_CONFIRMATION_EXPIRE_DAYS = 3
ACCOUNT_PASSWORD_RESET_EXPIRE_DAYS = 1
```

## Pruebas

Para probar las plantillas, usa el comando:

```bash
cd backend
python manage.py test_email_templates tu-email@ejemplo.com
```

## Estructura de Archivos

```
templates/
└── account/
    └── email/
        ├── email_confirmation_message.html
        ├── email_confirmation_message.txt
        ├── password_reset_key_message.html
        ├── password_reset_key_message.txt
        ├── password_changed_message.html
        └── README.md
```

## Notas Importantes

1. **Responsive Design**: Las plantillas están diseñadas para ser responsivas
2. **Compatibilidad**: Incluyen versiones HTML y texto plano
3. **Seguridad**: Incluyen mensajes de seguridad y advertencias
4. **Accesibilidad**: Usan colores con buen contraste y estructura semántica
