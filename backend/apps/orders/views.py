from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Q

from .models import Order, OrderItem, OrderStatusHistory
from .serializers import (
    OrderSerializer, OrderCreateSerializer, OrderUpdateSerializer,
    OrderListSerializer, CheckoutSerializer, OrderItemSerializer,
    OrderStatusHistorySerializer
)
from apps.carts.models import Cart
from apps.payments.models import Payment, PaymentMethod

User = get_user_model()


class OrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de órdenes
    """
    permission_classes = [AllowAny]  # Permitir acceso para guest checkout

    def get_serializer_class(self):
        """
        Usar diferentes serializers según la acción
        """
        if self.action == 'create':
            return OrderCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return OrderUpdateSerializer
        elif self.action == 'list':
            return OrderListSerializer
        elif self.action == 'checkout':
            return CheckoutSerializer
        return OrderSerializer

    def get_queryset(self):
        """
        Filtrar órdenes según el usuario
        """
        if self.request.user.is_authenticated:
            # Usuarios autenticados ven sus propias órdenes
            if hasattr(self.request.user, 'is_admin') and self.request.user.is_admin:
                # Admins ven todas las órdenes
                return Order.objects.all().order_by('-created_at')
            else:
                # Usuarios normales solo sus órdenes
                return Order.objects.filter(user=self.request.user).order_by('-created_at')
        else:
            # Para guest checkout, filtrar por email de sesión
            guest_email = self.request.session.get('guest_email')
            if guest_email:
                return Order.objects.filter(
                    guest_email=guest_email,
                    user__isnull=True
                ).order_by('-created_at')
            return Order.objects.none()

    def perform_create(self, serializer):
        """
        Personalizar creación de órdenes
        """
        order = serializer.save()
        
        # Si es guest checkout, guardar email en sesión
        if not self.request.user.is_authenticated and order.guest_email:
            self.request.session['guest_email'] = order.guest_email

    @action(detail=False, methods=['post'])
    def checkout(self, request):
        """
        Proceso completo de checkout
        """
        serializer = CheckoutSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            # Obtener carrito
            cart = Cart.objects.get(id=serializer.validated_data['cart_id'])
            
            # Crear orden
            order_data = {
                'cart_id': cart.id,
                'guest_email': serializer.validated_data.get('guest_email'),
                'guest_phone': serializer.validated_data.get('guest_phone'),
                'guest_name': serializer.validated_data.get('guest_name'),
                'notes': serializer.validated_data.get('notes', '')
            }
            
            order_serializer = OrderCreateSerializer(
                data=order_data, 
                context={'request': request}
            )
            
            if order_serializer.is_valid():
                order = order_serializer.save()
                
                # TODO: Crear dirección de envío
                # TODO: Procesar pago
                
                # Respuesta con la orden creada
                response_serializer = OrderSerializer(order)
                response_data = {
                    'message': 'Orden creada exitosamente',
                    'order': response_serializer.data
                }
                
                # Vaciar carrito después de crear la orden (pero antes de enviar la respuesta)
                cart.items.all().delete()
                cart.status = 'converted'
                cart.save()
                
                return Response(response_data, status=status.HTTP_201_CREATED)
            
            return Response(order_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """
        Actualizar solo el estado de la orden
        """
        order = self.get_object()
        new_status = request.data.get('status')
        notes = request.data.get('notes', '')
        
        if not new_status:
            return Response({
                'error': 'Se requiere el campo status'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validar que el estado es válido
        valid_statuses = [choice[0] for choice in Order.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response({
                'error': f'Estado inválido. Estados válidos: {valid_statuses}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        old_status = order.status
        order.status = new_status
        order.save()
        
        # Crear historial
        OrderStatusHistory.objects.create(
            order=order,
            previous_status=old_status,
            new_status=new_status,
            changed_by=request.user if request.user.is_authenticated else None,
            notes=notes or f'Estado cambiado de {old_status} a {new_status}'
        )
        
        serializer = self.get_serializer(order)
        return Response({
            'message': f'Estado actualizado de {old_status} a {new_status}',
            'order': serializer.data
        })

    @action(detail=True, methods=['get'])
    def status_history(self, request, pk=None):
        """
        Obtener historial de estados de la orden
        """
        order = self.get_object()
        history = order.status_history.all().order_by('-created_at')
        serializer = OrderStatusHistorySerializer(history, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_orders(self, request):
        """
        Obtener órdenes del usuario actual
        """
        if request.user.is_authenticated:
            orders = Order.objects.filter(user=request.user).order_by('-created_at')
        else:
            guest_email = request.session.get('guest_email')
            if guest_email:
                orders = Order.objects.filter(
                    guest_email=guest_email,
                    user__isnull=True
                ).order_by('-created_at')
            else:
                orders = Order.objects.none()
        
        serializer = OrderListSerializer(orders, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def track(self, request, pk=None):
        """
        Tracking de la orden (información básica)
        """
        order = self.get_object()
        
        # Información de tracking básica
        tracking_info = {
            'order_number': order.order_number,
            'status': order.status,
            'status_display': order.get_status_display(),
            'created_at': order.created_at,
            'updated_at': order.updated_at,
            'total_amount': order.total_amount,
            'items_count': order.items.count(),
            'status_history': OrderStatusHistorySerializer(
                order.status_history.all().order_by('created_at'), 
                many=True
            ).data
        }
        
        # Agregar información de envío si existe
        if hasattr(order, 'shipment'):
            tracking_info['shipment'] = {
                'tracking_number': order.shipment.tracking_number,
                'carrier': order.shipment.carrier,
                'status': order.shipment.status,
                'estimated_delivery_date': order.shipment.estimated_delivery_date,
            }
        
        return Response(tracking_info)

    @action(detail=False, methods=['post'])
    def test_checkout(self, request):
        """
        Endpoint de test simplificado para checkout
        """
        try:
            cart_id = request.data.get('cart_id')
            
            if not cart_id:
                return Response({'error': 'cart_id requerido'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Verificar que el carrito existe
            try:
                cart = Cart.objects.get(id=cart_id)
            except Cart.DoesNotExist:
                return Response({'error': 'Carrito no encontrado'}, status=status.HTTP_404_NOT_FOUND)
            
            # Crear orden básica
            order = Order.objects.create(
                guest_email=request.data.get('guest_email', 'test@test.com'),
                guest_name=request.data.get('guest_name', 'Test User'),
                notes=request.data.get('notes', ''),
                subtotal=cart.total_amount,
                total_amount=cart.total_amount + 4.99  # + shipping
            )
            
            # Crear items de la orden
            for cart_item in cart.items.all():
                OrderItem.objects.create(
                    order=order,
                    product=cart_item.product,
                    product_attribute=cart_item.product_attribute,
                    product_name=cart_item.product.name,
                    unit_price=cart_item.unit_price,
                    quantity=cart_item.quantity
                )
            
            # Vaciar carrito
            cart.items.all().delete()
            cart.status = 'converted'
            cart.save()
            
            return Response({
                'message': 'Orden creada exitosamente',
                'order_id': order.id,
                'order_number': order.order_number,
                'total': order.total_amount
            })
            
        except Exception as e:
            return Response({
                'error': 'Error interno',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OrderItemViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para items de órdenes (solo lectura)
    """
    serializer_class = OrderItemSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        """
        Filtrar items según la orden
        """
        order_id = self.request.query_params.get('order_id')
        if order_id:
            return OrderItem.objects.filter(order_id=order_id)
        return OrderItem.objects.none()
