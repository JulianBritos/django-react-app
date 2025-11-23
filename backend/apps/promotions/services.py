from django.core.exceptions import ValidationError
from django.utils import timezone
from django.db import transaction
from decimal import Decimal
from .models import Coupon, CouponUsage, Promotion, PromotionUsage
from apps.orders.models import Order, OrderItem
from apps.carts.models import Cart, CartItem
from apps.products.models import Product, Category, ProductAttribute
import logging

logger = logging.getLogger(__name__)


class PromotionService:
    """Servicio para gestión de promociones"""
    
    @staticmethod
    def get_active_promotions():
        """
        Obtener promociones activas actualmente
        """
        now = timezone.now()
        return Promotion.objects.filter(
            is_active=True,
            valid_from__lte=now,
            valid_until__gte=now
        )
    
    @staticmethod
    def calculate_bulk_discount(item, promotion_config):
        """
        Calcular descuento por volumen
        """
        min_quantity = promotion_config.get('min_quantity', 0)
        discount_percentage = Decimal(str(promotion_config.get('discount_percentage', 0)))
        
        if item.quantity >= min_quantity:
            item_subtotal = item.subtotal
            discount = item_subtotal * (discount_percentage / Decimal('100'))
            return discount
        return Decimal('0')
    
    @staticmethod
    def calculate_buy_x_get_y_discount(item, promotion_config):
        """
        Calcular descuento para compra X obtén Y
        """
        buy_quantity = promotion_config.get('buy_quantity', 1)
        get_quantity = promotion_config.get('get_quantity', 0)
        discount_percentage = promotion_config.get('discount_percentage', 100)
        
        # Calcular cuántos grupos completos de "buy_quantity" hay
        groups = item.quantity // (buy_quantity + get_quantity)
        
        if groups > 0:
            # Calcular descuento sobre los items "get" (gratis o con descuento)
            free_items = groups * get_quantity
            item_price = item.unit_price if hasattr(item, 'unit_price') else Decimal('0')
            discount = free_items * item_price * (Decimal(str(discount_percentage)) / Decimal('100'))
            return discount
        return Decimal('0')
    
    @staticmethod
    def calculate_category_discount(cart, promotion_config):
        """
        Calcular descuento por categoría
        """
        category_id = promotion_config.get('category_id')
        discount_percentage = Decimal(str(promotion_config.get('discount_percentage', 0)))
        
        if not category_id:
            return Decimal('0')
        
        total_discount = Decimal('0')
        
        for item in cart.items.all():
            if item.product.category_id == category_id:
                item_subtotal = item.subtotal
                discount = item_subtotal * (discount_percentage / Decimal('100'))
                total_discount += discount
        
        return total_discount
    
    @staticmethod
    def apply_promotion_to_cart(cart, promotion):
        """
        Aplicar promoción a un carrito
        """
        promotion_type = promotion.promotion_type
        promotion_config = promotion.promotion_config or {}
        
        total_discount = Decimal('0')
        affected_items = []
        
        if promotion_type == 'bulk_discount':
            # Descuento por volumen en cada item
            for item in cart.items.all():
                discount = PromotionService.calculate_bulk_discount(item, promotion_config)
                if discount > 0:
                    total_discount += discount
                    affected_items.append({
                        'item_id': item.id,
                        'product_id': item.product.id,
                        'discount': float(discount)
                    })
        
        elif promotion_type == 'buy_x_get_y':
            # Compra X obtén Y
            for item in cart.items.all():
                discount = PromotionService.calculate_buy_x_get_y_discount(item, promotion_config)
                if discount > 0:
                    total_discount += discount
                    affected_items.append({
                        'item_id': item.id,
                        'product_id': item.product.id,
                        'discount': float(discount)
                    })
        
        elif promotion_type == 'category_discount':
            # Descuento por categoría
            discount = PromotionService.calculate_category_discount(cart, promotion_config)
            total_discount = discount
            # Agregar todos los items de la categoría
            category_id = promotion_config.get('category_id')
            for item in cart.items.all():
                if item.product.category_id == category_id:
                    affected_items.append({
                        'item_id': item.id,
                        'product_id': item.product.id,
                        'discount': float(item.subtotal * (Decimal(str(promotion_config.get('discount_percentage', 0))) / Decimal('100')))
                    })
        
        elif promotion_type == 'flash_sale':
            # Oferta relámpago - aplicar a productos específicos
            product_ids = promotion_config.get('product_ids', [])
            discount_percentage = Decimal(str(promotion_config.get('discount_percentage', 0)))
            
            for item in cart.items.all():
                if item.product.id in product_ids:
                    item_subtotal = item.subtotal
                    discount = item_subtotal * (discount_percentage / Decimal('100'))
                    total_discount += discount
                    affected_items.append({
                        'item_id': item.id,
                        'product_id': item.product.id,
                        'discount': float(discount)
                    })
        
        return {
            'promotion': promotion,
            'total_discount': total_discount,
            'affected_items': affected_items
        }
    
    @staticmethod
    def get_applicable_promotions_for_cart(cart):
        """
        Obtener promociones aplicables para un carrito
        """
        active_promotions = PromotionService.get_active_promotions()
        applicable = []
        
        for promotion in active_promotions:
            result = PromotionService.apply_promotion_to_cart(cart, promotion)
            if result['total_discount'] > 0:
                applicable.append(result)
        
        return applicable
    
    @staticmethod
    def apply_promotion_to_order(order, promotion):
        """
        Aplicar promoción a una orden y registrar el uso
        """
        with transaction.atomic():
            # Calcular descuento similar al carrito
            promotion_type = promotion.promotion_type
            promotion_config = promotion.promotion_config or {}
            
            total_discount = Decimal('0')
            affected_items = []
            
            if promotion_type == 'bulk_discount':
                for item in order.items.all():
                    discount = PromotionService.calculate_bulk_discount(item, promotion_config)
                    if discount > 0:
                        total_discount += discount
                        affected_items.append({
                            'item_id': item.id,
                            'product_id': item.product.id,
                            'discount': float(discount)
                        })
            
            elif promotion_type == 'category_discount':
                discount = PromotionService.calculate_category_discount_for_order(order, promotion_config)
                total_discount = discount
                category_id = promotion_config.get('category_id')
                for item in order.items.all():
                    if item.product.category_id == category_id:
                        affected_items.append({
                            'item_id': item.id,
                            'product_id': item.product.id
                        })
            
            # Registrar uso de la promoción
            if total_discount > 0:
                PromotionUsage.objects.create(
                    promotion=promotion,
                    order=order,
                    discount_amount=total_discount,
                    items_affected=affected_items
                )
                
                # Actualizar descuento de la orden
                order.discount_amount += total_discount
                order.total_amount = (
                    order.subtotal + order.tax_amount + order.shipping_cost - order.discount_amount
                )
                order.save()
            
            return total_discount
    
    @staticmethod
    def calculate_category_discount_for_order(order, promotion_config):
        """
        Calcular descuento por categoría para una orden
        """
        category_id = promotion_config.get('category_id')
        discount_percentage = Decimal(str(promotion_config.get('discount_percentage', 0)))
        
        if not category_id:
            return Decimal('0')
        
        total_discount = Decimal('0')
        
        for item in order.items.all():
            if item.product.category_id == category_id:
                item_subtotal = item.subtotal
                discount = item_subtotal * (discount_percentage / Decimal('100'))
                total_discount += discount
        
        return total_discount


class CouponServiceIntegration:
    """Servicio adicional para integración con CouponService existente en carts"""
    
    @staticmethod
    def record_coupon_usage(order, coupon, discount_amount):
        """
        Registrar uso de cupón en una orden
        """
        with transaction.atomic():
            CouponUsage.objects.create(
                coupon=coupon,
                user=order.user,
                order=order,
                discount_amount=discount_amount
            )
            
            # Incrementar contador de usos
            coupon.used_count += 1
            coupon.save()

