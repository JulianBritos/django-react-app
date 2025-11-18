from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
from django.core.exceptions import ValidationError
import logging
from .services import StockValidationService, CartCalculationService, StockReservationService, CouponService
from .models import Cart, CartItem, Wishlist, WishlistItem, RecentlyViewed
from .serializers import (
    CartSerializer, CartItemSerializer, CartItemCreateUpdateSerializer,
    WishlistSerializer, WishlistItemSerializer, RecentlyViewedSerializer
)
from apps.products.models import Product, ProductAttribute


User = get_user_model()
logger = logging.getLogger(__name__)


class CartViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de carritos
    Soporta usuarios autenticados y sesiones de invitados
    """
    serializer_class = CartSerializer
    permission_classes = [AllowAny]  # Permitir carritos de invitados

    def get_queryset(self):
        """
        Filtrar carritos por usuario o sesión
        """
        # Verificar si el usuario está autenticado
        user = getattr(self.request, 'user', None)
        
        if user and hasattr(user, 'is_authenticated') and user.is_authenticated and not user.is_anonymous:
            return Cart.objects.filter(user=user)
        else:
            # Para usuarios guest, usar session_id
            session_id = getattr(self.request.session, 'session_key', None)
            if not session_id and hasattr(self.request, 'session'):
                self.request.session.create()
                session_id = self.request.session.session_key
            
            if session_id:
                return Cart.objects.filter(session_id=session_id, user__isnull=True)
            return Cart.objects.none()

    def get_or_create_cart(self):
        """
        Obtener o crear carrito para el usuario/sesión actual
        """
        # Verificar si el usuario está autenticado
        user = getattr(self.request, 'user', None)
        
        if user and hasattr(user, 'is_authenticated') and user.is_authenticated and not user.is_anonymous:
            cart, created = Cart.objects.get_or_create(
                user=user,
                status='active',
                defaults={'currency': 'ARS'}
            )
        else:
            # Para usuarios guest, asegurar que existe session_key
            if not hasattr(self.request, 'session'):
                # Si no hay sesión, crear una
                from django.contrib.sessions.middleware import SessionMiddleware
                middleware = SessionMiddleware(lambda x: None)
                middleware.process_request(self.request)
            
            session_id = getattr(self.request.session, 'session_key', None)
            if not session_id:
                self.request.session.create()
                session_id = self.request.session.session_key
            
            cart, created = Cart.objects.get_or_create(
                session_id=session_id,
                user__isnull=True,
                status='active',
                defaults={'currency': 'ARS'}
            )
        
        return cart, created

    @action(detail=False, methods=['get'])
    def current(self, request):
        """
        Obtener el carrito actual del usuario/sesión
        """
        cart, created = self.get_or_create_cart()
        serializer = self.get_serializer(cart)
        return Response({
            'cart': serializer.data,
            'created': created
        })

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        """
        Agregar item al carrito
        """
        try:
            cart, _ = self.get_or_create_cart()
            
            # Validar datos del item
            item_serializer = CartItemCreateUpdateSerializer(data=request.data)
            if item_serializer.is_valid():
                product_id = item_serializer.validated_data['product_id']
                product_attribute_id = item_serializer.validated_data.get('product_attribute_id')
                quantity = item_serializer.validated_data.get('quantity', 1)
                
                # Buscar si ya existe el item en el carrito
                existing_item = cart.items.filter(
                    product_id=product_id,
                    product_attribute_id=product_attribute_id
                ).first()
                
                if existing_item:
                    # Actualizar cantidad del item existente
                    existing_item.quantity += quantity
                    existing_item.save()
                    item_data = CartItemSerializer(existing_item).data
                    message = "Cantidad actualizada en el carrito"
                else:
                    # Crear nuevo item
                    try:
                        product = Product.objects.get(id=product_id)
                    except Product.DoesNotExist:
                        return Response({
                            'error': 'El producto no existe'
                        }, status=status.HTTP_404_NOT_FOUND)
                    
                    product_attribute = None
                    
                    if product_attribute_id:
                        try:
                            product_attribute = ProductAttribute.objects.get(id=product_attribute_id)
                            unit_price = product_attribute.selling_price or product_attribute.offer_price
                        except ProductAttribute.DoesNotExist:
                            return Response({
                                'error': 'La variante del producto no existe'
                            }, status=status.HTTP_404_NOT_FOUND)
                    else:
                        # Usar el precio del primer atributo disponible
                        first_attr = product.product_attributes.filter(stock__gt=0).first()
                        if first_attr:
                            unit_price = first_attr.selling_price or first_attr.offer_price
                        else:
                            unit_price = 0
                    
                    cart_item = CartItem.objects.create(
                        cart=cart,
                        product=product,
                        product_attribute=product_attribute,
                        quantity=quantity,
                        unit_price=unit_price,
                        selected_attributes=item_serializer.validated_data.get('selected_attributes'),
                        notes=item_serializer.validated_data.get('notes', '')
                    )
                    
                    item_data = CartItemSerializer(cart_item).data
                    message = "Producto agregado al carrito"
                
                # Devolver carrito actualizado
                cart_serializer = CartSerializer(cart)
                return Response({
                    'message': message,
                    'item': item_data,
                    'cart': cart_serializer.data
                }, status=status.HTTP_201_CREATED)
            
            return Response({
                'error': 'Datos inválidos',
                'details': item_serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Error al agregar item al carrito: {str(e)}", exc_info=True)
            return Response({
                'error': 'Error al agregar producto al carrito',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['patch'])
    def update_item(self, request):
        """
        Actualizar cantidad de un item del carrito
        """
        item_id = request.data.get('item_id')
        quantity = request.data.get('quantity')
        
        if not item_id or quantity is None:
            return Response({
                'error': 'Se requiere item_id y quantity'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        cart, _ = self.get_or_create_cart()
        
        try:
            cart_item = cart.items.get(id=item_id)
            
            if quantity <= 0:
                cart_item.delete()
                message = "Item eliminado del carrito"
                item_data = None
            else:
                cart_item.quantity = quantity
                cart_item.save()
                message = "Cantidad actualizada"
                item_data = CartItemSerializer(cart_item).data
            
            cart_serializer = CartSerializer(cart)
            return Response({
                'message': message,
                'item': item_data,
                'cart': cart_serializer.data
            })
            
        except CartItem.DoesNotExist:
            return Response({
                'error': 'Item no encontrado en el carrito'
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['delete'])
    def remove_item(self, request):
        """
        Eliminar item del carrito
        """
        item_id = request.data.get('item_id')
        
        if not item_id:
            return Response({
                'error': 'Se requiere item_id'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        cart, _ = self.get_or_create_cart()
        
        try:
            cart_item = cart.items.get(id=item_id)
            cart_item.delete()
            
            cart_serializer = CartSerializer(cart)
            return Response({
                'message': 'Item eliminado del carrito',
                'cart': cart_serializer.data
            })
            
        except CartItem.DoesNotExist:
            return Response({
                'error': 'Item no encontrado en el carrito'
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['delete'])
    def clear(self, request):
        """
        Vaciar carrito completamente
        """
        cart, _ = self.get_or_create_cart()
        cart.items.all().delete()
        
        cart_serializer = CartSerializer(cart)
        return Response({
            'message': 'Carrito vaciado',
            'cart': cart_serializer.data
        })

    @action(detail=False, methods=['get'])
    def count(self, request):
        """
        Obtener cantidad total de items en el carrito
        """
        cart, _ = self.get_or_create_cart()
        return Response({
            'count': cart.total_items,
            'amount': cart.total_amount
        })

    @action(detail=False, methods=['post'])
    def validate_stock(self, request):
        """
        Endpoint para validar stock antes de agregar al carrito
        """
        product_id = request.data.get('product_id')
        product_attribute_id = request.data.get('product_attribute_id')
        quantity = request.data.get('quantity', 1)
        
        if not product_id:
            return Response({
                'error': 'product_id es requerido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            validation = StockValidationService.validate_stock_availability(
                product_id, product_attribute_id, quantity
            )
            return Response(validation)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def apply_coupon(self, request):
        """
        Aplicar un cupón de descuento al carrito
        """
        coupon_code = request.data.get('coupon_code')
        
        if not coupon_code:
            return Response({
                'error': 'Se requiere el código del cupón'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        cart, _ = self.get_or_create_cart()
        
        try:
            result = CouponService.apply_coupon_to_cart(cart, coupon_code)
            return Response(result, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error aplicando cupón: {str(e)}")
            return Response({
                'error': 'Error al aplicar el cupón'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def remove_coupon(self, request):
        """
        Remover cupón del carrito
        """
        cart, _ = self.get_or_create_cart()
        
        try:
            result = CouponService.remove_coupon_from_cart(cart)
            return Response(result, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error removiendo cupón: {str(e)}")
            return Response({
                'error': 'Error al remover el cupón'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def validate_coupon(self, request):
        """
        Validar un cupón sin aplicarlo
        """
        coupon_code = request.data.get('coupon_code')
        
        if not coupon_code:
            return Response({
                'error': 'Se requiere el código del cupón'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        cart, _ = self.get_or_create_cart()
        
        validation = CouponService.validate_coupon(
            coupon_code, 
            user=request.user if request.user.is_authenticated else None,
            cart=cart
        )
        
        if validation['valid']:
            coupon = validation['coupon']
            # Calcular el descuento que se aplicaría
            totals = CartCalculationService.calculate_cart_totals(cart)
            discount = CouponService.calculate_discount(
                coupon, 
                totals['subtotal'], 
                totals['shipping_cost']
            )
            
            return Response({
                'valid': True,
                'coupon': {
                    'code': coupon.code,
                    'name': coupon.name,
                    'description': coupon.description,
                    'discount_type': coupon.discount_type,
                    'discount_value': str(coupon.discount_value),
                },
                'estimated_discount': str(discount),
                'message': validation['message']
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'valid': False,
                'message': validation['message']
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def test(self, request):
        """
        Endpoint de test para verificar que las APIs funcionan
        """
        return Response({
            'message': 'API de carrito funcionando',
            'user_authenticated': request.user.is_authenticated if hasattr(request, 'user') else False,
            'session_key': request.session.session_key,
            'path': request.path
        })
