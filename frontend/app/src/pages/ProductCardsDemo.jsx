import React, { useState, useEffect } from "react";
import { getProducts } from "../api/products.api";
import { useCart } from "../hooks/useCart";
import {
  ProductCard,
  ProductCardCompact,
  ProductCardHorizontal,
  ProductCardHero,
  ProductCardMinimal,
} from "../components/ProductCards";
import { Button } from "../components/ui/Button";
import { Grid, List, Square, Star, Eye } from "lucide-react";

const ProductCardsDemo = () => {
  const [products, setProducts] = useState([]);
  const [viewMode, setViewMode] = useState("hero"); // grid, compact, horizontal, hero, minimal
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data.slice(0, 8)); // Mostrar 8 productos para la demo
      } catch (error) {
        console.error("Error al cargar productos:", error);
      }
    };
    fetchProducts();
  }, []);

  const renderProducts = () => {
    switch (viewMode) {
      case "compact":
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {products.map((product) => (
              <ProductCardCompact
                key={product.id}
                product={product}
                addToCart={addToCart}
              />
            ))}
          </div>
        );
      case "horizontal":
        return (
          <div className="space-y-4">
            {products.map((product) => (
              <ProductCardHorizontal
                key={product.id}
                product={product}
                addToCart={addToCart}
              />
            ))}
          </div>
        );
      case "hero":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCardHero key={product.id} product={product} />
            ))}
          </div>
        );
      case "minimal":
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {products.map((product) => (
              <ProductCardMinimal key={product.id} product={product} />
            ))}
          </div>
        );
      default:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                addToCart={addToCart}
              />
            ))}
          </div>
        );
    }
  };

  const getViewModeInfo = () => {
    switch (viewMode) {
      case "grid":
        return {
          title: "Vista en Cuadrícula",
          description:
            "Ideal para páginas principales y catálogos. Muestra información completa del producto con badges, calificaciones y botones de acción.",
          icon: <Grid size={20} />,
        };
      case "compact":
        return {
          title: "Vista Compacta",
          description:
            "Perfecta para grids densos y listas de productos. Muestra información esencial de manera concisa.",
          icon: <Square size={20} />,
        };
      case "horizontal":
        return {
          title: "Vista Horizontal",
          description:
            "Excelente para resultados de búsqueda y comparaciones. Muestra más información del producto en formato horizontal.",
          icon: <List size={20} />,
        };
      case "hero":
        return {
          title: "Vista Hero (Destacados)",
          description:
            "Diseñada para secciones de productos destacados. Más visual y atractiva, enfocada en generar interés para ver detalles.",
          icon: <Star size={20} />,
        };
      case "minimal":
        return {
          title: "Vista Minimalista",
          description:
            "Para mostrar muchos productos en poco espacio. Solo información esencial con diseño limpio.",
          icon: <Eye size={20} />,
        };
      default:
        return {
          title: "Vista en Cuadrícula",
          description: "Vista estándar con información completa.",
          icon: <Grid size={20} />,
        };
    }
  };

  const viewModeInfo = getViewModeInfo();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Demostración de Product Cards
          </h1>
          <p className="text-gray-600 mb-6">
            Esta página muestra los diferentes tipos de tarjetas de productos
            disponibles. Cada tipo está optimizado para diferentes contextos de
            uso.
          </p>

          {/* Controles de vista */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-medium text-gray-700">Vista:</span>
            <div className="flex bg-white rounded-lg shadow-sm border">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-l-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-primary-500 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                title="Vista en cuadrícula"
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode("compact")}
                className={`p-2 transition-colors ${
                  viewMode === "compact"
                    ? "bg-primary-500 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                title="Vista compacta"
              >
                <Square size={20} />
              </button>
              <button
                onClick={() => setViewMode("horizontal")}
                className={`p-2 transition-colors ${
                  viewMode === "horizontal"
                    ? "bg-primary-500 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                title="Vista horizontal"
              >
                <List size={20} />
              </button>
              <button
                onClick={() => setViewMode("hero")}
                className={`p-2 transition-colors ${
                  viewMode === "hero"
                    ? "bg-primary-500 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                title="Vista hero (destacados)"
              >
                <Star size={20} />
              </button>
              <button
                onClick={() => setViewMode("minimal")}
                className={`p-2 rounded-r-lg transition-colors ${
                  viewMode === "minimal"
                    ? "bg-primary-500 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                title="Vista minimalista"
              >
                <Eye size={20} />
              </button>
            </div>
          </div>

          {/* Descripción del modo actual */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              {viewModeInfo.icon}
              <h3 className="font-semibold text-blue-900">
                {viewModeInfo.title}
              </h3>
            </div>
            <p className="text-blue-800 text-sm">{viewModeInfo.description}</p>
          </div>
        </div>

        {/* Productos */}
        {products.length > 0 ? (
          renderProducts()
        ) : (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando productos...</p>
          </div>
        )}

        {/* Información adicional */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Características de las Product Cards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Badges Informativos
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Descuentos y ofertas</li>
                <li>• Estado de stock</li>
                <li>• Productos nuevos</li>
                <li>• Últimas unidades</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Información de Precio
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Precio actual y original</li>
                <li>• Porcentaje de descuento</li>
                <li>• Precios tachados</li>
                <li>• Formato de moneda</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Funcionalidades
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Botón de favoritos</li>
                <li>• Agregar al carrito</li>
                <li>• Ver detalles</li>
                <li>• Indicadores de stock</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCardsDemo;
