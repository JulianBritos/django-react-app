from django.shortcuts import render
from django.http import HttpResponse
from .resources import ProductResource  # Importando el recurso adecuado
from django.contrib import messages

def import_products(request):
    if request.method == 'POST':
        product_resource = ProductResource()
        dataset = request.FILES['products_file']  # Asumiendo que el archivo se sube con el nombre 'products_file'

        # Intentamos importar los datos
        result = product_resource.import_data(dataset, dry_run=True)  # Cambiar dry_run=False para realizar la importación

        if result.has_errors():
            messages.error(request, "Error al importar productos.")
            return render(request, 'importer/import_products.html')

        messages.success(request, "Productos importados correctamente.")
        return render(request, 'importer/import_products.html')
    
    return render(request, 'importer/import_products.html')
