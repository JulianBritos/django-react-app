from rest_framework.response import Response
from rest_framework import status, viewsets
from .models import Product, Category, ProductImages, Variant, VariantOption, ProductVariant
from .serializer import ProductSerializer, CategorySerializer, VariantSerializer, VariantOptionSerializer, ProductVariantSerializer



import environ
env = environ.Env()
environ.Env.read_env()


class VariantViewSet(viewsets.ModelViewSet):
    queryset = Variant.objects.all()
    serializer_class = VariantSerializer

class VariantOptionViewSet(viewsets.ModelViewSet):
    queryset = VariantOption.objects.all()
    serializer_class = VariantOptionSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def create(self, request, *args, **kwargs):
        print("Datos recibidos:", request.data)
        print("Archivos recibidos:", request.FILES)
        # Unir request.data y request.FILES para manejar imágenes correctamente
        data = request.data.copy()
        data.setlist('uploaded_images', request.FILES.getlist('uploaded_images'))
        variant_ids = data.pop("variant_ids", [])

        serializer = self.get_serializer(data=data)

        if serializer.is_valid():
            product = serializer.save()  # Guardar producto primero

            # Asignar variantes
            variants = Variant.objects.filter(id__in=variant_ids)
            product.variants.set(variants)

            # Guardar imágenes en ProductImages
            uploaded_images = request.FILES.getlist('uploaded_images')
            for image in uploaded_images:
                ProductImages.objects.create(product=product, image=image)

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print("Errores de validación:", serializer.errors)  # Ver errores en consola
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class ProductVariantViewSet(viewsets.ModelViewSet):
    queryset = ProductVariant.objects.all()
    serializer_class = ProductVariantSerializer