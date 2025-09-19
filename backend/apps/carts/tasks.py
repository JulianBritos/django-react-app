# backend/apps/carts/tasks.py (si usas Celery)

from celery import shared_task
from .services import StockReservationService

@shared_task
def cleanup_expired_stock_reservations():
    """
    Tarea periódica para limpiar reservas expiradas
    """
    StockReservationService.cleanup_expired_reservations()
    return "Reservas expiradas limpiadas"
