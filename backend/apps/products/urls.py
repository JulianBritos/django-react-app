from django.urls import path, include
from .views import ProductViewSet, CategoryViewSet, AttributeViewSet, AttributeOptionViewSet, ProductVariantViewSet
from rest_framework.routers import DefaultRouter



router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'categories', CategoryViewSet)
router.register(r'attributes', AttributeViewSet)
router.register(r'attribute-options', AttributeOptionViewSet)
router.register(r'variants', ProductVariantViewSet, basename='product-variant')


urlpatterns = [
    path('', include(router.urls)),
]