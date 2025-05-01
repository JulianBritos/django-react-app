from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from rest_framework.routers import DefaultRouter


app_name = 'users'

router = DefaultRouter()


urlpatterns = [
    path('', include(router.urls)),
    
]