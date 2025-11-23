from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from apps.orders.models import Order, OrderStatusHistory
from apps.payments.models import Payment
from apps.shipping.models import Shipment
from .services import send_order_notification, send_payment_notification, send_shipment_notification
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Order)
def order_created_notification(sender, instance, created, **kwargs):
    """
    Enviar notificación cuando se crea una nueva orden
    """
    if created:
        try:
            send_order_notification(instance, 'order_created')
            logger.info(f"Notificación de orden creada enviada para orden {instance.order_number}")
        except Exception as e:
            logger.error(f"Error al enviar notificación de orden creada: {str(e)}", exc_info=True)


@receiver(post_save, sender=OrderStatusHistory)
def order_status_change_notification(sender, instance, created, **kwargs):
    """
    Enviar notificación cuando cambia el estado de una orden
    """
    if created:
        order = instance.order
        new_status = instance.new_status
        
        # Mapear estados a eventos de notificación
        status_event_map = {
            'confirmed': 'order_confirmed',
            'shipped': 'order_shipped',
            'delivered': 'order_delivered',
            'cancelled': 'order_cancelled',
        }
        
        trigger_event = status_event_map.get(new_status)
        if trigger_event:
            try:
                send_order_notification(order, trigger_event)
                logger.info(f"Notificación de cambio de estado enviada: {new_status} para orden {order.order_number}")
            except Exception as e:
                logger.error(f"Error al enviar notificación de cambio de estado: {str(e)}", exc_info=True)


@receiver(post_save, sender=Payment)
def payment_notification(sender, instance, created, **kwargs):
    """
    Enviar notificación cuando cambia el estado de un pago
    """
    # Solo enviar notificaciones cuando el pago cambia a un estado final
    if not created and instance.status in ['completed', 'failed']:
        try:
            trigger_event = 'payment_successful' if instance.status == 'completed' else 'payment_failed'
            send_payment_notification(instance, trigger_event)
            logger.info(f"Notificación de pago enviada: {trigger_event} para pago {instance.payment_id}")
        except Exception as e:
            logger.error(f"Error al enviar notificación de pago: {str(e)}", exc_info=True)


@receiver(post_save, sender=Shipment)
def shipment_notification(sender, instance, created, **kwargs):
    """
    Enviar notificación cuando cambia el estado de un envío
    """
    if not created:
        # Mapear estados de envío a eventos
        status_event_map = {
            'shipped': 'order_shipped',
            'in_transit': 'order_shipped',
            'out_for_delivery': 'order_shipped',
            'delivered': 'order_delivered',
        }
        
        trigger_event = status_event_map.get(instance.status)
        if trigger_event:
            try:
                send_shipment_notification(instance, trigger_event)
                logger.info(f"Notificación de envío enviada: {instance.status} para tracking {instance.tracking_number}")
            except Exception as e:
                logger.error(f"Error al enviar notificación de envío: {str(e)}", exc_info=True)

