from django.contrib.auth import authenticate, login, get_user_model
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, viewsets
from django.shortcuts import get_object_or_404
from .models import Product, Category, Order, Purchase
from .serializer import ProductSerializer, CategorySerializer, UserSerializer, RegisterSerializer
from django.shortcuts import render
from datetime import datetime, timedelta

from django.http import JsonResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt

import requests
import json
import mercadopago

import environ
env = environ.Env()
environ.Env.read_env()
sdk = mercadopago.SDK(env("MERCADOPAGO_ACCESS_TOKEN"))


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print("Errores de validación:", serializer.errors)  # <-- Esto imprime los errores en la consola de Django
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


User = get_user_model()
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Usuario registrado correctamente"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(request, username=username, password=password)

    if user is not None:
        login(request, user)
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED)
    
class UserManagementViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]  # Solo admins pueden gestionar usuarios

#mercado pago
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
                        "currency_id": "BRL",
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