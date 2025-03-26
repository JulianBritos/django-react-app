from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Variant(models.Model):
    name = models.CharField(max_length=100)  # Ejemplo: "Color" o "Talle"

    def __str__(self):
        return self.name


class VariantOption(models.Model):
    variant = models.ForeignKey(Variant, on_delete=models.CASCADE, related_name="options")
    value = models.CharField(max_length=100)  # Ejemplo: "Rojo", "M", "L"

    def __str__(self):
        return f"{self.variant.name}: {self.value}"


class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    variants = models.ManyToManyField(Variant, related_name="products")

    def __str__(self):
        return self.name
    
class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='product_variants')
    sku = models.CharField(max_length=50, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Precio específico (opcional)
    stock = models.PositiveIntegerField(default=0)
    options = models.ManyToManyField(VariantOption)  # Relación con las opciones seleccionadas

    def __str__(self):
        return f"{self.product.name} - {', '.join(opt.value for opt in self.options.all())}"

class ProductImages(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='uploaded_images')
    image = models.ImageField(upload_to='product_images/')

    def __str__(self):
        return self.image.url
    
