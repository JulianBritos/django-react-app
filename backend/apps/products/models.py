from django.db import models
from django.utils import timezone


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Attribute(models.Model):
    name = models.CharField(max_length=100, unique=True)  # Ejemplo: "Color" o "Talle"

    def __str__(self):
        return self.name


class AttributeOption(models.Model):
    attribute = models.ForeignKey(Attribute, on_delete=models.CASCADE, null=True, related_name="options")
    name = models.CharField(max_length=100)  # Ejemplo: "Rojo", "M", "L"

    def __str__(self):
        return f"{self.attribute.name}: {self.name}"


class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, related_name="products", null=True)
    #created_at= models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class ProductAttribute(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="attributes")
    attribute = models.ForeignKey(Attribute, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.product.name} - {self.attribute.name}"

class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="variants")
    sku = models.CharField(max_length=50, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)  # Precio específico (opcional)
    stock = models.PositiveIntegerField(default=0)
    options = models.ManyToManyField(AttributeOption, related_name="variants")  # Relación con las opciones seleccionadas

    def __str__(self):
        return f"{self.product.name} - {' / '.join([opt.name for opt in self.options.all()])}"

class ProductImages(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='uploaded_images')
    image = models.ImageField(upload_to='product_images/')

    def __str__(self):
        return self.image.url
    
