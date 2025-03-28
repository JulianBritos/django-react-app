from rest_framework.response import Response
from rest_framework import status, viewsets
from .models import Product, Category, Attribute, AttributeOption, ProductVariant
from .serializer import ProductSerializer, CategorySerializer, AttributeSerializer, AttributeOptionSerializer, ProductVariantSerializer, ProductAttributeSerializer


import environ
env = environ.Env()
environ.Env.read_env()

class AttributeViewSet(viewsets.ModelViewSet):
    queryset = Attribute.objects.all()
    serializer_class = AttributeSerializer

class AttributeOptionViewSet(viewsets.ModelViewSet):
    queryset = AttributeOption.objects.all()
    serializer_class = AttributeOptionSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.prefetch_related('uploaded_images').all()
    serializer_class = ProductSerializer

    def create(self, request, *args, **kwargs):
        print("Datos recibidos:", request.data)
        print("Archivos recibidos:", request.FILES)
        serializer = self.get_serializer(data=request.data, context={'request': request})

        if serializer.is_valid():
            product = serializer.save()  # Guardar producto primero

            images = request.FILES.getlist('images')
            for image in images:
                ProductImages.objects.create(product=product, image=image)
                
            return Response(ProductSerializer(product).data, status=status.HTTP_201_CREATED)
        else:
            print("Errores de validación:", serializer.errors)  # Ver errores en consola
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class ProductVariantViewSet(viewsets.ModelViewSet):
    queryset = ProductVariant.objects.prefetch_related('options').all()
    serializer_class = ProductVariantSerializer