from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import register, login_view, UserManagementViewSet, GoogleLoginView, UserDetailView, ChangePasswordView, VerifyEmailView, ResendVerificationCodeView
from rest_framework.routers import DefaultRouter


app_name = 'users'

router = DefaultRouter()

router.register(r'users', UserManagementViewSet, basename='user')


urlpatterns = [
    path('', include(router.urls)),
    path('register/', register, name='register'),
    path('login/', login_view, name='login'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path("auth/google/", GoogleLoginView.as_view(), name="google-login"),
    path('me/', UserDetailView.as_view(), name='user-detail'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify-email'),
    path('resend-code/', ResendVerificationCodeView.as_view(), name='resend-code'),
]