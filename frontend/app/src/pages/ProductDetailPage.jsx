import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductById } from "../api/products.api";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../context/AuthContext";
import { getUserFromToken } from "../api/api";
import ProductInfoCard from "../components/ProductInfoCard";
import CarouselOfImages from "../components/CarouselOfImages";
import ReviewList from "../components/reviews/ReviewList";
import ReviewForm from "../components/reviews/ReviewForm";

const ProductDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [availableVariants, setAvailableVariants] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    // Obtener ID del usuario actual si está autenticado
    if (isAuthenticated) {
      const user = getUserFromToken();
      if (user) {
        setCurrentUserId(user.id);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productData = await getProductById(id);
        console.log("Producto crudo del backend:", productData);

        // Procesar las variantes del producto
        if (
          productData.product_attributes &&
          productData.product_attributes.length > 0
        ) {
          const processedVariants = productData.product_attributes.map(
            (variant) => {
              // Obtener los atributos de esta variante
              const variantAttributes = variant.attributes || [];

              return {
                ...variant,
                attributes: variantAttributes,
                // Crear un identificador único para esta variante
                variantKey: variantAttributes
                  .map((attr) => `${attr.attribute_name}:${attr.option_name}`)
                  .join("|"),
              };
            }
          );

          setAvailableVariants(processedVariants);

          // Seleccionar la primera variante por defecto
          if (processedVariants.length > 0) {
            const firstVariant = processedVariants[0];
            setSelectedVariant(firstVariant);

            // Establecer las imágenes de la primera variante
            const images =
              firstVariant.uploaded_images?.map((img) => {
                if (img.image.startsWith("http")) {
                  return img.image;
                } else {
                  return `${import.meta.env.VITE_BASE_URL}${img.image}`;
                }
              }) || [];

            setProductImages(images.length > 0 ? images : ["/placeholder.jpg"]);
          }
        }

        setProduct(productData);
      } catch (error) {
        console.error("Error fetching product:", error);
        setProduct(null);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleVariantSelect = (variant) => {
    console.log("Variante seleccionada:", variant);
    setSelectedVariant(variant);

    // Actualizar las imágenes cuando se selecciona una nueva variante
    const variantImages =
      variant.uploaded_images?.map((img) => {
        if (img.image.startsWith("http")) {
          return img.image;
        } else {
          return `${import.meta.env.VITE_BASE_URL}${img.image}`;
        }
      }) || [];

    setProductImages(
      variantImages.length > 0 ? variantImages : ["/placeholder.jpg"]
    );
  };

  const handleAttributeSelection = (selectedAttributes) => {
    console.log("Atributos seleccionados:", selectedAttributes);

    // Buscar la variante que coincida con los atributos seleccionados
    const matchingVariant = availableVariants.find((variant) => {
      const variantAttributes = variant.attributes || [];

      // Verificar si todos los atributos seleccionados coinciden con esta variante
      return Object.entries(selectedAttributes).every(
        ([attributeId, optionId]) => {
          if (!optionId) return true; // Si no hay opción seleccionada, no filtrar

          return variantAttributes.some(
            (attr) =>
              attr.attribute_id.toString() === attributeId.toString() &&
              attr.option_id.toString() === optionId.toString()
          );
        }
      );
    });

    if (matchingVariant) {
      handleVariantSelect(matchingVariant);
    }
  };

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Cargando producto...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    // La lista de reseñas se actualizará automáticamente
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Información del producto */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-1 grid-rows-1 md:grid-cols-3 gap-8">
          <div className="rounded-lg p-4 col-span-1 md:col-span-2">
            <CarouselOfImages
              key={selectedVariant?.id}
              images={productImages}
            />
          </div>
          <div className="col-span-1 md:col-span-1">
            <ProductInfoCard
              product={product}
              selectedVariant={selectedVariant}
              availableVariants={availableVariants}
              onVariantSelect={handleVariantSelect}
              onAttributeSelection={handleAttributeSelection}
            />
          </div>
        </div>
      </div>

      {/* Sección de reseñas */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Reseñas</h2>
          {isAuthenticated && !showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Escribir reseña
            </button>
          )}
        </div>

        {/* Formulario de reseña */}
        {showReviewForm && (
          <div className="mb-6">
            <ReviewForm
              productId={id}
              onReviewSubmitted={handleReviewSubmitted}
              onCancel={() => setShowReviewForm(false)}
            />
          </div>
        )}

        {/* Lista de reseñas */}
        <ReviewList productId={id} currentUserId={currentUserId} />
      </div>
    </div>
  );
};

export default ProductDetailPage;
