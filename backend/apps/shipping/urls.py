from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# URLs para la app shipping
router = DefaultRouter()
router.register(r'addresses', views.AddressViewSet, basename='address')
router.register(r'shipping-zones', views.ShippingZoneViewSet, basename='shippingzone')
router.register(r'shipping-methods', views.ShippingMethodViewSet, basename='shippingmethod')
router.register(r'shipments', views.ShipmentViewSet, basename='shipment')
router.register(r'tracking-events', views.TrackingEventViewSet, basename='trackingevent')

urlpatterns = [
    path('api/', include(router.urls)),
]
