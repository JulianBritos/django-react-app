# 🛒 Django React E-commerce App

## 📋 Descripción

Aplicación completa de e-commerce construida con Django (backend) y React (frontend), con sistema de autenticación JWT, roles de usuario, guest checkout, y integración con MercadoPago.

## 🚀 Inicio Rápido

### Prerrequisitos

- Docker y Docker Compose instalados
- Puertos disponibles: 3000, 80, 5432, 8000

### Ejecutar el Proyecto

```bash
# 1. Construir las imágenes (si hay cambios)
docker compose build

# 2. Levantar todos los servicios
docker compose up -d

# 3. Abrir la aplicación
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# Admin Django: http://localhost:8000/admin

# 4. Detener los servicios
docker compose down
```

### ⚠️ Importante

- **Recuerda detener Docker** después de usar con `docker compose down`
- Si olvidas detenerlo, ejecuta `docker compose up` sin `-d` para ver los logs

## 📚 Documentación

### Backend (Django)

- **[README Principal](backend/README.md)** - Documentación completa del backend
- **[Índice de Documentación](backend/DOCUMENTATION.md)** - Guía de toda la documentación específica
- **[Middleware de Autenticación](backend/apps/users/README_MIDDLEWARE.md)** - Sistema de autenticación JWT
- **[Sistema de Roles](backend/apps/users/README_ROLES.md)** - Roles y permisos de usuario
- **[Plantillas de Email](backend/EMAIL_TEMPLATES_SUMMARY.md)** - Sistema de emails personalizados

### Frontend (React)

- **[README del Frontend](frontend/app/README.md)** - Documentación del frontend React

## 🏗️ Arquitectura

```
├── backend/                 # API Django REST
│   ├── apps/
│   │   ├── users/          # Autenticación y roles
│   │   ├── products/       # Gestión de productos
│   │   ├── orders/         # Gestión de pedidos
│   │   ├── payments/       # Integración MercadoPago
│   │   └── importer/       # Importación masiva
│   └── projectsSettings/   # Configuración Django
├── frontend/               # Aplicación React
│   └── app/
│       ├── src/
│       │   ├── components/ # Componentes React
│       │   ├── pages/      # Páginas de la aplicación
│       │   └── api/        # Cliente API
│       └── public/         # Archivos estáticos
└── db/                     # Scripts de base de datos
```

## 🔐 Características de Seguridad

- ✅ **Autenticación JWT** con refresh tokens
- ✅ **Sistema de roles** (Admin, Vendedor, Cliente)
- ✅ **Guest checkout** para compras sin registro
- ✅ **Middleware de seguridad** robusto
- ✅ **Validación de datos** en frontend y backend
- ✅ **Logging completo** para auditoría

## 🛍️ Funcionalidades de E-commerce

- ✅ **Gestión de productos** con variantes y atributos
- ✅ **Sistema de categorías** jerárquico
- ✅ **Carrito de compras** persistente
- ✅ **Integración MercadoPago** para pagos
- ✅ **Gestión de pedidos** completa
- ✅ **Plantillas de email** personalizadas

## 🧪 Testing

```bash
# Backend
cd backend
python manage.py test
python manage.py test_middleware
python manage.py test_email_templates

# Frontend
cd frontend/app
npm test
```

## 📊 Estado del Proyecto

### ✅ Implementado

- Sistema de autenticación completo
- Gestión de usuarios y roles
- CRUD de productos y categorías
- Integración básica de pagos
- Middleware de seguridad
- Plantillas de email personalizadas

### 🚧 En Desarrollo

- Funcionalidades avanzadas de e-commerce
- Dashboard administrativo completo
- Sistema de notificaciones
- Optimizaciones de rendimiento

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**¡El proyecto está listo para desarrollo y testing!** 🎉

Para más información, consulta la documentación específica de cada componente.
