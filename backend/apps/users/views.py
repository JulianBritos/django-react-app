from django.contrib.auth import authenticate, login, get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, viewsets
from .serializer import UserSerializer, RegisterSerializer, ChangePasswordSerializer
from rest_framework.views import APIView
from google.oauth2 import id_token
from google.auth.transport import requests
from rest_framework_simplejwt.tokens import RefreshToken
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.utils.timezone import now, timedelta
from .models import EmailVerification
from random import randint


User = get_user_model()

class GoogleLoginView(APIView):
    def post(self, request):
        token = request.data.get('id_token')

        if not token:
            return Response({'error': 'No token provided'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            idinfo = id_token.verify_oauth2_token(token, requests.Request())

            email = idinfo['email']
            name = idinfo.get('name', '')
            picture = idinfo.get('picture', '')

            user, created = User.objects.get_or_create(email=email, defaults={
                'username': email,
                'first_name': name.split()[0] if name else '',
                'last_name': ' '.join(name.split()[1:]) if name else '',
                'role': 0,
            })

            # Registrar el login del usuario
            login(request, user)

            refresh = RefreshToken.for_user(user)

            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })

        except ValueError:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

@swagger_auto_schema(
    method='post',
    request_body=RegisterSerializer,
    responses={
        201: openapi.Response("Usuario registrado correctamente"),
        400: openapi.Response("Error de validación"),
    },
)

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Usuario registrado correctamente"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(
    method='post',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'username': openapi.Schema(type=openapi.TYPE_STRING, description='Nombre de usuario'),
            'password': openapi.Schema(type=openapi.TYPE_STRING, description='Contraseña'),
        },
        required=['username', 'password'],
    ),
    responses={
        200: openapi.Response("Inicio de sesión exitoso"),
        401: openapi.Response("Credenciales inválidas"),
        400: openapi.Response("Error de validación"),
    },)

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
    return Response({"error": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED)
    

class UserManagementViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]  # Solo admins pueden gestionar usuarios

class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({"old_password": "Incorrect password."}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({"detail": "Password updated successfully."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')

        try:
            verification = EmailVerification.objects.get(user__email=email)

            if not verification.is_code_valid():
                return Response({"error": "El código ha expirado."}, status=status.HTTP_400_BAD_REQUEST)

            if verification.verification_code != code:
                return Response({"error": "El código es incorrecto."}, status=status.HTTP_400_BAD_REQUEST)

            # Código válido, eliminar la verificación
            verification.delete()
            return Response({"message": "Correo verificado correctamente."}, status=status.HTTP_200_OK)

        except EmailVerification.DoesNotExist:
            return Response({"error": "No se encontró una verificación para este correo."}, status=status.HTTP_404_NOT_FOUND)

class ResendVerificationCodeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')

        try:
            verification = EmailVerification.objects.get(user__email=email)

            # Generar un nuevo código y actualizar la expiración
            verification.verification_code = f"{randint(100000, 999999)}"
            verification.expiration_time = now() + timedelta(minutes=2)
            verification.save()

            # Enviar el nuevo código por correo (placeholder para lógica de correo)
            # send_email_verification(email, verification.verification_code)

            return Response({"message": "Se ha enviado un nuevo código de verificación."}, status=status.HTTP_200_OK)

        except EmailVerification.DoesNotExist:
            return Response({"error": "No se encontró una verificación para este correo."}, status=status.HTTP_404_NOT_FOUND)

