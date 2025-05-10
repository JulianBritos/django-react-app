# importer/resources.py
from import_export import resources
from apps.products import models

class ProductResource(resources.ModelResource):
    class Meta:
        model = models.Product()

class ProductAttributeResource(resources.ModelResource):
    class Meta:
        model = models.ProductAttribute()

class ProductImagesResource(resources.ModelResource):
    class Meta:
        model = models.ProductImages()

class CategoryResource(resources.ModelResource):
    class Meta:
        model = models.Category()

class AttributeResource(resources.ModelResource):
    class Meta:
        model = models.Attribute()

class AttributeOptionResource(resources.ModelResource):
    class Meta:
        model = models.AttributeOption()


