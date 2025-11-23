from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.utils import timezone
from datetime import timedelta
from .services import AnalyticsService


class AnalyticsViewSet(viewsets.ViewSet):
    """
    ViewSet para analíticas y reportes (solo para admins)
    """
    permission_classes = [IsAdminUser]
    
    @action(detail=False, methods=['get'])
    def dashboard_summary(self, request):
        """
        Resumen general del dashboard
        """
        summary = AnalyticsService.get_dashboard_summary()
        return Response(summary)
    
    @action(detail=False, methods=['get'])
    def sales_report(self, request):
        """
        Reporte de ventas
        """
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        group_by = request.query_params.get('group_by', 'day')
        
        if start_date:
            start_date = timezone.datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        if end_date:
            end_date = timezone.datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        
        report = AnalyticsService.get_sales_report(start_date, end_date, group_by)
        return Response(report)
    
    @action(detail=False, methods=['get'])
    def top_products(self, request):
        """
        Productos más vendidos
        """
        limit = int(request.query_params.get('limit', 10))
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if start_date:
            start_date = timezone.datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        if end_date:
            end_date = timezone.datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        
        top_products = AnalyticsService.get_top_selling_products(limit, start_date, end_date)
        return Response({
            'products': top_products,
            'limit': limit
        })
    
    @action(detail=False, methods=['get'])
    def category_sales(self, request):
        """
        Ventas por categoría
        """
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if start_date:
            start_date = timezone.datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        if end_date:
            end_date = timezone.datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        
        category_sales = AnalyticsService.get_category_sales(start_date, end_date)
        return Response({
            'categories': category_sales
        })
    
    @action(detail=False, methods=['get'])
    def customer_analytics(self, request):
        """
        Analíticas de clientes
        """
        analytics = AnalyticsService.get_customer_analytics()
        return Response(analytics)
    
    @action(detail=False, methods=['get'])
    def inventory_report(self, request):
        """
        Reporte de inventario
        """
        report = AnalyticsService.get_inventory_report()
        return Response(report)
    
    @action(detail=False, methods=['get'])
    def conversion_metrics(self, request):
        """
        Métricas de conversión
        """
        metrics = AnalyticsService.get_conversion_metrics()
        return Response(metrics)
    
    @action(detail=False, methods=['get'])
    def payment_analytics(self, request):
        """
        Analíticas de pagos
        """
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if start_date:
            start_date = timezone.datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        if end_date:
            end_date = timezone.datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        
        analytics = AnalyticsService.get_payment_analytics(start_date, end_date)
        return Response(analytics)
    
    @action(detail=False, methods=['get'])
    def shipping_analytics(self, request):
        """
        Analíticas de envíos
        """
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if start_date:
            start_date = timezone.datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        if end_date:
            end_date = timezone.datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        
        analytics = AnalyticsService.get_shipping_analytics(start_date, end_date)
        return Response(analytics)
