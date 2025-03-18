from django.contrib.auth import authenticate, login, get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, viewsets
from .models import Product, Category
from .serializer import ProductSerializer, CategorySerializer, UserSerializer, RegisterSerializer
from django.shortcuts import render
from datetime import datetime, timedelta
from .preferencias import preferencias

import requests
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
ejemploPropio = [
        {
                    "id": 1,
                    "title": "Deuda 1",
                    "currency_id": "ARS",
                    "description": "7/2022",
                    "quantity": 1,
                    "unit_price": 1
        }, 
        {
                    "id": 2,
                    "title": "Deuda 2",
                    "currency_id": "ARS",
                    "description": "8/2022",
                    "quantity": 2,
                    "unit_price": 5
        }
    ]

def unaPreferenciaPorCadaCuota(lista):
    cantidadDeCuotas = len(lista)
    todasLasRequests = []
    if (cantidadDeCuotas >= 1):

        #Un elemento en la lista con las preferencias incluidas por cada cuota.
        for i in range(0, len(lista) + 1):

            todasLasRequests.append([])
            cuota = lista[i]

            todasLasRequests[i] = {
                "items" : [ {
                    "id": cuota["id"], #Requerido
                    "title": cuota["title"], #Requerido
                    "quantity": 1, #Requerido
                    "unit_price": cuota["unit_price"], #Requerido
                    "description": cuota["description"],
                    "currency_id": "ARS", } ],
            }

            todasLasRequests[i].update(preferencias)

            #Se define el tiempo, el actual es facil pero al futuro hay que cambiarlo bastante, quitarle los MS y cambiar la T 
            now = datetime.now() 
            actual = now.astimezone().strftime("%Y-%m-%dT%H:%M:%S.000-03:00")

            futuro = now + \
                timedelta(days = 3)
            futuro = (str(futuro).split("."))[0] + ".000-03:00"
            futuro = futuro.replace(" ", "T")

            todasLasRequests[i]["expiration_date_from"] = actual
            todasLasRequests[i]["expiration_date_to"] = futuro
        
        return (todasLasRequests)

def unaPreferenciaPorVariasCuotas(lista):
    cantidadDeCuotas = len(lista)
    preferenciasCompletas = preferencias
    preferenciasCompletas["items"] = []

    if (cantidadDeCuotas >= 1):

        #Un elemento en la lista con las preferencias incluidas por cada cuota.
        for cuota in lista:

            preferenciasCompletas["items"].append(
                    {
                    "quantity": 1, #Requerido
                    "id": cuota["id"], #Requerido
                    "title": cuota["title"], #Requerido
                    "unit_price": cuota["unit_price"], #Requerido
                    "description": cuota["description"],
                    "currency_id": "ARS",
                    }
            )

            #Se define el tiempo, el actual es facil pero al futuro hay que cambiarlo bastante, quitarle los MS y cambiar la T 
            now = datetime.now() 
            actual = now.astimezone().strftime("%Y-%m-%dT%H:%M:%S.000-03:00")

            futuro = now + \
                timedelta(days = 3)
            futuro = (str(futuro).split("."))[0] + ".000-03:00"
            futuro = futuro.replace(" ", "T")

            preferenciasCompletas["expiration_date_from"] = actual
            preferenciasCompletas["expiration_date_to"] = futuro
        
        return (preferenciasCompletas)

@api_view(['GET'])
def enviarRequestAMP(request):
    
    listaAEnviar = unaPreferenciaPorVariasCuotas(ejemploPropio)
    listaDeDatosRecibidos = []

    preference_response = sdk.preference().create(listaAEnviar)
    preference = preference_response["response"]
    listaDeDatosRecibidos.append(preference)

    return Response({"loRecibido": listaDeDatosRecibidos})

@api_view(['POST'])
def recibirNotificacion(request):
    datos_recibidos = request.data

    url = datos_recibidos["resource"]

    #Ejemplo de como funciona esta request en el archivo "sendRequest.py"
    recibo = request.get(url, headers={"Authorization": "Bearer " + env("MERCADOPAGO_ACCESS_TOKEN")}) #Reemplazo el test token por el production token
    recibo = recibo.text
    status_details = recibo["status_details"]
    if status_details == "Accredited":
        print(status_details) #Registro en la DB que fué exitoso
    else:
        print(status_details) #Registro en la DB que NO fué exitoso


def frontEndIntegration(request):
    return render(request, "api/index.html")