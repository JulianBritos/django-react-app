from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from apps.users.views import email_confirmation, reset_password_confirm
from django.contrib.auth.decorators import login_required, user_passes_test

def is_staff_user(user):
    """Verifica si el usuario es staff o superusuario"""
    return user.is_staff or user.is_superuser

schema_view = get_schema_view(
    openapi.Info(
        title="API Documentation",
        default_version="v1",
        description="Documentación de la API para el proyecto Django-React",
        terms_of_service="https://www.google.com/policies/terms/",
    ),
    public=False,  # Cambiar a False para requerir autenticación
    permission_classes=(permissions.IsAuthenticated,),  # Requerir autenticación
    
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('apps.users.urls')),
    path('apps/products/', include('apps.products.urls')),
    path('apps/carts/', include('apps.carts.urls')),  # Rutas de carrito
    path('apps/orders/', include('apps.orders.urls')),  # Rutas de órdenes
    path('apps/shipping/', include('apps.shipping.urls')),  # Rutas de envío
    path('apps/promotions/', include('apps.promotions.urls')),  # Rutas de promociones
    path('apps/analytics/', include('apps.analytics.urls')),  # Rutas de analíticas
    path('accounts/', include('allauth.socialaccount.urls')),
    path('apps/payments/', include('apps.payments.urls')),
    # Restringir acceso a Swagger solo a usuarios autenticados y staff
    path('swagger/', login_required(user_passes_test(is_staff_user)(schema_view.with_ui('swagger', cache_timeout=0))), name='schema-swagger-ui'),
    path('dj_rest_auth/', include('dj_rest_auth.urls')),
    path('dj_rest_auth/registration/account-confirm-email/<str:key>/', email_confirmation),
    path('dj_rest_auth/registration/', include('dj_rest_auth.registration.urls')),
    path('reset/password/confirm/<uid>/<str:token>', reset_password_confirm, name='password_reset_confirm'),
    path('records/', include('apps.importer.urls')),  
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
