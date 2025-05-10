from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from apps.users.views import email_confirmation, reset_password_confirm

schema_view = get_schema_view(
    openapi.Info(
        title="API Documentation",
        default_version="v1",
        description="Documentación de la API para el proyecto Django-React",
        terms_of_service="https://www.google.com/policies/terms/",
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
    
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('apps/products/', include('apps.products.urls')),
    path('accounts/', include('allauth.socialaccount.urls')),
    path('apps/payments/', include('apps.payments.urls')),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('dj_rest_auth/', include('dj_rest_auth.urls')),
    path('dj_rest_auth/registration/account-confirm-email/<str:key>/', email_confirmation),
    path('dj_rest_auth/registration/', include('dj_rest_auth.registration.urls')),
    path('reset/password/confirm/<uid>/<str:token>', reset_password_confirm, name='password_reset_confirm'),
    path('import/', include('importer.urls')),   
    


]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
