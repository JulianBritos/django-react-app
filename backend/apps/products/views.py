from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django.core.exceptions import ValidationError
from django.db.models import Q, Min, Max, Count, Avg
from django.utils import timezone
from .models import (
    Product, Category, ProductImages, Attribute, AttributeOption, 
    ProductAttribute, ProductAttributeOptionLink, ProductReview,
    ReviewHelpful, RelatedProduct, StockMovement
)
from .serializer import (
    CategorySerializer, AttributeSerializer, AttributeOptionSerializer,
    ProductAttributeSerializer, ProductWithAttributesSerializer,
    ProductAttributeOptionLinkSerializer, ProductReviewSerializer,
    ProductReviewCreateSerializer, ReviewHelpfulSerializer,
    RelatedProductSerializer, StockMovementSerializer
)
from .services import InventoryService, StockAlertService


import environ
import logging

env = environ.Env()
environ.Env.read_env()
logger = logging.getLogger(__name__)

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductWithAttributesSerializer

    def get_queryset(self):
        """
        Filtrar y buscar productos con parámetros avanzados
        """
        queryset = Product.objects.all().select_related('category').prefetch_related(
            'product_attributes', 'reviews'
        )
        
        # Filtrar por estado (solo activos por defecto)
        status_filter = self.request.query_params.get('status', 'ACTIVE')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Búsqueda por texto (nombre, descripción, SKU, marca)
        search_query = self.request.query_params.get('search')
        if search_query:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(name__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(brand__icontains=search_query) |
                Q(product_attributes__sku__icontains=search_query)
            ).distinct()
        
        # Filtro por categoría
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        # Filtro por marca
        brand = self.request.query_params.get('brand')
        if brand:
            queryset = queryset.filter(brand__iexact=brand)
        
        # Filtro por rango de precio
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price or max_price:
            from django.db.models import Min, Max
            # Obtener precios mínimos y máximos de los atributos
            if min_price:
                queryset = queryset.annotate(
                    min_price=Min('product_attributes__selling_price')
                ).filter(min_price__gte=float(min_price))
            
            if max_price:
                queryset = queryset.annotate(
                    max_price=Max('product_attributes__selling_price')
                ).filter(max_price__lte=float(max_price))
        
        # Filtro por disponibilidad (en stock)
        in_stock = self.request.query_params.get('in_stock')
        if in_stock and in_stock.lower() == 'true':
            queryset = queryset.filter(product_attributes__stock__gt=0).distinct()
        
        # Filtro por ofertas
        on_sale = self.request.query_params.get('on_sale')
        if on_sale and on_sale.lower() == 'true':
            from django.utils import timezone
            queryset = queryset.filter(
                product_attributes__offer_price__isnull=False,
                product_attributes__offer_start_date__lte=timezone.now(),
                product_attributes__offer_end_date__gte=timezone.now()
            ).distinct()
        
        # Ordenamiento
        ordering = self.request.query_params.get('ordering', '-created_at')
        valid_orderings = [
            'name', '-name',
            'created_at', '-created_at',
            'price_asc', 'price_desc',
            'rating', '-rating',
            'popularity', '-popularity'
        ]
        
        if ordering in valid_orderings:
            if ordering == 'price_asc':
                queryset = queryset.annotate(
                    min_price=Min('product_attributes__selling_price')
                ).order_by('min_price')
            elif ordering == 'price_desc':
                queryset = queryset.annotate(
                    max_price=Max('product_attributes__selling_price')
                ).order_by('-max_price')
            elif ordering in ['rating', '-rating']:
                queryset = queryset.order_by(ordering)
            elif ordering in ['popularity', '-popularity']:
                # Popularidad basada en número de reseñas
                from django.db.models import Count, Q
                queryset = queryset.annotate(
                    review_count=Count('reviews', filter=Q(reviews__is_approved=True))
                ).order_by(ordering.replace('popularity', 'review_count'))
            else:
                queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('-created_at')
        
        return queryset

    def create(self, request, *args, **kwargs):
       
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            product = serializer.save()  

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print("Errores de validación:", serializer.errors)  # Ver errores en consola
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Endpoint de búsqueda avanzada con múltiples parámetros
        """
        queryset = self.get_queryset()
        
        # Paginación básica
        from rest_framework.pagination import PageNumberPagination
        paginator = PageNumberPagination()
        paginator.page_size = request.query_params.get('page_size', 20)
        page = paginator.paginate_queryset(queryset, request)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def brands(self, request):
        """
        Obtener lista de marcas disponibles
        """
        brands = Product.objects.filter(
            brand__isnull=False,
            status='ACTIVE'
        ).values_list('brand', flat=True).distinct().order_by('brand')
        
        return Response({
            'brands': list(brands)
        })
    
    @action(detail=False, methods=['get'])
    def price_range(self, request):
        """
        Obtener rango de precios disponible
        """
        from django.db.models import Min, Max
        
        price_stats = ProductAttribute.objects.filter(
            product__status='ACTIVE',
            selling_price__isnull=False
        ).aggregate(
            min_price=Min('selling_price'),
            max_price=Max('selling_price')
        )
        
        return Response({
            'min_price': price_stats['min_price'] or 0,
            'max_price': price_stats['max_price'] or 0
        })

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class AttributeViewSet(viewsets.ModelViewSet):
    queryset = Attribute.objects.all().prefetch_related('attributeoption_set')
    serializer_class = AttributeSerializer

class AttributeOptionViewSet(viewsets.ModelViewSet):
    queryset = AttributeOption.objects.all()
    serializer_class = AttributeOptionSerializer

    def get_queryset(self):
        queryset = AttributeOption.objects.all()
        attribute_id = self.request.query_params.get('attribute')
        if attribute_id:
            queryset = queryset.filter(attribute_id=attribute_id)
        return queryset

class ProductAttributeViewSet(viewsets.ModelViewSet):
    queryset = ProductAttribute.objects.all()
    serializer_class = ProductAttributeSerializer
    def create(self, request, *args, **kwargs):
        print("Archivos recibidos:", request.FILES)
        # Unir request.data y request.FILES para manejar imágenes correctamente
        data = request.data.copy()
        data.setlist('uploaded_images', request.FILES.getlist('uploaded_images'))

        serializer = self.get_serializer(data=data)

        if serializer.is_valid():
            productattribute = serializer.save()  

            # Guardar imágenes en ProductImages
            uploaded_images = request.FILES.getlist('uploaded_images')
            for image in uploaded_images:
                ProductImages.objects.create(productattribute=productattribute, image=image)

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print("Errores de validación:", serializer.errors)  # Ver errores en consola
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProductAttributeOptionLinkViewSet(viewsets.ModelViewSet):
    queryset = ProductAttributeOptionLink.objects.all()
    serializer_class = ProductAttributeOptionLinkSerializer

    def create(self, request, *args, **kwargs):
        print("Datos recibidos en ProductAttributeOptionLinkViewSet:", request.data)
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            product_attribute_link = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print("Errores de validación:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProductReviewViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de reseñas de productos
    """
    
    def get_serializer_class(self):
        """Usar diferentes serializers según la acción"""
        if self.action == 'create':
            return ProductReviewCreateSerializer
        return ProductReviewSerializer
    
    def get_permissions(self):
        """Solo usuarios autenticados pueden crear reseñas"""
        if self.action == 'create':
            return [IsAuthenticated()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsAdminUser()]  # Solo admins pueden modificar/eliminar
        return [AllowAny()]
    
    def get_queryset(self):
        """Filtrar reseñas según permisos"""
        product_id = self.request.query_params.get('product_id')
        
        queryset = ProductReview.objects.all().select_related('user', 'product')
        
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        
        # Por defecto, solo mostrar reseñas aprobadas para clientes
        user = self.request.user
        if not (user.is_authenticated and hasattr(user, 'is_admin') and user.is_admin):
            queryset = queryset.filter(is_approved=True)
        
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Aprobar una reseña (solo admin)"""
        review = self.get_object()
        
        if not request.user.is_authenticated or not (hasattr(request.user, 'is_admin') and request.user.is_admin):
            return Response({
                'error': 'No tienes permiso para aprobar reseñas'
            }, status=status.HTTP_403_FORBIDDEN)
        
        review.is_approved = True
        review.save()
        
        # Actualizar rating del producto
        ProductReview.update_product_rating(review.product)
        
        serializer = self.get_serializer(review)
        return Response({
            'message': 'Reseña aprobada exitosamente',
            'review': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Rechazar una reseña (solo admin)"""
        review = self.get_object()
        
        if not request.user.is_authenticated or not (hasattr(request.user, 'is_admin') and request.user.is_admin):
            return Response({
                'error': 'No tienes permiso para rechazar reseñas'
            }, status=status.HTTP_403_FORBIDDEN)
        
        review.is_approved = False
        review.save()
        
        # Actualizar rating del producto
        ProductReview.update_product_rating(review.product)
        
        serializer = self.get_serializer(review)
        return Response({
            'message': 'Reseña rechazada',
            'review': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def mark_helpful(self, request, pk=None):
        """Marcar reseña como útil o no útil"""
        review = self.get_object()
        is_helpful = request.data.get('is_helpful', True)
        
        if not request.user.is_authenticated:
            return Response({
                'error': 'Debes estar autenticado para marcar reseñas como útiles'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        serializer = ReviewHelpfulSerializer(
            data={'review': review.id, 'is_helpful': is_helpful},
            context={'request': request}
        )
        
        if serializer.is_valid():
            vote = serializer.save()
            return Response({
                'message': 'Voto registrado exitosamente',
                'vote': serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'error': 'Error al registrar voto',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class RelatedProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet para productos relacionados
    """
    serializer_class = RelatedProductSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        """Filtrar por producto si se especifica"""
        product_id = self.request.query_params.get('product_id')
        relation_type = self.request.query_params.get('relation_type')
        
        queryset = RelatedProduct.objects.all().select_related('product', 'related_product')
        
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        
        if relation_type:
            queryset = queryset.filter(relation_type=relation_type)
        
        return queryset.order_by('display_order')
    
    @action(detail=False, methods=['get'])
    def suggestions(self, request):
        """
        Obtener sugerencias de productos relacionados para un producto
        """
        product_id = request.query_params.get('product_id')
        
        if not product_id:
            return Response({
                'error': 'Se requiere product_id'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({
                'error': 'Producto no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Obtener productos relacionados configurados manualmente
        related = RelatedProduct.objects.filter(
            product=product
        ).select_related('related_product').order_by('display_order')
        
        # Si no hay productos relacionados configurados, sugerir por categoría/marca
        if not related.exists():
            # Productos de la misma categoría
            same_category = Product.objects.filter(
                category=product.category,
                status='ACTIVE'
            ).exclude(id=product.id)[:5]
            
            # Productos de la misma marca
            same_brand = Product.objects.filter(
                brand=product.brand,
                status='ACTIVE'
            ).exclude(id=product.id).exclude(category=product.category)[:5]
            
            suggestions = list(same_category) + list(same_brand)
        else:
            suggestions = [r.related_product for r in related]
        
        serializer = ProductWithAttributesSerializer(suggestions, many=True)
        return Response({
            'product_id': product_id,
            'related_products': serializer.data
        })


class StockMovementViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para historial de movimientos de stock (solo lectura)
    """
    queryset = StockMovement.objects.all()
    serializer_class = StockMovementSerializer
    permission_classes = [IsAdminUser]  # Solo admins
    
    def get_queryset(self):
        """Filtrar por producto o atributo si se especifica"""
        product_id = self.request.query_params.get('product_id')
        product_attribute_id = self.request.query_params.get('product_attribute_id')
        movement_type = self.request.query_params.get('movement_type')
        
        queryset = StockMovement.objects.all().select_related(
            'product', 'product_attribute', 'order', 'user'
        )
        
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        
        if product_attribute_id:
            queryset = queryset.filter(product_attribute_id=product_attribute_id)
        
        if movement_type:
            queryset = queryset.filter(movement_type=movement_type)
        
        return queryset.order_by('-created_at')


class InventoryManagementViewSet(viewsets.ViewSet):
    """
    ViewSet para gestión de inventario (ajustes manuales)
    """
    permission_classes = [IsAdminUser]
    
    @action(detail=False, methods=['post'])
    def adjust_stock(self, request):
        """
        Ajustar stock manualmente
        """
        product_attribute_id = request.data.get('product_attribute_id')
        new_quantity = request.data.get('new_quantity')
        notes = request.data.get('notes')
        
        if not product_attribute_id or new_quantity is None:
            return Response({
                'error': 'Se requiere product_attribute_id y new_quantity'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            product_attribute = ProductAttribute.objects.get(id=product_attribute_id)
        except ProductAttribute.DoesNotExist:
            return Response({
                'error': 'ProductAttribute no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        
        try:
            movement = InventoryService.adjust_stock(
                product_attribute=product_attribute,
                new_quantity=int(new_quantity),
                user=request.user,
                notes=notes
            )
            
            if movement:
                serializer = StockMovementSerializer(movement)
                return Response({
                    'message': 'Stock ajustado exitosamente',
                    'movement': serializer.data
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'message': 'No hay cambios en el stock'
                })
        except ValidationError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def low_stock_alerts(self, request):
        """
        Obtener alertas de stock bajo
        """
        alerts = InventoryService.check_low_stock_alerts()
        return Response({
            'alerts': alerts,
            'count': len(alerts)
        })
    
    @action(detail=False, methods=['post'])
    def check_alerts_and_notify(self, request):
        """
        Verificar alertas de stock bajo y enviar notificaciones
        """
        alerts = StockAlertService.check_and_notify_low_stock()
        return Response({
            'message': f'Verificadas {len(alerts)} alertas de stock bajo',
            'alerts': alerts
        })
