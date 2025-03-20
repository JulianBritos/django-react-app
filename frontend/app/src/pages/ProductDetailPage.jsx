import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductById } from "../api/products.api"; // ✅ Corrección aquí
import { useCart } from "../hooks/useCart";
import ProductInfoCard from "../components/ProductInfoCard";
import CarouselOfImages from "../components/CarouselOfImages";

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const { addToCart } = useCart();
  //Constante para testeo de imagenes
  const sampleImages = [
    "https://picsum.photos/id/1011/400/300", // Vista frontal
    "https://picsum.photos/id/1012/400/300", // Vista lateral
    "https://picsum.photos/id/1013/400/300", // Vista trasera
    "https://picsum.photos/id/1014/400/300", // Detalle 1
    "https://picsum.photos/id/1015/400/300", // Detalle 2
    "https://picsum.photos/id/1016/400/300", // Color variante 1
    "https://picsum.photos/id/1018/400/300", // Color variante 2
    "https://picsum.photos/id/1020/400/300"  // Color variante 3
  ];
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productData = await getProductById(id); // ✅ Ahora usa la API correcta
        setProduct(productData);
      } catch (error) {
        console.error("Error al obtener producto:", error);
        setProduct(null); // Evitar que falle si hay un error
      }
    };

    if (id) fetchProduct();
  }, [id]);

  if (!product) {
    return <p className="p-4">Cargando producto...</p>;
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {/* <img
          src={product.image}
          alt={product.name}
          className="w-full h-96 object-cover rounded-lg"
        /> */} 
        <CarouselOfImages key={product.image} images={sampleImages}/>
        <ProductInfoCard product={product}/>
      </div>
    </div>
  );
};

export default ProductDetailPage;
