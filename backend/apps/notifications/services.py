from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone
from .models import NotificationTemplate, NotificationQueue, NotificationLog, UserNotificationPreference
import logging

logger = logging.getLogger(__name__)


class NotificationService:
    """Servicio para gestión y envío de notificaciones"""
    
    @staticmethod
    def get_template(trigger_event, template_type='email'):
        """
        Obtener template activo para un evento específico
        """
        try:
            template = NotificationTemplate.objects.get(
                trigger_event=trigger_event,
                template_type=template_type,
                is_active=True
            )
            return template
        except NotificationTemplate.DoesNotExist:
            logger.warning(f"No se encontró template para {trigger_event} ({template_type})")
            return None
        except NotificationTemplate.MultipleObjectsReturned:
            # Si hay múltiples, tomar el primero
            template = NotificationTemplate.objects.filter(
                trigger_event=trigger_event,
                template_type=template_type,
                is_active=True
            ).first()
            logger.warning(f"Múltiples templates para {trigger_event}, usando el primero")
            return template
    
    @staticmethod
    def should_send_notification(user, trigger_event):
        """
        Verificar si se debe enviar notificación según preferencias del usuario
        """
        if not user or not user.is_authenticated:
            return True  # Para usuarios no autenticados, siempre enviar
        
        try:
            preferences = user.notification_preferences
        except UserNotificationPreference.DoesNotExist:
            # Si no tiene preferencias, usar defaults
            return True
        
        # Verificar si el canal de email está habilitado
        if not preferences.email_enabled:
            return False
        
        # Verificar preferencias por tipo de evento
        if trigger_event.startswith('order_'):
            return preferences.order_notifications
        elif trigger_event.startswith('payment_'):
            return preferences.payment_notifications
        elif trigger_event.startswith('cart_'):
            return preferences.marketing_notifications
        elif trigger_event == 'low_stock':
            return True  # Siempre enviar alertas de stock
        
        return True
    
    @staticmethod
    def render_template_content(template, context):
        """
        Renderizar contenido del template con contexto
        """
        subject = template.subject or ''
        content_html = template.content_html or ''
        content_text = template.content_text or ''
        
        # Reemplazar variables básicas en el contenido
        for key, value in context.items():
            placeholder = f'{{{{{key}}}}}'
            subject = subject.replace(placeholder, str(value))
            content_html = content_html.replace(placeholder, str(value))
            content_text = content_text.replace(placeholder, str(value))
        
        return {
            'subject': subject,
            'content_html': content_html,
            'content_text': content_text
        }
    
    @staticmethod
    def queue_notification(trigger_event, recipient_email, recipient_name=None, 
                          recipient_user=None, context=None, scheduled_for=None):
        """
        Agregar notificación a la cola para envío
        """
        if context is None:
            context = {}
        
        template = NotificationService.get_template(trigger_event, 'email')
        if not template:
            logger.error(f"No se puede enviar notificación {trigger_event}: template no encontrado")
            return None
        
        # Verificar preferencias si hay usuario
        if recipient_user and not NotificationService.should_send_notification(recipient_user, trigger_event):
            logger.info(f"Notificación {trigger_event} omitida por preferencias del usuario {recipient_user.email}")
            return None
        
        # Renderizar contenido
        rendered = NotificationService.render_template_content(template, context)
        
        # Crear notificación en cola
        notification = NotificationQueue.objects.create(
            template=template,
            recipient_user=recipient_user,
            recipient_email=recipient_email,
            recipient_name=recipient_name or (recipient_user.get_full_name() if recipient_user else ''),
            rendered_subject=rendered['subject'],
            rendered_content_html=rendered['content_html'],
            rendered_content_text=rendered['content_text'],
            scheduled_for=scheduled_for or timezone.now(),
            status='pending'
        )
        
        logger.info(f"Notificación {trigger_event} agregada a la cola para {recipient_email}")
        return notification
    
    @staticmethod
    def send_notification(notification):
        """
        Enviar una notificación de la cola
        """
        if notification.status != 'pending':
            logger.warning(f"Intentando enviar notificación {notification.id} con estado {notification.status}")
            return False
        
        notification.status = 'processing'
        notification.save()
        
        try:
            # Obtener email del destinatario
            recipient_email = notification.recipient_email
            if notification.recipient_user:
                recipient_email = notification.recipient_user.email
            
            if not recipient_email:
                raise ValueError("No hay email de destinatario")
            
            # Enviar email
            send_mail(
                subject=notification.rendered_subject or 'Notificación',
                message=notification.rendered_content_text,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient_email],
                html_message=notification.rendered_content_html if notification.rendered_content_html else None,
                fail_silently=False,
            )
            
            # Marcar como enviado
            notification.status = 'sent'
            notification.save()
            
            # Crear log
            NotificationLog.objects.create(
                notification_queue=notification,
                attempt_number=1,
                status='sent',
                provider_used='SMTP',
                notes='Email enviado exitosamente'
            )
            
            logger.info(f"Notificación {notification.id} enviada exitosamente a {recipient_email}")
            return True
            
        except Exception as e:
            # Marcar como fallido
            notification.status = 'failed'
            notification.save()
            
            # Crear log de error
            NotificationLog.objects.create(
                notification_queue=notification,
                attempt_number=1,
                status='failed',
                provider_used='SMTP',
                error_details=str(e),
                notes=f'Error al enviar notificación: {str(e)}'
            )
            
            logger.error(f"Error al enviar notificación {notification.id}: {str(e)}", exc_info=True)
            return False
    
    @staticmethod
    def send_immediate_notification(trigger_event, recipient_email, recipient_name=None,
                                   recipient_user=None, context=None):
        """
        Enviar notificación inmediatamente (sin cola)
        """
        notification = NotificationService.queue_notification(
            trigger_event=trigger_event,
            recipient_email=recipient_email,
            recipient_name=recipient_name,
            recipient_user=recipient_user,
            context=context
        )
        
        if notification:
            return NotificationService.send_notification(notification)
        return False
    
    @staticmethod
    def process_pending_notifications(limit=100):
        """
        Procesar notificaciones pendientes de la cola
        """
        pending = NotificationQueue.objects.filter(
            status='pending',
            scheduled_for__lte=timezone.now()
        )[:limit]
        
        sent_count = 0
        failed_count = 0
        
        for notification in pending:
            if NotificationService.send_notification(notification):
                sent_count += 1
            else:
                failed_count += 1
        
        logger.info(f"Procesadas {len(pending)} notificaciones: {sent_count} enviadas, {failed_count} fallidas")
        return {'sent': sent_count, 'failed': failed_count, 'total': len(pending)}


