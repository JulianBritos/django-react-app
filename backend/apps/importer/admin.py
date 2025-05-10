# importer/admin.py
from import_export.admin import ImportExportModelAdmin
from django.contrib import admin
from apps.products import models
import apps.importer.resources as resources

class ProductAdmin(ImportExportModelAdmin):
    resource_class = resources.ProductResource

class ProductAttributeAdmin(ImportExportModelAdmin):
    resource_class = resources.ProductAttributeResource

class ProductImagesAdmin(ImportExportModelAdmin):
    resource_class = resources.ProductImagesResource

class CategoryAdmin(ImportExportModelAdmin):
    resource_class = resources.CategoryResource
    
class AttributeAdmin(ImportExportModelAdmin):
    resource_class = resources.AttributeResource

class AttributeOptionAdmin(ImportExportModelAdmin):
    resource_class = resources.AttributeOptionResource
