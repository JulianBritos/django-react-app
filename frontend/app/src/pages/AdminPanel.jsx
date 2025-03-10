import { useEffect, useState } from "react";
import { getProducts, createProduct, deleteProduct } from "../api/products.api";
import ProductForm from "../components/ProductForm";

const AdminPanel = () => {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const data = await getProducts();
    setProducts(data);
  };

  const handleSaveProduct = async (productData) => {
    await createProduct(productData);
    setShowForm(false);
    loadProducts();
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este producto?")) {
      await deleteProduct(id);
      loadProducts();
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar lateral */}
      <aside className="w-64 bg-green-100 p-4 shadow-lg">
        <h2 className="text-2xl font-bold text-green-700 mb-6">Admin Panel</h2>
        <button
          className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancelar" : "Agregar Producto"}
        </button>
        {showForm && (
          <div className="mt-4">
            <ProductForm onSave={handleSaveProduct} />
          </div>
        )}
      </aside>

      {/* Contenido principal - cards de productos */}
      <main className="flex-1 p-6 bg-gray-50 overflow-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Productos</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white shadow rounded-lg overflow-hidden relative"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-64 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {product.name}
                </h3>
                <p className="text-gray-600">${product.price}</p>
                <button
                  className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                  onClick={() => handleDeleteProduct(product.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
