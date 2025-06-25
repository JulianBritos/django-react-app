from django.urls import path, include
from .views import ProductViewSet, CategoryViewSet, AttributeViewSet, AttributeOptionViewSet, ProductAttributeViewSet, ProductAttributeOptionLinkViewSet
from rest_framework.routers import DefaultRouter



router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'categories', CategoryViewSet)
router.register(r'attributes', AttributeViewSet)
router.register(r'attributeoptions', AttributeOptionViewSet)
router.register(r'productattributes', ProductAttributeViewSet)
router.register(r'productattributeoptionlinks', ProductAttributeOptionLinkViewSet)



urlpatterns = [
    path('', include(router.urls)),
]