# Funciones de conveniencia para eventos específicos

def send_order_notification(order, trigger_event):
    """
    Enviar notificación relacionada con una orden
    """
    recipient_email = order.customer_email
    recipient_name = order.customer_name
    recipient_user = order.user
    
    context = {
        'order_number': order.order_number,
        'order_status': order.get_status_display(),
        'total_amount': order.total_amount,
        'customer_name': recipient_name,
        'items_count': order.items.count(),
    }
    
    NotificationService.send_immediate_notification(
        trigger_event=trigger_event,
        recipient_email=recipient_email,
        recipient_name=recipient_name,
        recipient_user=recipient_user,
        context=context
    )


def send_payment_notification(payment, trigger_event):
    """
    Enviar notificación relacionada con un pago
    """
    order = payment.order
    if not order:
        logger.warning(f"Pago {payment.payment_id} no tiene orden asociada")
        return
    
    recipient_email = order.customer_email
    recipient_name = order.customer_name
    recipient_user = order.user
    
    context = {
        'payment_id': payment.payment_id,
        'payment_status': payment.get_status_display(),
        'amount': payment.amount,
        'order_number': order.order_number if order else 'N/A',
        'customer_name': recipient_name,
    }
    
    NotificationService.send_immediate_notification(
        trigger_event=trigger_event,
        recipient_email=recipient_email,
        recipient_name=recipient_name,
        recipient_user=recipient_user,
        context=context
    )


def send_shipment_notification(shipment, trigger_event):
    """
    Enviar notificación relacionada con un envío
    """
    order = shipment.order
    recipient_email = order.customer_email
    recipient_name = order.customer_name
    recipient_user = order.user
    
    context = {
        'tracking_number': shipment.tracking_number,
        'shipment_status': shipment.get_status_display(),
        'order_number': order.order_number,
        'carrier': shipment.carrier or 'Transportista',
        'estimated_delivery_date': shipment.estimated_delivery_date.strftime('%d/%m/%Y') if shipment.estimated_delivery_date else 'N/A',
        'customer_name': recipient_name,
    }
    
    NotificationService.send_immediate_notification(
        trigger_event=trigger_event,
        recipient_email=recipient_email,
        recipient_name=recipient_name,
        recipient_user=recipient_user,
        context=context
    )

