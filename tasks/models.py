from django.db import models
from django.contrib.auth.models import User


# Create your models here.
class Task(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    done = models.BooleanField(default=False)
    createdat = models.DateTimeField(auto_now_add=True)
    
    def __str__(self) -> str:
        return self.title