import { useCart } from "../hooks/useCart";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Heart, ChevronDown } from "lucide-react";

const ProductInfoCard = ({ product }) => {
  const { addToCart } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);

  // Estado para el color seleccionado, por defecto el primer color de la lista
  // Comentado para probar funcionalidad hasta que esté el backend
  // const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || "");

  // Testeo Hardcodeado para prueba de botones
  const colors = [
    { name: "Rojo", value: "red" },
    { name: "Azul", value: "primary" },
    { name: "Verde", value: "thirdary" },
  ];

  const [selectedColor, setSelectedColor] = useState(colors[0].name);

  // Estado para la cantidad seleccionada
  const [quantity, setQuantity] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Simulación de stock si no viene del backend
  const availableStock = product.stock ?? 10;

  if (!product) {
    return <p className="p-4">Cargando producto...</p>;
  }

  const categoryLink = product.category
    ? `/products/${product.category}`
    : "/products";

  return (
    <div className="p-4 border rounded-lg shadow-lg bg-white max-w-md text text-center relative">
      <div className="flex justify-between items-center mb-2">
        {/* Enlace a la categoría del producto */}
        <div className="text-sm text-primary-500">
          <Link to={categoryLink} className="hover:underline">
            Ver más productos de esta categoría
          </Link>
        </div>
        {/* Botón de favoritos */}
        <button
          className={`text-xl ${
            isFavorite ? "text-primary-500" : "text-gray-400"
          }`}
          onClick={() => setIsFavorite(!isFavorite)}
          title="Agregar a favoritos"
        >
          <Heart fill={isFavorite ? "#3b82f6" : "none"} />
        </button>
      </div>
      <div className="flex flex-col justify-center items-start flex-grow w-full">
        <h1 className="text-3xl font-bold mb-2 my-6">
          {/* Asegurar que la primera letra del nombre del producto esté en mayúscula */}
          {product.name
            ? product.name.charAt(0).toUpperCase() + product.name.slice(1)
            : "Producto sin nombre"}
        </h1>
        <p className="text-gray-700 mb-4">
          {product.description || "Sin descripción disponible"}
        </p>
        <p className="text-5xl font-light text-gray-500">
          ${product.price ?? "Precio no disponible"}
        </p>
        {/* Botón para ver medios de pago */}
        <button className="mt-2 text-primary-500 hover:underline">
          Ver los medios de pago
        </button>
        {/* Indicador de stock */}
        <p className="text-sm font-bold text-gray-800 mt-2">
          Stock disponible: {availableStock} unidades
        </p>
        {/* Selección de cantidad */}
        <div className="mt-4 relative">
          <button
            className="text-black font-medium hover:text-gray-600 flex items-center px-4 py-2 "
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            Cantidad: {quantity} unidad{quantity > 1 ? "es" : ""}
            <ChevronDown
              className={`w-4 h-4 mr-1 m-1 transition-transform ${
                dropdownOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>
          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white shadow-lg rounded-lg z-10">
              {[...Array(availableStock)].map((_, i) => (
                <button
                  key={i}
                  className="block px-4 py-2 text-black hover:bg-gray-100 w-full text-left"
                  onClick={() => {
                    setQuantity(i + 1);
                    setDropdownOpen(false);
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Sección de selección de color */}
        <p className="text-sm font-bold text-gray-800 mt-4">
          Color: {selectedColor || "Seleccione un color"}
        </p>
        <div className="flex gap-2 mt-2">
          {/* Botones de colores con fondo de color, en el futuro se modificarán para mostrar imágenes */}
          {colors.map((color, index) => (
            <button
              key={index}
              className={`w-10 h-10 rounded-full border-2 ${
                selectedColor === color.name
                  ? "border-primary-500"
                  : "border-gray-300"
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
              onClick={() => setSelectedColor(color.name)} // Actualiza el color seleccionado
            ></button>
          ))}
        </div>

        <button
          className="mt-6  bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600 w-full self-center"
          onClick={() => product && console.log("Comprar ahora", product)}
          disabled={!product}
        >
          Comprar Ahora
        </button>
        {/* Botón de agregar al carrito */}

        <button
          className="mt-4 mb-8 bg-primary-100 text-primary-500 px-4 py-2 rounded hover:bg-primary-200 transition w-full self-center"
          onClick={() => product && addToCart(product)}
          disabled={!product}
        >
          Agregar al Carrito
        </button>
      </div>
    </div>
  );
};

export default ProductInfoCard;
