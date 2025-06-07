import { Link } from "react-router-dom";

const ProductCard = ({ product, addToCart }) => {
  return (
    <div className="relative group">
      <Link
        to={`/product/${product.id}`}
        className="block border p-4 rounded-lg shadow-lg bg-gradient-to-r from-primary-500 to-primary-500 group-hover:shadow-xl transition"
      >
        <img
          src={product.image || "/placeholder.png"}
          alt={product.name}
          className="w-full h-48 object-cover mb-2 rounded"
        />
        <h2 className="text-lg font-bold text-white truncate">
          {product.name}
        </h2>
        <p className="text-gray-200 line-clamp-2">{product.description}</p>
        <p className="text-gray-100 font-bold">${product.price}</p>
        <p className="mt-2 inline-block text-sm text-white opacity-70 group-hover:underline">
          Ver Detalle
        </p>
      </Link>

      {/* Botón flotante: no navega, solo agrega al carrito */}
      <button
        onClick={(e) => {
          e.preventDefault(); // evita que el click del botón también active el Link
          addToCart(product);
        }}
        className="absolute top-2 right-2 bg-thirdary-500 text-white px-3 py-1 rounded shadow-md hover:bg-thirdary-600 z-10"
      >
        Agregar al Carrito
      </button>
    </div>
  );
};

export default ProductCard;
