from django.db import models

class Category(models.Model):
    id=models.AutoField(primary_key=True)
    name=models.CharField(max_length=255)
    display_order=models.IntegerField(default=0)
    parent_id=models.ForeignKey('self',on_delete=models.CASCADE,blank=True,null=True)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Attribute(models.Model):
    id=models.AutoField(primary_key=True)
    name=models.CharField(max_length=255)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name

class AttributeOption(models.Model):
    id=models.AutoField(primary_key=True)
    name=models.CharField(max_length=255)
    attribute=models.ForeignKey(Attribute, on_delete=models.SET_NULL, null=True)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)   

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)    
    specifications=models.JSONField(blank=True, null=True)
    html_description=models.TextField( null=True)
    highlights=models.JSONField( null=True)
    initial_buying_price=models.FloatField( null=True)
    tax_percentage=models.FloatField( null=True)
    brand=models.CharField(max_length=255, null=True)
    brand_model=models.CharField(max_length=255, null=True)
    status=models.CharField(max_length=255,choices=[('ACTIVE','ACTIVE'),('INACTIVE','INACTIVE')],default='ACTIVE')
    seo_title=models.CharField(max_length=255, null=True)
    seo_description=models.TextField( null=True)
    seo_keywords=models.JSONField( null=True)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)
   

    def __str__(self):
        return self.name
    

class ProductImages(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='uploaded_images')
    image = models.ImageField(upload_to='product_images/')

    def __str__(self):
        return self.image.url
    

class ProductAttribute(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='product_attributes')
    attribute = models.ManyToManyField(Attribute, related_name='attribute')
    attributeoption = models.ManyToManyField(AttributeOption, related_name='product_attribute_options')
    sku = models.CharField(max_length=255, blank=True, null=True)
    selling_price=models.FloatField( null=True)
    stock = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.product
