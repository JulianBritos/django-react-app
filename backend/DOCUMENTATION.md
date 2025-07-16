# 📚 Documentación del Backend

## 📋 Índice de Documentación

Este archivo sirve como índice para toda la documentación específica del backend. Cada sección contiene enlaces a documentación detallada sobre aspectos específicos del sistema.

---

## 🛡️ **Autenticación y Autorización**

### Middleware de Autenticación

- **[README_MIDDLEWARE.md](apps/users/README_MIDDLEWARE.md)** - Documentación completa del sistema de middleware
  - Arquitectura del middleware
  - Configuración de rutas públicas y protegidas
  - Guest checkout implementation
  - Testing y troubleshooting
  - Casos de uso y ejemplos

### Sistema de Roles y Permisos

- **[README_ROLES.md](apps/users/README_ROLES.md)** - Sistema de roles y permisos
  - Roles disponibles (Admin, Vendedor, Cliente)
  - Permisos personalizados
  - APIs de gestión de usuarios
  - Comandos de creación de roles
  - Migración de datos existentes

### Refactorización del Código

- **[REFACTORING_SUMMARY.md](apps/users/REFACTORING_SUMMARY.md)** - Resumen de la refactorización del middleware
  - Problemas identificados y solucionados
  - Arquitectura mejorada
  - Métricas de mejora
  - Beneficios obtenidos

---

## 📧 **Sistema de Emails**

### Plantillas de Email Personalizadas

- **[EMAIL_TEMPLATES_SUMMARY.md](EMAIL_TEMPLATES_SUMMARY.md)** - Documentación completa del sistema de emails
  - Tipos de email implementados
  - Características de diseño
  - Configuración y personalización
  - Testing y verificación
  - Comandos útiles

### Configuración de Email

- **[templates/account/email/README.md](templates/account/email/README.md)** - Documentación específica de plantillas
  - Estructura de plantillas
  - Variables disponibles
  - Personalización avanzada

---

## ⚙️ **Configuración del Sistema**

### Configuración Importante

- **[projectsSettings/README_IMPORTANTE.md](projectsSettings/README_IMPORTANTE.md)** - Configuraciones críticas
  - Configuración de base de datos
  - Privilegios de usuario
  - Comandos SQL necesarios

---

## 🔧 **Utilidades y Herramientas**

### Comandos de Gestión

- **`apps/users/management/commands/`** - Comandos personalizados
  - `create_roles.py` - Crear usuarios con roles específicos
  - `test_middleware.py` - Testing del middleware
  - `test_email_templates.py` - Testing de plantillas de email
  - `test_roles.py` - Testing del sistema de roles

### Scripts de Testing

- **`test_email_setup.py`** - Verificación de configuración de email
- **`test_roles_simple.py`** - Testing simple del sistema de roles

---

## 📁 **Estructura de Archivos**

### Apps Principales

```
apps/
├── users/                    # Gestión de usuarios y autenticación
│   ├── middleware.py         # Middlewares de autenticación
│   ├── api_utils.py          # Utilidades de API
│   ├── constants.py          # Constantes del sistema
│   ├── utils.py              # Funciones de utilidad
│   ├── permissions.py        # Permisos personalizados
│   ├── models.py             # Modelo de usuario personalizado
│   ├── views.py              # Vistas de usuarios
│   └── management/           # Comandos de gestión
├── products/                 # Gestión de productos
├── orders/                   # Gestión de pedidos
├── payments/                 # Integración de pagos
└── importer/                 # Importación masiva
```

### Configuración

```
projectsSettings/
├── settings.py               # Configuración principal
├── urls.py                   # URLs del proyecto
└── README_IMPORTANTE.md      # Configuraciones importantes

templates/
└── account/email/            # Plantillas de email
    ├── email_confirmation_message.html
    ├── password_reset_key_message.html
    ├── password_changed_message.html
    └── README.md
```

---

## 🚀 **Guías de Implementación**

### 1. Configuración Inicial

1. Leer [README.md](README.md) - Documentación principal
2. Revisar [projectsSettings/README_IMPORTANTE.md](projectsSettings/README_IMPORTANTE.md) - Configuraciones críticas
3. Configurar variables de entorno
4. Ejecutar migraciones y setup inicial

### 2. Sistema de Autenticación

1. Revisar [apps/users/README_MIDDLEWARE.md](apps/users/README_MIDDLEWARE.md) - Middleware completo
2. Revisar [apps/users/README_ROLES.md](apps/users/README_ROLES.md) - Sistema de roles
3. Probar con comandos de testing
4. Configurar frontend para usar las APIs

### 3. Sistema de Emails

1. Revisar [EMAIL_TEMPLATES_SUMMARY.md](EMAIL_TEMPLATES_SUMMARY.md) - Documentación completa
2. Personalizar plantillas según branding
3. Probar envío de emails
4. Configurar para producción

### 4. Testing y Validación

1. Ejecutar tests unitarios: `python manage.py test`
2. Probar middleware: `python manage.py test_middleware`
3. Probar emails: `python manage.py test_email_templates`
4. Verificar configuración: `python manage.py check`

---

## 🔍 **Búsqueda Rápida**

### Por Funcionalidad

| Funcionalidad     | Documentación Principal | Documentación Específica                                      |
| ----------------- | ----------------------- | ------------------------------------------------------------- |
| **Autenticación** | [README.md](README.md)  | [README_MIDDLEWARE.md](apps/users/README_MIDDLEWARE.md)       |
| **Roles**         | [README.md](README.md)  | [README_ROLES.md](apps/users/README_ROLES.md)                 |
| **Emails**        | [README.md](README.md)  | [EMAIL_TEMPLATES_SUMMARY.md](EMAIL_TEMPLATES_SUMMARY.md)      |
| **Configuración** | [README.md](README.md)  | [README_IMPORTANTE.md](projectsSettings/README_IMPORTANTE.md) |
| **Testing**       | [README.md](README.md)  | Comandos en `management/commands/`                            |

### Por Problema

| Problema                   | Solución                                                                                     |
| -------------------------- | -------------------------------------------------------------------------------------------- |
| **Middleware no funciona** | [README_MIDDLEWARE.md](apps/users/README_MIDDLEWARE.md) + `python manage.py test_middleware` |
| **Emails no se envían**    | [EMAIL_TEMPLATES_SUMMARY.md](EMAIL_TEMPLATES_SUMMARY.md) + `python test_email_setup.py`      |
| **Roles no se aplican**    | [README_ROLES.md](apps/users/README_ROLES.md) + `python manage.py test_roles`                |
| **Configuración de BD**    | [README_IMPORTANTE.md](projectsSettings/README_IMPORTANTE.md)                                |
| **Refactorización**        | [REFACTORING_SUMMARY.md](apps/users/REFACTORING_SUMMARY.md)                                  |

---

## 📞 **Soporte y Contacto**

### Recursos de Ayuda

- **Documentación principal**: [README.md](README.md)
- **Troubleshooting**: Sección en [README.md](README.md)
- **Logs**: `backend/logs/api.log`
- **Comandos de verificación**: `python manage.py check`

### Enlaces Útiles

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Simple JWT](https://django-rest-framework-simplejwt.readthedocs.io/)
- [Django Allauth](https://django-allauth.readthedocs.io/)

---

**📝 Nota**: Esta documentación se actualiza regularmente. Para la versión más reciente, consulta el repositorio del proyecto.
