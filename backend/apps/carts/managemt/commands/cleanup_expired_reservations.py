# backend/apps/carts/management/commands/cleanup_expired_reservations.py

from django.core.management.base import BaseCommand
from apps.carts.services import StockReservationService

class Command(BaseCommand):
    help = 'Limpiar reservas de stock expiradas'

    def handle(self, *args, **options):
        self.stdout.write('Limpiando reservas expiradas...')
        
        StockReservationService.cleanup_expired_reservations()
        
        self.stdout.write(
            self.style.SUCCESS('Reservas expiradas limpiadas exitosamente')
        )
