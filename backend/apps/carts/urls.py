from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# URLs para la app carts
router = DefaultRouter()
router.register(r'carts', views.CartViewSet, basename='cart')

urlpatterns = [
    path('api/', include(router.urls)),
]
