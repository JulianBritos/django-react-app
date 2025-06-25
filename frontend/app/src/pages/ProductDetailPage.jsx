import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductById } from "../api/products.api";
import { useCart } from "../hooks/useCart";
import ProductInfoCard from "../components/ProductInfoCard";
import CarouselOfImages from "../components/CarouselOfImages";

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedAttribute, setSelectedAttribute] = useState(null);
  const [productImages, setProductImages] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productData = await getProductById(id);
        console.log("Producto crudo del backend:", productData);

        // Enriquecer los datos del producto con los nombres de atributos y opciones
        if (productData.product_attributes) {
          productData.product_attributes = productData.product_attributes.map(
            (attr) => {
              const attributeId = Array.isArray(attr.attribute)
                ? attr.attribute[0] // tomamos el primer ID del array
                : attr.attribute;

              return {
                ...attr,
                attribute: attributeId, // 👈 corregido a número
                attribute_name: attr.attribute?.name || "Sin nombre",
                option_name:
                  attr.attributeoption?.map((opt) => opt.name).join(", ") ||
                  "Sin opción",
              };
            }
          );
        }
        console.log("Producto crudo del backend:", productData);
        productData.product_attributes?.forEach((attr, i) => {
          console.log(`Atributo #${i}:`, attr);
        });
        setProduct(productData);

        // Seleccionar el primer atributo por defecto
        if (productData?.product_attributes?.length > 0) {
          const firstAttribute = productData.product_attributes[0];
          setSelectedAttribute(firstAttribute);

          // Establecer las imágenes del primer atributo
          const images =
            firstAttribute.uploaded_images?.map((img) => {
              // Asegurarse de que la URL de la imagen sea completa
              if (img.image.startsWith("http")) {
                return img.image;
              } else {
                return `${import.meta.env.VITE_BASE_URL}${img.image}`;
              }
            }) || [];

          setProductImages(images.length > 0 ? images : ["/placeholder.jpg"]);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setProduct(null);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAttributeSelect = (attribute) => {
    console.log("handleAttributeSelect llamado con atributo:", attribute);
    setSelectedAttribute(attribute);

    // Actualizar las imágenes cuando se selecciona un nuevo atributo
    const attributeImages =
      attribute.uploaded_images?.map((img) => {
        if (img.image.startsWith("http")) {
          return img.image;
        } else {
          return `${import.meta.env.VITE_BASE_URL}${img.image}`;
        }
      }) || [];

    setProductImages(
      attributeImages.length > 0 ? attributeImages : ["/placeholder.jpg"]
    );
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

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-1 grid-rows-1 md:grid-cols-3 gap-8">
          <div className="rounded-lg p-4 col-span-1 md:col-span-2">
            <CarouselOfImages
              key={selectedAttribute?.id}
              images={productImages}
            />
          </div>
          <div className="col-span-1 md:col-span-1">
            <ProductInfoCard
              product={product}
              onAttributeSelect={handleAttributeSelect}
              selectedAttribute={selectedAttribute}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
