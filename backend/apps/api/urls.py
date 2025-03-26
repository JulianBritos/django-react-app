from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import ProductViewSet, CategoryViewSet, register, login_view, UserManagementViewSet, create_preference, webhook_mercadopago, payment_notification
from rest_framework.routers import DefaultRouter



router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'categories', CategoryViewSet)
router.register(r'users', UserManagementViewSet, basename='user')


urlpatterns = [
    path('', include(router.urls)),
    path('register/', register, name='register'),
    path('login/', login_view, name='login'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path("create_preference/", create_preference, name="create_preference"),
    path("webhook-mercadopago/", webhook_mercadopago, name="webhook_mercadopago"),
    path("payment_notification/", payment_notification, name="payment_notification"),
    
]