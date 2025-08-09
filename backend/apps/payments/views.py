from django.db import transaction
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.orders.models import Order
from apps.payments.models import Payment, PaymentMethod
import mercadopago
import json
import environ



# Cargar variables de entorno
env = environ.Env()
environ.Env.read_env()


@api_view(["POST"]) 
def create_preference(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            sdk = mercadopago.SDK(env("MERCADOPAGO_ACCESS_TOKEN"))

            # Crear un registro de orden en la base de datos
            order = Order.objects.create(
                guest_email=data["payer"]["email"],
                subtotal=data["quantity"] * data["unit_price"],
                total_amount=data["quantity"] * data["unit_price"]
            )

            # Datos para MercadoPago
            preference_data = {
                "items": [
                    {
                        "id": data["id"],
                        "title": data["title"],
                        "currency_id": "ARS",
                        "quantity": data["quantity"],
                        "unit_price": data["unit_price"]
                    }
                ],
                "payer": {
                    "email": order.guest_email,
                },
                "back_urls": data["back_urls"],
                "auto_return": "approved",
                "notification_url": "https://www.tusitio.com/webhook-mercadopago",
                "external_reference": order.order_number,
                "expires": True
            }

            preference_response = sdk.preference().create(preference_data)
            preference = preference_response["response"]

            return JsonResponse({"init_point": preference["init_point"], "order_id": order.id})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Método no permitido"}, status=405)


def webhook_mercadopago(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            external_reference = data.get("external_reference")
            payment_status = data.get("status")  # "approved", "pending", "rejected"

            # Buscar el pedido en la base de datos y actualizar su estado
            try:
                order = Order.objects.get(order_number=external_reference)
                # Mapear estados de MercadoPago a nuestros estados
                status_mapping = {
                    'approved': 'confirmed',
                    'pending': 'pending', 
                    'rejected': 'cancelled'
                }
                order.status = status_mapping.get(payment_status, 'pending')
                order.save()
            except Order.DoesNotExist:
                return JsonResponse({"error": "Pedido no encontrado"}, status=404)

            return JsonResponse({"message": "Pago actualizado correctamente"})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Método no permitido"}, status=405)

@csrf_exempt
def payment_notification(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            payment_id = data.get("data", {}).get("id")

            # Simulación de obtención de datos de MercadoPago (debes hacer una petición real aquí)
            payment_info = {
                "id": payment_id,
                "status": "approved",
                "payer_email": "cliente@email.com",
                "items": [{"title": "Producto A", "quantity": 2, "unit_price": 50.0}],
                "total_amount": 100.0
            }

            # Buscar la orden asociada (necesitarás implementar la lógica para encontrarla)
            # Por ahora, creamos un pago básico
            try:
                # Obtener método de pago de MercadoPago (crear si no existe)
                payment_method, created = PaymentMethod.objects.get_or_create(
                    code='mercado_pago',
                    defaults={
                        'name': 'MercadoPago',
                        'payment_type': 'mercado_pago',
                        'is_active': True
                    }
                )
                
                # Crear una orden temporal para el pago
                # En una implementación real, deberías encontrar la orden existente
                temp_order = Order.objects.create(
                    guest_email=payment_info["payer_email"],
                    subtotal=payment_info["total_amount"],
                    total_amount=payment_info["total_amount"]
                )
                
                # Crear el registro de pago
                payment = Payment.objects.create(
                    order=temp_order,
                    external_payment_id=payment_info["id"],
                    payment_method=payment_method,
                    amount=payment_info["total_amount"],
                    status='completed' if payment_info["status"] == 'approved' else 'failed',
                    gateway_response=payment_info
                )
                
            except Exception as e:
                return JsonResponse({"error": f"Error al crear el pago: {str(e)}"}, status=400)

            return JsonResponse({"message": "Compra guardada exitosamente"}, status=201)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Método no permitido"}, status=405)