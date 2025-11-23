from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from .models import Address, ShippingZone, ShippingMethod, Shipment, TrackingEvent
from .serializers import (
    AddressSerializer, ShippingZoneSerializer, ShippingMethodSerializer,
    ShipmentSerializer, ShipmentCreateSerializer, TrackingEventSerializer,
    ShippingCostCalculationSerializer, ShippingCostResponseSerializer
)
from .services import ShippingCalculationService, ShipmentService
from apps.orders.models import Order
import logging

logger = logging.getLogger(__name__)


class AddressViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de direcciones
    """
    serializer_class = AddressSerializer
    permission_classes = [AllowAny]  # Permitir direcciones para guest checkout
    
    def get_queryset(self):
        """
        Filtrar direcciones por usuario autenticado o permitir direcciones sin usuario
        """
        user = self.request.user
        
        if user.is_authenticated:
            return Address.objects.filter(user=user).order_by('-is_default', '-created_at')
        else:
            # Para usuarios no autenticados, retornar queryset vacío
            # pero permitir crear direcciones sin usuario (para guest checkout)
            return Address.objects.none()
    
    def perform_create(self, serializer):
        """
        Asignar usuario automáticamente si está autenticado
        """
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            # Permitir crear dirección sin usuario (guest checkout)
            serializer.save()
    
    @action(detail=False, methods=['get'])
    def default(self, request):
        """
        Obtener dirección default del usuario
        """
        if not request.user.is_authenticated:
            return Response({
                'error': 'Usuario no autenticado'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        default_address = Address.objects.filter(
            user=request.user,
            is_default=True
        ).first()
        
        if not default_address:
            return Response({
                'error': 'No hay dirección default configurada'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = self.get_serializer(default_address)
        return Response(serializer.data)


class ShippingZoneViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para zonas de envío (solo lectura)
    """
    serializer_class = ShippingZoneSerializer
    permission_classes = [AllowAny]
    queryset = ShippingZone.objects.filter(is_active=True)


class ShippingMethodViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para métodos de envío (solo lectura para clientes)
    """
    serializer_class = ShippingMethodSerializer
    permission_classes = [AllowAny]
    queryset = ShippingMethod.objects.filter(is_active=True).select_related('shipping_zone')
    
    @action(detail=False, methods=['post'])
    def calculate_cost(self, request):
        """
        Calcular costo de envío para una dirección y método
        """
        serializer = ShippingCostCalculationSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'error': 'Datos inválidos',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        # Obtener o crear dirección
        if data.get('address_id'):
            address = get_object_or_404(Address, id=data['address_id'])
        elif data.get('address_data'):
            address_data = data['address_data']
            # Crear dirección temporal (no guardar en BD)
            address = Address(**address_data)
        else:
            return Response({
                'error': 'Se requiere address_id o address_data'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Calcular peso
        weight = data.get('weight', 0)
        if data.get('product_ids') and not weight:
            weight = ShippingCalculationService.calculate_product_weight(data['product_ids'])
        
        declared_value = data.get('declared_value', 0)
        
        # Si se especifica método, calcular solo para ese método
        if data.get('shipping_method_id'):
            shipping_method = get_object_or_404(ShippingMethod, id=data['shipping_method_id'])
            try:
                cost = ShippingCalculationService.calculate_shipping_cost(
                    shipping_method, address, weight, declared_value
                )
                
                response_data = {
                    'shipping_method': ShippingMethodSerializer(shipping_method).data,
                    'cost': cost,
                    'estimated_days_min': shipping_method.estimated_days_min,
                    'estimated_days_max': shipping_method.estimated_days_max,
                    'estimated_delivery_range': shipping_method.estimated_delivery_range,
                    'is_available': True
                }
                return Response(response_data)
            except ValidationError as e:
                return Response({
                    'error': str(e)
                }, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Obtener todas las opciones disponibles
            options = ShippingCalculationService.get_shipping_options_for_address(
                address, data.get('product_ids'), weight, declared_value
            )
            
            response_data = [
                {
                    'shipping_method': ShippingMethodSerializer(opt['shipping_method']).data,
                    'cost': opt['cost'],
                    'estimated_days_min': opt['estimated_days_min'],
                    'estimated_days_max': opt['estimated_days_max'],
                    'estimated_delivery_range': opt['estimated_delivery_range'],
                    'is_available': opt['is_available']
                }
                for opt in options
            ]
            
            return Response(response_data)


class ShipmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de envíos
    """
    serializer_class = ShipmentSerializer
    permission_classes = [AllowAny]  # Permitir acceso para tracking público
    
    def get_serializer_class(self):
        """
        Usar diferentes serializers según la acción
        """
        if self.action == 'create':
            return ShipmentCreateSerializer
        return ShipmentSerializer
    
    def get_queryset(self):
        """
        Filtrar envíos según el usuario
        """
        user = self.request.user
        
        if user.is_authenticated:
            if hasattr(user, 'is_admin') and user.is_admin:
                # Admins ven todos los envíos
                return Shipment.objects.all().select_related(
                    'order', 'shipping_method', 'shipping_address'
                ).prefetch_related('tracking_events').order_by('-created_at')
            else:
                # Usuarios normales solo sus envíos
                return Shipment.objects.filter(
                    order__user=user
                ).select_related(
                    'order', 'shipping_method', 'shipping_address'
                ).prefetch_related('tracking_events').order_by('-created_at')
        else:
            # Para tracking público, permitir búsqueda por tracking_number
            tracking_number = self.request.query_params.get('tracking_number')
            if tracking_number:
                return Shipment.objects.filter(
                    tracking_number=tracking_number
                ).select_related(
                    'order', 'shipping_method', 'shipping_address'
                ).prefetch_related('tracking_events')
            return Shipment.objects.none()
    
    def perform_create(self, serializer):
        """
        Crear shipment con validaciones adicionales
        """
        order = serializer.validated_data['order']
        
        # Verificar permisos
        user = self.request.user
        if user.is_authenticated:
            if not (hasattr(user, 'is_admin') and user.is_admin):
                # Usuarios normales solo pueden crear shipments para sus propias órdenes
                if order.user != user:
                    raise ValidationError("No tienes permiso para crear envíos para esta orden")
        
        shipment = serializer.save()
        
        # Intentar crear shipment automáticamente si no se proporcionó método/dirección
        if not shipment.shipping_method or not shipment.shipping_address:
            try:
                ShipmentService.create_shipment_for_order(
                    order,
                    shipping_method=shipment.shipping_method,
                    shipping_address=shipment.shipping_address
                )
            except Exception as e:
                logger.warning(f"Error creando shipment automático: {str(e)}")
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """
        Actualizar estado del envío
        """
        shipment = self.get_object()
        new_status = request.data.get('status')
        notes = request.data.get('notes', '')
        
        if not new_status:
            return Response({
                'error': 'Se requiere el campo status'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validar que el estado es válido
        valid_statuses = [choice[0] for choice in Shipment.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response({
                'error': f'Estado inválido. Estados válidos: {valid_statuses}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            ShipmentService.update_shipment_status(shipment, new_status, notes)
            serializer = self.get_serializer(shipment)
            return Response({
                'message': f'Estado actualizado a {new_status}',
                'shipment': serializer.data
            })
        except Exception as e:
            logger.error(f"Error actualizando estado de shipment: {str(e)}")
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def track(self, request):
        """
        Tracking público de envío por número de seguimiento
        """
        tracking_number = request.query_params.get('tracking_number')
        
        if not tracking_number:
            return Response({
                'error': 'Se requiere el parámetro tracking_number'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            shipment = Shipment.objects.get(tracking_number=tracking_number)
            serializer = self.get_serializer(shipment)
            return Response(serializer.data)
        except Shipment.DoesNotExist:
            return Response({
                'error': 'Envío no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def add_tracking_event(self, request, pk=None):
        """
        Agregar evento de tracking manualmente
        """
        shipment = self.get_object()
        
        event_data = {
            'shipment': shipment.id,
            'event_type': request.data.get('event_type'),
            'description': request.data.get('description', ''),
            'location': request.data.get('location'),
            'facility': request.data.get('facility'),
            'event_datetime': request.data.get('event_datetime'),
            'notes': request.data.get('notes'),
            'carrier_event_code': request.data.get('carrier_event_code'),
            'carrier_raw_data': request.data.get('carrier_raw_data')
        }
        
        event_serializer = TrackingEventSerializer(data=event_data)
        
        if event_serializer.is_valid():
            event_serializer.save()
            return Response(event_serializer.data, status=status.HTTP_201_CREATED)
        
        return Response({
            'error': 'Datos inválidos',
            'details': event_serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class TrackingEventViewSet(viewsets.ModelViewSet):
    """
    ViewSet para eventos de tracking (principalmente para admin)
    """
    serializer_class = TrackingEventSerializer
    permission_classes = [IsAuthenticated]  # Requiere autenticación
    
    def get_queryset(self):
        """
        Filtrar eventos por shipment
        """
        shipment_id = self.request.query_params.get('shipment_id')
        if shipment_id:
            return TrackingEvent.objects.filter(
                shipment_id=shipment_id
            ).order_by('-event_datetime')
        return TrackingEvent.objects.none()
