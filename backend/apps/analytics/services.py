from django.db.models import Sum, Count, Avg, Q, F
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from apps.orders.models import Order, OrderItem
from apps.products.models import Product, ProductAttribute
from apps.carts.models import Cart, CartItem
from apps.payments.models import Payment
from apps.users.models import CustomUserModel
from apps.shipping.models import Shipment
import logging

logger = logging.getLogger(__name__)


class AnalyticsService:
    """Servicio para cálculos de analíticas y reportes"""
    
    @staticmethod
    def get_sales_report(start_date=None, end_date=None, group_by='day'):
        """
        Reporte de ventas por período
        """
        if not start_date:
            start_date = timezone.now() - timedelta(days=30)
        if not end_date:
            end_date = timezone.now()
        
        orders = Order.objects.filter(
            created_at__gte=start_date,
            created_at__lte=end_date,
            status__in=['confirmed', 'processing', 'shipped', 'delivered']
        )
        
        total_sales = orders.aggregate(total=Sum('total_amount'))['total'] or Decimal('0')
        total_orders = orders.count()
        average_order_value = total_sales / total_orders if total_orders > 0 else Decimal('0')
        
        # Agrupar por día/semana/mes según group_by
        sales_by_period = []
        
        if group_by == 'day':
            current_date = start_date.date()
            while current_date <= end_date.date():
                day_orders = orders.filter(created_at__date=current_date)
                day_sales = day_orders.aggregate(total=Sum('total_amount'))['total'] or Decimal('0')
                sales_by_period.append({
                    'date': current_date.isoformat(),
                    'sales': float(day_sales),
                    'orders': day_orders.count()
                })
                current_date += timedelta(days=1)
        
        return {
            'period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            },
            'total_sales': float(total_sales),
            'total_orders': total_orders,
            'average_order_value': float(average_order_value),
            'sales_by_period': sales_by_period
        }
    
    @staticmethod
    def get_top_selling_products(limit=10, start_date=None, end_date=None):
        """
        Obtener productos más vendidos
        """
        if not start_date:
            start_date = timezone.now() - timedelta(days=30)
        if not end_date:
            end_date = timezone.now()
        
        top_products = OrderItem.objects.filter(
            order__created_at__gte=start_date,
            order__created_at__lte=end_date,
            order__status__in=['confirmed', 'processing', 'shipped', 'delivered']
        ).values(
            'product_id',
            'product_name'
        ).annotate(
            total_quantity=Sum('quantity'),
            total_revenue=Sum(F('unit_price') * F('quantity'))
        ).order_by('-total_quantity')[:limit]
        
        products_data = []
        for item in top_products:
            try:
                product = Product.objects.get(id=item['product_id'])
                products_data.append({
                    'product_id': item['product_id'],
                    'product_name': item['product_name'] or product.name,
                    'total_quantity': item['total_quantity'],
                    'total_revenue': float(item['total_revenue'] or 0),
                    'product': {
                        'id': product.id,
                        'name': product.name,
                        'brand': product.brand,
                        'category': product.category.name if product.category else None
                    }
                })
            except Product.DoesNotExist:
                continue
        
        return products_data
    
    @staticmethod
    def get_category_sales(start_date=None, end_date=None):
        """
        Reporte de ventas por categoría
        """
        if not start_date:
            start_date = timezone.now() - timedelta(days=30)
        if not end_date:
            end_date = timezone.now()
        
        category_sales = OrderItem.objects.filter(
            order__created_at__gte=start_date,
            order__created_at__lte=end_date,
            order__status__in=['confirmed', 'processing', 'shipped', 'delivered']
        ).values(
            'product__category__id',
            'product__category__name'
        ).annotate(
            total_quantity=Sum('quantity'),
            total_revenue=Sum(F('unit_price') * F('quantity')),
            order_count=Count('order', distinct=True)
        ).order_by('-total_revenue')
        
        return [
            {
                'category_id': item['product__category__id'],
                'category_name': item['product__category__name'],
                'total_quantity': item['total_quantity'],
                'total_revenue': float(item['total_revenue'] or 0),
                'order_count': item['order_count']
            }
            for item in category_sales
            if item['product__category__id']
        ]
    
    @staticmethod
    def get_customer_analytics():
        """
        Analíticas de clientes
        """
        total_customers = CustomUserModel.objects.filter(role='cliente').count()
        active_customers = Order.objects.filter(
            created_at__gte=timezone.now() - timedelta(days=30),
            user__isnull=False
        ).values('user').distinct().count()
        
        # Clientes más activos
        top_customers = Order.objects.filter(
            user__isnull=False,
            status__in=['confirmed', 'processing', 'shipped', 'delivered']
        ).values(
            'user__id',
            'user__email',
            'user__first_name',
            'user__last_name'
        ).annotate(
            total_orders=Count('id'),
            total_spent=Sum('total_amount'),
            last_order_date=Max('created_at')
        ).order_by('-total_spent')[:10]
        
        return {
            'total_customers': total_customers,
            'active_customers_30d': active_customers,
            'top_customers': [
                {
                    'user_id': item['user__id'],
                    'email': item['user__email'],
                    'name': f"{item['user__first_name']} {item['user__last_name']}".strip(),
                    'total_orders': item['total_orders'],
                    'total_spent': float(item['total_spent'] or 0),
                    'last_order_date': item['last_order_date'].isoformat() if item['last_order_date'] else None
                }
                for item in top_customers
            ]
        }
    
    @staticmethod
    def get_inventory_report():
        """
        Reporte de inventario
        """
        # Productos con stock bajo
        low_stock_products = ProductAttribute.objects.filter(
            stock__lte=F('stock_alert'),
            stock__gt=0
        ).select_related('product').order_by('stock')
        
        # Productos agotados
        out_of_stock_products = ProductAttribute.objects.filter(
            stock=0
        ).select_related('product').distinct('product')
        
        # Productos con más stock
        high_stock_products = ProductAttribute.objects.filter(
            stock__gt=0
        ).select_related('product').order_by('-stock')[:10]
        
        # Valor total del inventario
        inventory_value = ProductAttribute.objects.aggregate(
            total_value=Sum(F('stock') * F('selling_price'))
        )['total_value'] or Decimal('0')
        
        return {
            'low_stock_products': [
                {
                    'product_id': attr.product.id,
                    'product_name': attr.product.name,
                    'sku': attr.sku,
                    'stock': attr.stock,
                    'stock_alert': attr.stock_alert,
                    'selling_price': float(attr.selling_price or 0)
                }
                for attr in low_stock_products[:20]
            ],
            'out_of_stock_count': out_of_stock_products.count(),
            'out_of_stock_products': [
                {
                    'product_id': attr.product.id,
                    'product_name': attr.product.name,
                    'sku': attr.sku
                }
                for attr in out_of_stock_products[:20]
            ],
            'high_stock_products': [
                {
                    'product_id': attr.product.id,
                    'product_name': attr.product.name,
                    'sku': attr.sku,
                    'stock': attr.stock
                }
                for attr in high_stock_products
            ],
            'total_inventory_value': float(inventory_value)
        }
    
    @staticmethod
    def get_conversion_metrics():
        """
        Métricas de conversión
        """
        # Carritos abandonados
        abandoned_carts = Cart.objects.filter(
            status='abandoned',
            created_at__gte=timezone.now() - timedelta(days=30)
        ).count()
        
        # Carritos convertidos
        converted_carts = Cart.objects.filter(
            status='converted',
            created_at__gte=timezone.now() - timedelta(days=30)
        ).count()
        
        # Total de carritos activos
        total_carts = Cart.objects.filter(
            created_at__gte=timezone.now() - timedelta(days=30),
            status__in=['active', 'abandoned', 'converted']
        ).count()
        
        # Tasa de conversión
        conversion_rate = (converted_carts / total_carts * 100) if total_carts > 0 else 0
        
        # Valor promedio de carritos abandonados
        abandoned_value = Cart.objects.filter(
            status='abandoned',
            created_at__gte=timezone.now() - timedelta(days=30)
        ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0')
        
        average_abandoned_value = abandoned_value / abandoned_carts if abandoned_carts > 0 else Decimal('0')
        
        return {
            'total_carts_30d': total_carts,
            'converted_carts_30d': converted_carts,
            'abandoned_carts_30d': abandoned_carts,
            'conversion_rate': round(conversion_rate, 2),
            'total_abandoned_value': float(abandoned_value),
            'average_abandoned_value': float(average_abandoned_value)
        }
    
    @staticmethod
    def get_payment_analytics(start_date=None, end_date=None):
        """
        Analíticas de pagos
        """
        if not start_date:
            start_date = timezone.now() - timedelta(days=30)
        if not end_date:
            end_date = timezone.now()
        
        payments = Payment.objects.filter(
            created_at__gte=start_date,
            created_at__lte=end_date
        )
        
        # Pagos exitosos
        successful_payments = payments.filter(status='completed')
        failed_payments = payments.filter(status='failed')
        
        total_revenue = successful_payments.aggregate(total=Sum('amount'))['total'] or Decimal('0')
        
        # Métodos de pago más usados
        payment_methods = payments.values(
            'payment_method__name',
            'payment_method__code'
        ).annotate(
            count=Count('id'),
            total_amount=Sum('amount')
        ).order_by('-count')
        
        return {
            'total_revenue': float(total_revenue),
            'successful_payments': successful_payments.count(),
            'failed_payments': failed_payments.count(),
            'success_rate': (successful_payments.count() / payments.count() * 100) if payments.count() > 0 else 0,
            'payment_methods': [
                {
                    'method': item['payment_method__name'],
                    'code': item['payment_method__code'],
                    'count': item['count'],
                    'total_amount': float(item['total_amount'] or 0)
                }
                for item in payment_methods
            ]
        }
    
    @staticmethod
    def get_shipping_analytics(start_date=None, end_date=None):
        """
        Analíticas de envíos
        """
        if not start_date:
            start_date = timezone.now() - timedelta(days=30)
        if not end_date:
            end_date = timezone.now()
        
        shipments = Shipment.objects.filter(
            created_at__gte=start_date,
            created_at__lte=end_date
        )
        
        # Estadísticas por estado
        by_status = shipments.values('status').annotate(
            count=Count('id')
        )
        
        # Tiempo promedio de entrega
        delivered_shipments = shipments.filter(status='delivered')
        avg_delivery_days = delivered_shipments.annotate(
            days=(F('actual_delivery_date') - F('shipped_at'))
        ).aggregate(avg_days=Avg('days'))['avg_days']
        
        # Métodos de envío más usados
        by_method = shipments.values(
            'shipping_method__name'
        ).annotate(
            count=Count('id')
        ).order_by('-count')
        
        return {
            'total_shipments': shipments.count(),
            'by_status': {item['status']: item['count'] for item in by_status},
            'delivered_count': delivered_shipments.count(),
            'average_delivery_days': avg_delivery_days.days if avg_delivery_days else None,
            'by_method': [
                {
                    'method': item['shipping_method__name'],
                    'count': item['count']
                }
                for item in by_method
                if item['shipping_method__name']
            ]
        }
    
    @staticmethod
    def get_dashboard_summary():
        """
        Resumen general del dashboard
        """
        today = timezone.now().date()
        start_of_month = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Ventas del mes
        monthly_sales = Order.objects.filter(
            created_at__gte=start_of_month,
            status__in=['confirmed', 'processing', 'shipped', 'delivered']
        ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0')
        
        # Órdenes del mes
        monthly_orders = Order.objects.filter(
            created_at__gte=start_of_month
        ).count()
        
        # Productos activos
        active_products = Product.objects.filter(status='ACTIVE').count()
        
        # Clientes registrados
        total_customers = CustomUserModel.objects.filter(role='cliente').count()
        
        # Carritos activos
        active_carts = Cart.objects.filter(status='active').count()
        
        # Inventario bajo
        low_stock_count = ProductAttribute.objects.filter(
            stock__lte=F('stock_alert'),
            stock__gt=0
        ).distinct('product').count()
        
        return {
            'monthly_sales': float(monthly_sales),
            'monthly_orders': monthly_orders,
            'active_products': active_products,
            'total_customers': total_customers,
            'active_carts': active_carts,
            'low_stock_products': low_stock_count,
            'date': today.isoformat()
        }

