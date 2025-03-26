import { useEffect, useState } from "react";
import { getProducts, createProduct, deleteProduct } from "../api/products.api";
import { getVariants, getVariantOptions } from "../api/variants.api";
import ProductForm from "../components/ProductForm";

const AdminPanel = () => {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [variants, setVariants] = useState([]);
  const [variantOptions, setVariantOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const productsResponse = await getProducts();
        const variantsRes = await getVariants();
        const optionsRes = await getVariantOptions();

        console.log("Variants Response:", variantsRes);

        // Asegurar que siempre tenemos un array
        setProducts(
          Array.isArray(productsResponse.data) ? productsResponse.data : []
        );
        setVariants(Array.isArray(variantsRes.data) ? variantsRes.data : []);
        setVariantOptions(
          Array.isArray(optionsRes.data) ? optionsRes.data : []
        );
      } catch (err) {
        setError(err.message);
        console.error("Error loading data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSaveProduct = async (productData) => {
    try {
      setIsLoading(true);
      const response = await createProduct(productData);
      setProducts((prev) => [...prev, response.data]);
      setShowForm(false);
    } catch (error) {
      console.error("Error saving product:", error);
      setError("Error al guardar el producto");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este producto?")) {
      try {
        setIsLoading(true);
        await deleteProduct(id);
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } catch (error) {
        console.error("Error deleting product:", error);
        setError("Error al eliminar el producto");
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div
            className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full"
            role="status"
          >
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        <h2 className="text-xl font-bold">Error</h2>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Recargar
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar lateral */}
      <aside className="w-full bg-green-800 text-white p-4 shadow-lg">
        <h2 className="text-2xl font-bold mb-6 pt-4">Admin Panel</h2>
        <button
          className={`w-full py-2 rounded-md transition mb-4 ${
            showForm
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancelar" : "Agregar Producto"}
        </button>

        {showForm && (
          <div className="flex mt-4 bg-white text-gray-800 p-4 rounded-lg">
            <ProductForm
              onSave={handleSaveProduct}
              variants={variants}
              variantOptions={variantOptions}
            />
          </div>
        )}
      </aside>

      {/* Contenido principal - cards de productos */}
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Productos</h1>

        {!products || products.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No hay productos registrados</p>
            <button
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={() => setShowForm(true)}
            >
              Crear Primer Producto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onDelete={handleDeleteProduct}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

// Componente de tarjeta de producto completo
const ProductCard = ({ product, onDelete }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = product.uploaded_images || [];
  const mainImage =
    images.length > 0 ? images[currentImageIndex]?.image : "/placeholder.jpg";

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden transition-all hover:shadow-lg relative">
      {/* Controles de imagen si hay múltiples */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrevImage();
            }}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full"
          >
            &lt;
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNextImage();
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full"
          >
            &gt;
          </button>
        </>
      )}

      {/* Imagen principal */}
      <div
        className="relative h-48 overflow-hidden cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          {currentImageIndex + 1}/{images.length}
        </div>
      </div>

      {/* Botón de eliminar */}
      <button
        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(product.id);
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Información básica */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
        <p className="text-gray-600">${product.price}</p>

        {/* Detalles expandibles */}
        {showDetails && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm text-gray-600 mb-2">{product.description}</p>

            {/* Variantes del producto */}
            {product.product_variants?.length > 0 && (
              <div className="mt-2">
                <h4 className="font-medium text-sm mb-1">Variantes:</h4>
                <ul className="space-y-1">
                  {product.product_variants.map((variant, i) => (
                    <li key={i} className="flex justify-between text-xs">
                      <span className="font-medium">{variant.sku}</span>
                      <span>
                        ${variant.price} | Stock: {variant.stock}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Categoría */}
            {product.category && (
              <div className="mt-2">
                <span className="text-xs bg-gray-200 rounded-full px-2 py-1">
                  {product.category.name}
                </span>
              </div>
            )}
          </div>
        )}

        <button
          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? "Ocultar detalles" : "Ver detalles"}
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;
