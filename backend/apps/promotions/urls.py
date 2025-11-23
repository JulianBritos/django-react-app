from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# URLs para la app promotions
router = DefaultRouter()
router.register(r'coupons', views.CouponViewSet, basename='coupon')
router.register(r'coupon-usages', views.CouponUsageViewSet, basename='couponusage')
router.register(r'promotions', views.PromotionViewSet, basename='promotion')
router.register(r'promotion-usages', views.PromotionUsageViewSet, basename='promotionusage')

urlpatterns = [
    path('api/', include(router.urls)),
]
