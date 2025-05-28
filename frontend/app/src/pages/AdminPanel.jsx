import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";

import ProductForm from "../components/formComponents/ProductForm";
import { getProducts, deleteProduct } from "../api/products.api";

const AdminPanel = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Cargar productos
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Error al cargar productos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleDeleteProduct = async (id) => {
    if (window.confirm("¿Eliminar este producto permanentemente?")) {
      try {
        await deleteProduct(id);
        setProducts(products.filter((product) => product.id !== id));
      } catch (error) {
        console.error("Error al eliminar producto:", error);
      }
    }
  };

  const handleSaveProduct = (savedProduct) => {
    if (editingProduct) {
      setProducts(
        products.map((p) => (p.id === savedProduct.id ? savedProduct : p))
      );
    } else {
      setProducts([...products, savedProduct]);
    }
    setShowProductForm(false);
    setEditingProduct(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Panel de Administración</h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowProductForm(true);
          }}
          className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600"
        >
          <Plus size={18} />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Cargando productos...</div>
      ) : (
        <>
          {showProductForm && (
            <ProductForm
              product={editingProduct}
              onSave={handleSaveProduct}
              onCancel={() => {
                setShowProductForm(false);
                setEditingProduct(null);
              }}
            />
          )}

          {products.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No hay productos registrados
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    {product.uploaded_images &&
                    product.uploaded_images.length > 0 ? (
                      <img
                        src={product.uploaded_images[0].image}
                        alt={product.name}
                        className="w-full h-64 object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/placeholder.jpg";
                        }}
                      />
                    ) : (
                      <img
                        src="/placeholder.jpg"
                        alt="Sin imagen"
                        className="w-full h-64 object-cover"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">${product.price}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setShowProductForm(true);
                          }}
                          className="text-primary-500 hover:text-primary-700"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminPanel;
