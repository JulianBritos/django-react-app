from django.db import transaction
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.orders.models import Order, Purchase
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

            # Crear un registro en la base de datos
            order = Order.objects.create(
                product_id=data["id"],
                product_title=data["title"],
                quantity=data["quantity"],
                unit_price=data["unit_price"],
                total_price=data["quantity"] * data["unit_price"],
                buyer_email=data["payer"]["email"],
                external_reference=f"pedido_{data['id']}"
            )

            # Datos para MercadoPago
            preference_data = {
                "items": [
                    {
                        "id": order.product_id,
                        "title": order.product_title,
                        "currency_id": "ARS",
                        "quantity": order.quantity,
                        "unit_price": order.unit_price
                    }
                ],
                "payer": {
                    "email": order.buyer_email,
                },
                "back_urls": data["back_urls"],
                "auto_return": "approved",
                "notification_url": "https://www.tusitio.com/webhook-mercadopago",
                "external_reference": order.external_reference,
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
                order = Order.objects.get(external_reference=external_reference)
                order.payment_status = payment_status
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

            # Guardar la compra en la base de datos
            Purchase.objects.create(
                payment_id=payment_info["id"],
                status=payment_info["status"],
                email=payment_info["payer_email"],
                items=payment_info["items"],
                total_amount=payment_info["total_amount"]
            )

            return JsonResponse({"message": "Compra guardada exitosamente"}, status=201)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Método no permitido"}, status=405)