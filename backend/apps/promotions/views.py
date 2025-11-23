from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from .models import Coupon, CouponUsage, Promotion, PromotionUsage
from .serializers import (
    CouponSerializer, CouponUsageSerializer, PromotionSerializer,
    PromotionUsageSerializer, CouponValidationSerializer, CouponApplySerializer
)
from .services import PromotionService, CouponServiceIntegration
from apps.carts.models import Cart
from apps.carts.services import CouponService
from apps.orders.models import Order
import logging

logger = logging.getLogger(__name__)


class CouponViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de cupones
    """
    serializer_class = CouponSerializer
    
    def get_queryset(self):
        """
        Filtrar cupones según permisos
        """
        user = self.request.user
        
        if user.is_authenticated and hasattr(user, 'is_admin') and user.is_admin:
            # Admins ven todos los cupones
            return Coupon.objects.all().order_by('-created_at')
        else:
            # Clientes solo ven cupones activos y válidos
            now = timezone.now()
            return Coupon.objects.filter(
                is_active=True,
                valid_from__lte=now,
                valid_until__gte=now
            ).order_by('-created_at')
    
    def get_permissions(self):
        """
        Solo admins pueden crear/editar/eliminar cupones
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [AllowAny()]
    
    @action(detail=False, methods=['post'])
    def validate(self, request):
        """
        Validar un cupón sin aplicarlo
        """
        serializer = CouponValidationSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'error': 'Datos inválidos',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        coupon_code = serializer.validated_data['coupon_code']
        cart_id = serializer.validated_data.get('cart_id')
        
        # Obtener carrito si se proporciona
        cart = None
        if cart_id:
            try:
                cart = Cart.objects.get(id=cart_id)
            except Cart.DoesNotExist:
                return Response({
                    'error': 'Carrito no encontrado'
                }, status=status.HTTP_404_NOT_FOUND)
        
        # Validar cupón usando CouponService
        user = request.user if request.user.is_authenticated else None
        validation = CouponService.validate_coupon(coupon_code, user=user, cart=cart)
        
        if validation['valid']:
            coupon = validation['coupon']
            
            # Calcular descuento estimado si hay carrito
            estimated_discount = Decimal('0')
            if cart:
                from apps.carts.services import CartCalculationService
                totals = CartCalculationService.calculate_cart_totals(cart)
                estimated_discount = CouponService.calculate_discount(
                    coupon, totals['subtotal'], totals['shipping_cost']
                )
            
            return Response({
                'valid': True,
                'coupon': CouponSerializer(coupon).data,
                'estimated_discount': str(estimated_discount),
                'message': validation['message']
            })
        else:
            return Response({
                'valid': False,
                'message': validation['message']
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def usages(self, request, pk=None):
        """
        Obtener usos de un cupón (solo para admins)
        """
        coupon = self.get_object()
        
        if not request.user.is_authenticated or not (hasattr(request.user, 'is_admin') and request.user.is_admin):
            return Response({
                'error': 'No tienes permiso para ver esta información'
            }, status=status.HTTP_403_FORBIDDEN)
        
        usages = coupon.usages.all().order_by('-used_at')
        serializer = CouponUsageSerializer(usages, many=True)
        return Response(serializer.data)


class CouponUsageViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para ver usos de cupones (solo lectura, solo admins)
    """
    serializer_class = CouponUsageSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        """
        Filtrar por cupón o orden si se especifica
        """
        queryset = CouponUsage.objects.all().select_related('coupon', 'user', 'order')
        
        coupon_id = self.request.query_params.get('coupon_id')
        if coupon_id:
            queryset = queryset.filter(coupon_id=coupon_id)
        
        order_id = self.request.query_params.get('order_id')
        if order_id:
            queryset = queryset.filter(order_id=order_id)
        
        return queryset.order_by('-used_at')


class PromotionViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de promociones
    """
    serializer_class = PromotionSerializer
    
    def get_queryset(self):
        """
        Filtrar promociones según permisos
        """
        user = self.request.user
        
        if user.is_authenticated and hasattr(user, 'is_admin') and user.is_admin:
            # Admins ven todas las promociones
            return Promotion.objects.all().order_by('-created_at')
        else:
            # Clientes solo ven promociones activas
            return PromotionService.get_active_promotions()
    
    def get_permissions(self):
        """
        Solo admins pueden crear/editar/eliminar promociones
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [AllowAny()]
    
    @action(detail=False, methods=['post'])
    def get_applicable(self, request):
        """
        Obtener promociones aplicables para un carrito
        """
        cart_id = request.data.get('cart_id')
        
        if not cart_id:
            return Response({
                'error': 'Se requiere cart_id'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            cart = Cart.objects.get(id=cart_id)
        except Cart.DoesNotExist:
            return Response({
                'error': 'Carrito no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Obtener promociones aplicables
        applicable = PromotionService.get_applicable_promotions_for_cart(cart)
        
        # Formatear respuesta
        response_data = []
        for promo_result in applicable:
            response_data.append({
                'promotion': PromotionSerializer(promo_result['promotion']).data,
                'total_discount': str(promo_result['total_discount']),
                'affected_items': promo_result['affected_items']
            })
        
        return Response(response_data)
    
    @action(detail=True, methods=['post'])
    def apply_to_cart(self, request, pk=None):
        """
        Aplicar promoción a un carrito (manual)
        """
        promotion = self.get_object()
        cart_id = request.data.get('cart_id')
        
        if not cart_id:
            return Response({
                'error': 'Se requiere cart_id'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            cart = Cart.objects.get(id=cart_id)
        except Cart.DoesNotExist:
            return Response({
                'error': 'Carrito no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Aplicar promoción
        result = PromotionService.apply_promotion_to_cart(cart, promotion)
        
        return Response({
            'message': f'Promoción {promotion.name} aplicada',
            'total_discount': str(result['total_discount']),
            'affected_items': result['affected_items']
        })
    
    @action(detail=True, methods=['get'])
    def usages(self, request, pk=None):
        """
        Obtener usos de una promoción (solo para admins)
        """
        promotion = self.get_object()
        
        if not request.user.is_authenticated or not (hasattr(request.user, 'is_admin') and request.user.is_admin):
            return Response({
                'error': 'No tienes permiso para ver esta información'
            }, status=status.HTTP_403_FORBIDDEN)
        
        usages = promotion.usages.all().order_by('-applied_at')
        serializer = PromotionUsageSerializer(usages, many=True)
        return Response(serializer.data)


class PromotionUsageViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para ver usos de promociones (solo lectura, solo admins)
    """
    serializer_class = PromotionUsageSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        """
        Filtrar por promoción u orden si se especifica
        """
        queryset = PromotionUsage.objects.all().select_related('promotion', 'order')
        
        promotion_id = self.request.query_params.get('promotion_id')
        if promotion_id:
            queryset = queryset.filter(promotion_id=promotion_id)
        
        order_id = self.request.query_params.get('order_id')
        if order_id:
            queryset = queryset.filter(order_id=order_id)
        
        return queryset.order_by('-applied_at')
