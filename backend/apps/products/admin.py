from django.contrib import admin
from unfold.admin import ModelAdmin

from .models import Category, Attribute, AttributeOption, Product, ProductImages, ProductAttribute


@admin.register(Category)
class CategoryAdmin(ModelAdmin):
    list_display = (
        'id',
        'name',
        'display_order',
        'parent_id',
        'created_at',
        'updated_at',
    )
    list_filter = ('parent_id', 'created_at', 'updated_at')
    search_fields = ('name',)
    date_hierarchy = 'created_at'


@admin.register(Attribute)
class AttributeAdmin(ModelAdmin):
    list_display = ('id', 'name', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('name',)
    date_hierarchy = 'created_at'


@admin.register(AttributeOption)
class AttributeOptionAdmin(ModelAdmin):
    list_display = ('id', 'name', 'attribute', 'created_at', 'updated_at')
    list_filter = ('attribute', 'created_at', 'updated_at')
    search_fields = ('name',)
    date_hierarchy = 'created_at'


@admin.register(Product)
class ProductAdmin(ModelAdmin):
    list_display = (
        'id',
        'name',
        'description',
        'category',
        'specifications',
        'html_description',
        'highlights',
        'initial_buying_price',
        'tax_percentage',
        'brand',
        'brand_model',
        'status',   
        'seo_title',
        'seo_description',
        'seo_keywords',
        'created_at',
        'updated_at',
        'get_images',  # Added field to display images
    )
    list_display_mode = "cards" 

    def get_images(self, obj):
        return ", ".join([str(image.image.url) for image in obj.uploaded_images.all()])
    get_images.short_description = 'Images'
    inlines = []

    class ProductImagesInline(admin.TabularInline):
        model = ProductImages
        extra = 1

    def get_inlines(self, request, obj=None):
        return [self.ProductImagesInline]
  
    list_filter = ('category', 'created_at', 'updated_at')
    search_fields = ('name',)
    date_hierarchy = 'created_at'



@admin.register(ProductImages)
class ProductImagesAdmin(ModelAdmin):
    list_display = ('id', 'product', 'image')
    list_filter = ('product',)


@admin.register(ProductAttribute)
class ProductAttributeAdmin(ModelAdmin):
    list_display = ('id', 'product', 'sku', 'selling_price', 'stock')
    list_filter = ('product',)
    raw_id_fields = ('attribute', 'attributeoption')