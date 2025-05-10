# importer/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('import/', views.import_products, name='import_products'),
]
