from django.urls import path, include
from .views import ProductViewSet, CategoryViewSet, VariantViewSet, VariantOptionViewSet, ProductVariantViewSet
from rest_framework.routers import DefaultRouter



router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'categories', CategoryViewSet)
router.register(r'variants', VariantViewSet, basename='variant')
router.register(r'variant-options', VariantOptionViewSet, basename='variant-option')
router.register(r'product-variants', ProductVariantViewSet, basename='product-variant')


urlpatterns = [
    path('', include(router.urls)),
]