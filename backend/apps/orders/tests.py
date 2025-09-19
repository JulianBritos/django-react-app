# backend/apps/orders/tests_api.py

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from decimal import Decimal

from apps.orders.models import Order, OrderItem, OrderStatusHistory
from apps.carts.models import Cart, CartItem, StockReservation
from apps.products.models import Product, ProductAttribute, Category

User = get_user_model()


class OrderAPITest(APITestCase):
    """Tests para las APIs de órdenes"""
    
    def setUp(self):
        """Configurar datos de prueba"""
        self.user = User.objects.create_user(
            email="test@test.com",
            password="testpass123"
        )
        
        self.category = Category.objects.create(name="Test Category")
        
        self.product = Product.objects.create(
            name="Test Product",
            description="Test Description",
            category=self.category,
            status='ACTIVE'
        )
        
        self.product_attribute = ProductAttribute.objects.create(
            product=self.product,
            sku="TEST-001",
            selling_price=100.0,
            stock=10
        )
        
        self.cart = Cart.objects.create(user=self.user)
        
        CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            product_attribute=self.product_attribute,
            quantity=2,
            unit_price=100.0
        )
    
    def test_create_order_from_cart_success(self):
        """Test crear orden desde carrito exitosamente"""
        self.client.force_authenticate(user=self.user)
        
        data = {
            'cart_id': self.cart.id,
            'guest_email': 'test@test.com',
            'guest_name': 'Test User',
            'notes': 'Test order'
        }
        
        response = self.client.post('/apps/orders/api/orders/', data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verificar que se creó la orden
        order = Order.objects.get(cart_id=self.cart.id)
        self.assertEqual(order.guest_email, 'test@test.com')
        self.assertEqual(order.guest_name, 'Test User')
        self.assertEqual(order.notes, 'Test order')
        self.assertEqual(order.status, 'pending')
        
        # Verificar que se crearon los items
        self.assertEqual(order.items.count(), 1)
        order_item = order.items.first()
        self.assertEqual(order_item.product, self.product)
        self.assertEqual(order_item.quantity, 2)
        self.assertEqual(order_item.unit_price, Decimal('100.00'))
        
        # Verificar que se creó el historial
        self.assertEqual(order.status_history.count(), 1)
        history = order.status_history.first()
        self.assertEqual(history.new_status, 'pending')
    
    def test_create_order_from_cart_empty(self):
        """Test crear orden desde carrito vacío"""
        self.client.force_authenticate(user=self.user)
        
        # Vaciar carrito
        self.cart.items.all().delete()
        
        data = {
            'cart_id': self.cart.id,
            'guest_email': 'test@test.com'
        }
        
        response = self.client.post('/apps/orders/api/orders/', data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('El carrito está vacío', str(response.data))
    
    def test_create_order_nonexistent_cart(self):
        """Test crear orden con carrito inexistente"""
        self.client.force_authenticate(user=self.user)
        
        data = {
            'cart_id': 999,
            'guest_email': 'test@test.com'
        }
        
        response = self.client.post('/apps/orders/api/orders/', data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('El carrito no existe', str(response.data))
    
    def test_checkout_process_success(self):
        """Test proceso completo de checkout"""
        self.client.force_authenticate(user=self.user)
        
        data = {
            'cart_id': self.cart.id,
            'guest_email': 'test@test.com',
            'guest_name': 'Test User',
            'guest_phone': '123456789',
            'shipping_address': {
                'first_name': 'Test',
                'last_name': 'User',
                'address_line_1': 'Test Address 123',
                'city': 'Test City',
                'postal_code': '12345'
            },
            'payment_method': 'mercado_pago',
            'notes': 'Test checkout'
        }
        
        response = self.client.post('/apps/orders/api/orders/checkout/', data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('message', response.data)
        self.assertIn('order', response.data)
        
        # Verificar que se creó la orden
        order = Order.objects.get(cart_id=self.cart.id)
        self.assertEqual(order.guest_email, 'test@test.com')
        self.assertEqual(order.guest_name, 'Test User')
        
        # Verificar que el carrito se marcó como convertido
        self.cart.refresh_from_db()
        self.assertEqual(self.cart.status, 'converted')
        
        # Verificar que se crearon reservas de stock
        reservations = StockReservation.objects.filter(cart=self.cart)
        self.assertEqual(reservations.count(), 1)
        self.assertEqual(reservations.first().status, 'consumed')
    
    def test_checkout_process_insufficient_stock(self):
        """Test checkout con stock insuficiente"""
        self.client.force_authenticate(user=self.user)
        
        # Reducir stock a 1
        self.product_attribute.stock = 1
        self.product_attribute.save()
        
        data = {
            'cart_id': self.cart.id,
            'guest_email': 'test@test.com',
            'shipping_address': {
                'first_name': 'Test',
                'last_name': 'User',
                'address_line_1': 'Test Address 123',
                'city': 'Test City',
                'postal_code': '12345'
            },
            'payment_method': 'mercado_pago'
        }
        
        response = self.client.post('/apps/orders/api/orders/checkout/', data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Stock insuficiente', str(response.data))
    
    def test_update_order_status(self):
        """Test actualizar estado de orden"""
        self.client.force_authenticate(user=self.user)
        
        # Crear orden
        order = Order.objects.create(
            user=self.user,
            guest_email='test@test.com',
            subtotal=200.0,
            total_amount=200.0
        )
        
        data = {
            'status': 'confirmed',
            'notes': 'Order confirmed by admin'
        }
        
        response = self.client.patch(f'/apps/orders/api/orders/{order.id}/update_status/', data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        order.refresh_from_db()
        self.assertEqual(order.status, 'confirmed')
        
        # Verificar que se creó el historial
        self.assertEqual(order.status_history.count(), 1)
        history = order.status_history.first()
        self.assertEqual(history.previous_status, 'pending')
        self.assertEqual(history.new_status, 'confirmed')
    
    def test_get_order_status_history(self):
        """Test obtener historial de estados de orden"""
        self.client.force_authenticate(user=self.user)
        
        # Crear orden con historial
        order = Order.objects.create(
            user=self.user,
            guest_email='test@test.com',
            subtotal=200.0,
            total_amount=200.0
        )
        
        OrderStatusHistory.objects.create(
            order=order,
            new_status='pending',
            notes='Order created'
        )
        
        OrderStatusHistory.objects.create(
            order=order,
            previous_status='pending',
            new_status='confirmed',
            notes='Order confirmed'
        )
        
        response = self.client.get(f'/apps/orders/api/orders/{order.id}/status_history/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
    
    def test_get_my_orders(self):
        """Test obtener órdenes del usuario"""
        self.client.force_authenticate(user=self.user)
        
        # Crear órdenes
        Order.objects.create(
            user=self.user,
            guest_email='test@test.com',
            subtotal=200.0,
            total_amount=200.0
        )
        
        Order.objects.create(
            user=self.user,
            guest_email='test2@test.com',
            subtotal=300.0,
            total_amount=300.0
        )
        
        response = self.client.get('/apps/orders/api/orders/my_orders/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
    
    def test_track_order(self):
        """Test tracking de orden"""
        self.client.force_authenticate(user=self.user)
        
        # Crear orden
        order = Order.objects.create(
            user=self.user,
            guest_email='test@test.com',
            subtotal=200.0,
            total_amount=200.0
        )
        
        response = self.client.get(f'/apps/orders/api/orders/{order.id}/track/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('order_number', response.data)
        self.assertIn('status', response.data)
        self.assertIn('status_history', response.data)
    
    def test_validate_checkout(self):
        """Test validación previa de checkout"""
        self.client.force_authenticate(user=self.user)
        
        data = {
            'cart_id': self.cart.id,
            'shipping_address': {
                'first_name': 'Test',
                'last_name': 'User',
                'address_line_1': 'Test Address 123',
                'city': 'Test City',
                'postal_code': '12345'
            }
        }
        
        response = self.client.post('/apps/orders/api/orders/validate_checkout/', data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['valid'])
        self.assertEqual(len(response.data['errors']), 0)
        self.assertIn('cart_summary', response.data)
    
    def test_validate_checkout_invalid_address(self):
        """Test validación de checkout con dirección inválida"""
        self.client.force_authenticate(user=self.user)
        
        data = {
            'cart_id': self.cart.id,
            'shipping_address': {
                'first_name': 'Test',
                # Faltan campos requeridos
            }
        }
        
        response = self.client.post('/apps/orders/api/orders/validate_checkout/', data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['valid'])
        self.assertGreater(len(response.data['errors']), 0)