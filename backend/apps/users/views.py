from django.contrib.auth import authenticate, login, get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, viewsets
from .serializer import UserSerializer, RegisterSerializer
from rest_framework.views import APIView
from google.oauth2 import id_token
from google.auth.transport import requests
from rest_framework_simplejwt.tokens import RefreshToken

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

            refresh = RefreshToken.for_user(user)

            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })

        except ValueError:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

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
    return Response({"error": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED)
    

class UserManagementViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]  # Solo admins pueden gestionar usuarios

