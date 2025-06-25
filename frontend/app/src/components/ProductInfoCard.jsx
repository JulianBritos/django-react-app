import { useCart } from "../hooks/useCart";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Heart, ChevronDown, Package, AlertCircle } from "lucide-react";
import AttributeSelector from "./ui/AttributeSelector";

const ProductInfoCard = ({
  product,
  selectedVariant,
  availableVariants,
  onVariantSelect,
  onAttributeSelection,
}) => {
  const { addToCart } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Extraer atributos únicos de todas las variantes
  const [uniqueAttributes, setUniqueAttributes] = useState([]);

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest(".quantity-dropdown")) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    if (availableVariants && availableVariants.length > 0) {
      // Obtener todos los atributos únicos de todas las variantes
      const allAttributes = availableVariants.flatMap(
        (variant) => variant.attributes || []
      );

      // Agrupar por attribute_id para obtener atributos únicos
      const attributeMap = new Map();
      allAttributes.forEach((attr) => {
        if (!attributeMap.has(attr.attribute_id)) {
          attributeMap.set(attr.attribute_id, {
            id: attr.attribute_id,
            name: attr.attribute_name,
            options: [],
          });
        }
        // Agregar la opción si no existe
        const existingOption = attributeMap
          .get(attr.attribute_id)
          .options.find((opt) => opt.id === attr.option_id);
        if (!existingOption) {
          attributeMap.get(attr.attribute_id).options.push({
            id: attr.option_id,
            name: attr.option_name,
          });
        }
      });

      setUniqueAttributes(Array.from(attributeMap.values()));
    }
  }, [availableVariants]);

  if (!product) {
    return <p className="p-4">Cargando producto...</p>;
  }

  // Calcular el stock disponible basado en la variante seleccionada
  const availableStock = selectedVariant?.stock || 0;

  // Obtener el precio actual basado en la variante seleccionada
  const currentPrice = selectedVariant?.selling_price || product.price || 0;

  const categoryLink = product.category
    ? `/products/${product.category}`
    : "/products";

  return (
    <div className="p-6 border rounded-lg shadow-lg bg-white max-w-md text-left">
      <div className="flex justify-between items-center mb-4">
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

      <div className="space-y-6">
        {/* Nombre del producto */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {product.name || "Producto sin nombre"}
          </h1>
          <p className="text-gray-600 text-sm">
            {product.category?.name || "Sin categoría"}
          </p>
        </div>

        {/* Descripción */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Descripción
          </h3>
          <div
            className="prose prose-sm max-w-none text-gray-600"
            dangerouslySetInnerHTML={{
              __html: product.description || "Sin descripción disponible",
            }}
          />
        </div>

        {/* Precio */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Precio:</span>
            <span className="text-3xl font-bold text-primary-600">
              ${currentPrice.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Atributos y variantes */}
        {uniqueAttributes.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Variantes disponibles
            </h3>
            <AttributeSelector
              attributes={uniqueAttributes}
              onSelectionChange={onAttributeSelection}
            />
          </div>
        )}

        {/* Información de la variante seleccionada */}
        {selectedVariant && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">
              Variante seleccionada:
            </h4>
            <div className="space-y-2">
              {selectedVariant.attributes?.map((attr, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600">{attr.attribute_name}:</span>
                  <span className="font-medium">{attr.option_name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stock y cantidad */}
        <div className="space-y-4">
          {/* Información de stock */}
          <div className="flex items-center gap-2">
            <Package size={20} className="text-gray-500" />
            <span className="text-sm text-gray-600">
              Stock disponible:{" "}
              <span className="font-medium">{availableStock}</span>
            </span>
          </div>

          {availableStock === 0 && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle size={20} />
              <span className="text-sm font-medium">Producto agotado</span>
            </div>
          )}

          {/* Selector de cantidad */}
          {availableStock > 0 && (
            <div className="relative quantity-dropdown">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad
              </label>
              <button
                className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span className="text-gray-900">
                  {quantity} unidad{quantity > 1 ? "es" : ""}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    dropdownOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {[...Array(Math.min(availableStock, 20))].map((_, i) => (
                    <button
                      key={i}
                      className="block w-full px-4 py-2 text-left text-gray-900 hover:bg-gray-100 transition-colors"
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
          )}
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          <button
            className="w-full bg-primary-500 text-white py-3 px-4 rounded-lg hover:bg-primary-600 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
            onClick={() => {
              if (selectedVariant) {
                console.log("Comprar ahora", {
                  product,
                  selectedVariant,
                  quantity,
                });
                // Aquí iría la lógica de compra
              }
            }}
            disabled={!selectedVariant || availableStock === 0}
          >
            {availableStock === 0 ? "Agotado" : "Comprar Ahora"}
          </button>

          <button
            className="w-full bg-primary-100 text-primary-600 py-3 px-4 rounded-lg hover:bg-primary-200 transition-colors font-medium disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            onClick={() => {
              if (selectedVariant && availableStock > 0) {
                addToCart({
                  ...product,
                  selectedVariant,
                  quantity,
                });
              }
            }}
            disabled={!selectedVariant || availableStock === 0}
          >
            Agregar al Carrito
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductInfoCard;
