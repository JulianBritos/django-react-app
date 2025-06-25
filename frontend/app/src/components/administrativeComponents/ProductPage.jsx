import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Package,
  PackageOpen,
  Search,
  Filter,
  ArrowLeft,
} from "lucide-react";
import ProductForm from "../formComponents/ProductForm";
import { getProducts, deleteProduct } from "../../api/products.api";

const ProductPage = ({ onAddProduct, onEditProduct }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/apps/products/categories/`
      );
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }
  };

  const handleSaveProduct = async (savedProduct) => {
    try {
      if (editingProduct) {
        setProducts(
          products.map((p) => (p.id === savedProduct.id ? savedProduct : p))
        );
      } else {
        setProducts([...products, savedProduct]);
      }
      setShowProductForm(false);
      setEditingProduct(null);
    } catch (error) {
      console.error("Error al guardar producto:", error);
      throw error;
    }
  };

  const handleDeleteProduct = async (id) => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer."
      )
    ) {
      try {
        await deleteProduct(id);
        setProducts(products.filter((product) => product.id !== id));
      } catch (error) {
        console.error("Error al eliminar producto:", error);
        alert("Error al eliminar el producto.");
      }
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      (product.category && product.category.name === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  if (showProductForm) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => {
              setShowProductForm(false);
              setEditingProduct(null);
            }}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Volver a productos</span>
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <ProductForm
            product={editingProduct}
            onSave={handleSaveProduct}
            onCancel={() => {
              setShowProductForm(false);
              setEditingProduct(null);
            }}
          />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Gestión de Productos
          </h1>
          <p className="text-gray-600 mt-2">
            Administra los productos de tu tienda
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowProductForm(true);
          }}
          className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus size={18} />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="relative">
            <Filter
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              size={20}
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-white"
            >
              <option value="all">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de productos */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Lista de Productos
        </h2>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Package size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No hay productos encontrados</p>
            <p className="text-sm">
              {products.length === 0
                ? "Comienza creando tu primer producto"
                : "Intenta ajustar los filtros de búsqueda"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white"
              >
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  {product.product_attributes &&
                  product.product_attributes.length > 0 &&
                  product.product_attributes[0].uploaded_images &&
                  product.product_attributes[0].uploaded_images.length > 0 ? (
                    <img
                      src={
                        product.product_attributes[0].uploaded_images[0].image
                      }
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/placeholder.jpg";
                      }}
                    />
                  ) : (
                    <Package size={48} className="text-gray-400" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">
                      {product.category
                        ? product.category.name
                        : "Sin categoría"}
                    </span>
                    <span className="font-medium text-primary-600">
                      ${product.product_attributes?.[0]?.selling_price || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Stock: {product.product_attributes?.[0]?.stock || 0}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setShowProductForm(true);
                        }}
                        className="text-blue-500 hover:text-blue-700 p-1 rounded"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total de Productos
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {products.length}
              </p>
            </div>
            <Package size={24} className="text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Productos Activos
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {products.filter((p) => p.status === "ACTIVE").length}
              </p>
            </div>
            <PackageOpen size={24} className="text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Con Stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  products.filter(
                    (p) =>
                      p.product_attributes &&
                      p.product_attributes.some((attr) => attr.stock > 0)
                  ).length
                }
              </p>
            </div>
            <Package size={24} className="text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sin Stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  products.filter(
                    (p) =>
                      !p.product_attributes ||
                      p.product_attributes.every((attr) => attr.stock === 0)
                  ).length
                }
              </p>
            </div>
            <Package size={24} className="text-red-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
