from django.shortcuts import render
from rest_framework import (viewsets, generics)
from .serializer import (TaskSerializer, UserSerializer)
from .models import Task
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated, AllowAny



# Create your views here.
class TaskView(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    queryset = Task.objects.all()

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = User
    permission_classes = [AllowAny]    
