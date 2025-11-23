from django.urls import path, include
from .views import create_preference, webhook_mercadopago, payment_notification, PaymentViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'payments', PaymentViewSet, basename='payment')

urlpatterns = [
    path('api/', include(router.urls)),
    path("create_preference/", create_preference, name="create_preference"),
    path("webhook-mercadopago/", webhook_mercadopago, name="webhook_mercadopago"),
    path("payment_notification/", payment_notification, name="payment_notification"),
]