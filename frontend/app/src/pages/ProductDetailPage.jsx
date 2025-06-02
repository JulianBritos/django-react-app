import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductById } from "../api/products.api";
import { useCart } from "../hooks/useCart";
import ProductInfoCard from "../components/ProductInfoCard";
import CarouselOfImages from "../components/CarouselOfImages";

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const { addToCart } = useCart();
  const [productImages, setProductImages] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productData = await getProductById(id);
        setProduct(productData);

        // Extract image URLs from product_attributes and ensure they use the full URL
        const allImages = productData.product_attributes?.flatMap(
          (attr) =>
            attr.uploaded_images?.map((img) => {
              // If the image URL is relative, make it absolute
              if (img.image.startsWith("/")) {
                return `${process.env.REACT_APP_API_URL}${img.image}`;
              }
              return img.image;
            }) || []
        );

        if (!allImages || allImages.length === 0) {
          console.log("No images found, using placeholder");
          setProductImages(["/placeholder.jpg"]);
        } else {
          console.log("Images found:", allImages);
          setProductImages(allImages);
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
  if (!product) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Cargando producto...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CarouselOfImages key={product.id} images={productImages} />
        <ProductInfoCard product={product} />
      </div>
    </div>
  );
};

export default ProductDetailPage;
