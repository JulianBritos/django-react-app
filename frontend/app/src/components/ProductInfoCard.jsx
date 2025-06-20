import { useCart } from "../hooks/useCart";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getAttributeById } from "../api/attributes.api";
import { Heart, ChevronDown } from "lucide-react";
import AttributeSelector from "./ui/AttributeSelector";

const ProductInfoCard = ({ product, onAttributeSelect, selectedAttribute }) => {
  const { addToCart } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Estado para los atributos con nombre
  const [attributesWithNames, setAttributesWithNames] = useState([]);

  useEffect(() => {
    if (product?.product_attributes?.length > 0 && !selectedAttribute) {
      onAttributeSelect(product.product_attributes[0]);
    }
  }, [product]);

  // Cargar los nombres de los atributos
  useEffect(() => {
    const fetchAttributeNames = async () => {
      if (!product?.product_attributes) return;
      // Obtener los IDs únicos de atributos (pueden venir como array)
      const attributeIds = [
        ...new Set(
          product.product_attributes.flatMap((attr) =>
            Array.isArray(attr.attribute) ? attr.attribute : [attr.attribute]
          )
        ),
      ];
      // Consultar los nombres de los atributos
      const attributesData = await Promise.all(
        attributeIds.map((id) => getAttributeById(id))
      );
      setAttributesWithNames(
        attributesData.map((attr) => ({ id: attr.id, name: attr.name }))
      );
    };
    fetchAttributeNames();
  }, [product]);

  if (!product) {
    return <p className="p-4">Cargando producto...</p>;
  }

  // Calcular el stock disponible basado en el atributo seleccionado
  const availableStock = selectedAttribute?.stock ?? product.stock ?? 0;

  // Obtener el precio actual basado en el atributo seleccionado
  const currentPrice = selectedAttribute?.selling_price ?? product.price;

  const categoryLink = product.category
    ? `/products/${product.category}`
    : "/products";

  // Función auxiliar para obtener el nombre de la opción del atributo
  const getAttributeOptionName = (attr) => {
    const attributeOption = attr.attributeoption?.[0];
    return attributeOption
      ? `${attr.attribute_name}: ${attributeOption}`
      : "Sin opción";
  };

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

        <div
          className="prose prose-sm max-w-none mb-4"
          dangerouslySetInnerHTML={{
            __html: product.description || "Sin descripción disponible",
          }}
        />

        {/* Sección de precio */}
        <p className="text-5xl font-light text-gray-500">${currentPrice}</p>

        {/* Sección de atributos */}
        {attributesWithNames.length > 0 && (
          <div className="mt-4 w-full">
            <h3 className="text-lg font-semibold mb-3">
              Variantes disponibles
            </h3>
            <AttributeSelector
              attributes={attributesWithNames}
              selectedAttribute={selectedAttribute}
              onAttributeSelect={onAttributeSelect}
            />
          </div>
        )}

        {/* Selector de cantidad */}
        <div className="mt-4 relative w-full">
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

        {/* Botones de acción */}
        <button
          className="mt-6 bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600 w-full self-center"
          onClick={() =>
            selectedAttribute && console.log("Comprar ahora", selectedAttribute)
          }
          disabled={!selectedAttribute || availableStock === 0}
        >
          Comprar Ahora
        </button>

        <button
          className="mt-4 mb-8 bg-primary-100 text-primary-500 px-4 py-2 rounded hover:bg-primary-200 transition w-full self-center"
          onClick={() =>
            selectedAttribute &&
            addToCart({
              ...product,
              selectedVariant: selectedAttribute,
              quantity,
            })
          }
          disabled={!selectedAttribute || availableStock === 0}
        >
          Agregar al Carrito
        </button>
      </div>
    </div>
  );
};

export default ProductInfoCard;
