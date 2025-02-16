from django.db import models

# Create your models here.
Class Book(model.Model):
    title = models.models.CharField(max_length=50)
    release_year = models.models.IntegerField()
    
    def __str__(self):
        return self.title
    