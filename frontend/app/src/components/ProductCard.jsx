import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  return (
    <div className="border p-4 rounded-lg shadow-lg bg-gradient-to-r from-primary-500 to-primary-500">
      <img
        src={product.image || "/placeholder.png"}
        alt={product.name}
        className="w-full h-48 object-cover mb-2 rounded"
      />
      <h2 className="text-lg font-bold text-white truncate">{product.name}</h2>
      <p className="text-gray-200 line-clamp-2">{product.description}</p>
      <p className="text-gray-100 font-bold">${product.price}</p>
      <Link
        to={`/product/${product.id}`}
        className="mt-2 inline-block bg-gray-500 text-white px-4 py-2 rounded hover:bg-primary-600"
      >
        Ver Detalle
      </Link>
      <button
        className="bg-thirdary-500 text-white px-3 py-1 rounded"
        onClick={() => addToCart(product)}
      >
        Agregar al Carrito
      </button>
    </div>
  );
};

export default ProductCard;
