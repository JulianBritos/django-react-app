from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import register, login_view, UserManagementViewSet
from rest_framework.routers import DefaultRouter



router = DefaultRouter()

router.register(r'users', UserManagementViewSet, basename='user')


urlpatterns = [
    path('', include(router.urls)),
    path('register/', register, name='register'),
    path('login/', login_view, name='login'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),    
]