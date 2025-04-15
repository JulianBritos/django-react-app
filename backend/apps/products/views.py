from rest_framework.response import Response
from rest_framework import status, viewsets
from .models import Product, Category, ProductImages, Attribute, AttributeOption, ProductAttribute
from .serializer import ProductSerializer, CategorySerializer, AttributeSerializer, AttributeOptionSerializer, ProductAttributeSerializer



import environ
env = environ.Env()
environ.Env.read_env()


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def create(self, request, *args, **kwargs):
        print("Datos recibidos:", request.data)
        print("Archivos recibidos:", request.FILES)
        # Unir request.data y request.FILES para manejar imágenes correctamente
        data = request.data.copy()
        data.setlist('uploaded_images', request.FILES.getlist('uploaded_images'))

        serializer = self.get_serializer(data=data)

        if serializer.is_valid():
            product = serializer.save()  

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

class AttributeViewSet(viewsets.ModelViewSet):
    queryset = Attribute.objects.all().prefetch_related('attributeoption_set')
    serializer_class = AttributeSerializer

class AttributeOptionViewSet(viewsets.ModelViewSet):
    queryset = AttributeOption.objects.all()
    serializer_class = AttributeOptionSerializer

class ProductAttributeViewSet(viewsets.ModelViewSet):
    queryset = ProductAttribute.objects.all()
    serializer_class = ProductAttributeSerializer
    def create(self, request, *args, **kwargs):
        print("Archivos recibidos:", request.FILES)
        # Unir request.data y request.FILES para manejar imágenes correctamente
        data = request.data.copy()
        data.setlist('uploaded_images', request.FILES.getlist('uploaded_images'))

        serializer = self.get_serializer(data=data)

        if serializer.is_valid():
            productattribute = serializer.save()  

            # Guardar imágenes en ProductImages
            uploaded_images = request.FILES.getlist('uploaded_images')
            for image in uploaded_images:
                ProductImages.objects.create(productattribute=productattribute, image=image)

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print("Errores de validación:", serializer.errors)  # Ver errores en consola
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
