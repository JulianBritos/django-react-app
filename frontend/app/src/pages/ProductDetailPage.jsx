import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProducts } from "../api/products.api";
import { useCart } from "../hooks/useCart";

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProducts(id);
        setProduct(data);
      } catch (error) {
        console.error("Error al obtener producto", error);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) {
    return <p className="p-4">Cargando producto...</p>;
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-96 object-cover rounded-lg"
        />
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-700 mb-4">{product.description}</p>
          <p className="text-xl font-bold text-green-600">${product.price}</p>
          <button
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => addToCart(product)}
          >
            Agregar al Carrito
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
