from django.shortcuts import render
from django.http import HttpResponse
import pandas as pd  # Para leer los archivos CSV y Excel
from apps.products.models import Product  # Asegúrate de importar tu modelo y Category si es necesario
import json

def import_products(request):
    if request.method == 'POST' and request.FILES['file']:
        file = request.FILES['file']
        
        try:
            # Dependiendo del tipo de archivo
            if file.name.endswith('.csv'):
                data = pd.read_csv(file)
            elif file.name.endswith('.xlsx') or file.name.endswith('.xls'):
                data = pd.read_excel(file)
            else:
                raise ValueError("El archivo debe ser CSV o Excel.")
            
            # Procesar cada fila del archivo y crear productos
            for index, row in data.iterrows():
                category = None
                if 'category' in row and pd.notna(row['category']):
                    try:
                        # Buscar la categoría por su nombre o crearla
                        category, created = Category.objects.get_or_create(name=row['category'])
                    except Category.DoesNotExist:
                        pass
                
                product = Product.objects.create(
                    name=row['name'],
                    description=row['description'],
                    category=category,
                    specifications=json.loads(row['specifications']) if pd.notna(row['specifications']) else {},
                    html_description=row['html_description'] if pd.notna(row['html_description']) else '',
                    highlights=json.loads(row['highlights']) if pd.notna(row['highlights']) else {},
                    initial_buying_price=row['initial_buying_price'] if pd.notna(row['initial_buying_price']) else None,
                    tax_percentage=row['tax_percentage'] if pd.notna(row['tax_percentage']) else None,
                    brand=row['brand'] if pd.notna(row['brand']) else '',
                    brand_model=row['brand_model'] if pd.notna(row['brand_model']) else '',
                    status=row['status'] if pd.notna(row['status']) else 'ACTIVE',
                    seo_title=row['seo_title'] if pd.notna(row['seo_title']) else '',
                    seo_description=row['seo_description'] if pd.notna(row['seo_description']) else '',
                    seo_keywords=json.loads(row['seo_keywords']) if pd.notna(row['seo_keywords']) else {},
                )
            
            return render(request, 'importer/import_products.html', {'success': True})
        
        except Exception as e:
            return render(request, 'importer/import_products.html', {'error': str(e)})
    
    return render(request, 'importer/import_products.html')
