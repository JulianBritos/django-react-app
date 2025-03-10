from django.urls import path, include
from .views import get_books, create_book, book_detail, ProductViewSet, CategoryViewSet, register, login_view, UserManagementViewSet
from rest_framework.routers import DefaultRouter


router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'categories', CategoryViewSet)
router.register(r'users', UserManagementViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', register, name='register'),
    path('login/', login_view, name='login'),
    path('books/', get_books, name='get_books'),
    path('books/create/', create_book, name='create_book'),
    path('books/<int:pk>', book_detail, name='book_detail')
]