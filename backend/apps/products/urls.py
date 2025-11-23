from django.urls import path, include
from .views import (
    ProductViewSet, CategoryViewSet, AttributeViewSet, AttributeOptionViewSet,
    ProductAttributeViewSet, ProductAttributeOptionLinkViewSet,
    ProductReviewViewSet, RelatedProductViewSet, StockMovementViewSet,
    InventoryManagementViewSet
)
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'categories', CategoryViewSet)
router.register(r'attributes', AttributeViewSet)
router.register(r'attributeoptions', AttributeOptionViewSet)
router.register(r'productattributes', ProductAttributeViewSet)
router.register(r'productattributeoptionlinks', ProductAttributeOptionLinkViewSet)
router.register(r'reviews', ProductReviewViewSet, basename='review')
router.register(r'related-products', RelatedProductViewSet, basename='relatedproduct')
router.register(r'stock-movements', StockMovementViewSet, basename='stockmovement')
router.register(r'inventory', InventoryManagementViewSet, basename='inventory')

urlpatterns = [
    path('', include(router.urls)),
]