from django.contrib import admin

from .models import Category, Attribute, AttributeOption, Product, ProductAttribute, ProductImages


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
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
class AttributeAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('name',)
    date_hierarchy = 'created_at'


@admin.register(AttributeOption)
class AttributeOptionAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'attribute', 'created_at', 'updated_at')
    list_filter = ('attribute', 'created_at', 'updated_at')
    search_fields = ('name',)
    date_hierarchy = 'created_at'


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
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
    )
    list_filter = ('category', 'created_at', 'updated_at')
    search_fields = ('name',)
    date_hierarchy = 'created_at'


@admin.register(ProductAttribute)
class ProductAttributeAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'product',
        'sku',
        'selling_price',
        'stock',
        'stock_alert',
        'barcode',
    )
    list_filter = ('product',)
    #raw_id_fields = ('attribute', 'attributeoption')


@admin.register(ProductImages)
class ProductImagesAdmin(admin.ModelAdmin):
    list_display = ('id', 'productattribute', 'image')
    list_filter = ('productattribute',)