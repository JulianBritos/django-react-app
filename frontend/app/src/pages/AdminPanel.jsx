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
        const [productsRes, variantsRes, optionsRes] = await Promise.all([
          getProducts(),
          getVariants(),
          getVariantOptions(),
        ]);

        setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
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
    } catch (err) {
      console.error("Error saving product:", err);
      setError("Error al guardar el producto");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este producto?")) return;
    try {
      setIsLoading(true);
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error deleting product:", err);
      setError("Error al eliminar el producto");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
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
          <div className="mt-4 bg-white text-gray-800 p-4 rounded-lg">
            <ProductForm
              onSave={handleSaveProduct}
              variants={variants}
              variantOptions={variantOptions}
            />
          </div>
        )}
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Productos</h1>
        {isLoading ? (
          <p className="text-center text-gray-600">Cargando productos...</p>
        ) : error ? (
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
        ) : products.length === 0 ? (
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

const ProductCard = ({ product, onDelete }) => {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h3 className="text-lg font-semibold">{product.name}</h3>
      <p className="text-gray-600">${product.price}</p>
      <button
        className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
        onClick={() => onDelete(product.id)}
      >
        Eliminar
      </button>
    </div>
  );
};

export default AdminPanel;
