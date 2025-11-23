from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# URLs para la app analytics
router = DefaultRouter()
router.register(r'analytics', views.AnalyticsViewSet, basename='analytics')

urlpatterns = [
    path('api/', include(router.urls)),
]
