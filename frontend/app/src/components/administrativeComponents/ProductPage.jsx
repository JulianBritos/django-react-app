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
  ChevronDown,
  ChevronRight,
  Tag,
  Info,
} from "lucide-react";
import ProductForm from "../formComponents/ProductForm";
import { getProducts, deleteProduct } from "../../api/products.api";
import { Button } from "../ui/Button";
import { StatCard, ContentCard } from "../ui/Card";

const ProductPage = ({ onAddProduct, onEditProduct }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [expandedProducts, setExpandedProducts] = useState(new Set());

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await getProducts();
      // Asegurarse de que data sea un array
      const productsArray = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : [];
      setProducts(productsArray);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      setProducts([]);
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
      // Asegurarse de que data sea un array
      const categoriesArray = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : [];
      setCategories(categoriesArray);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
      setCategories([]);
    }
  };

  const handleSaveProduct = (savedProduct) => {
    try {
      const currentProducts = Array.isArray(products) ? products : [];
      if (editingProduct) {
        setProducts(
          currentProducts.map((p) =>
            p.id === savedProduct.id ? savedProduct : p
          )
        );
      } else {
        setProducts([...currentProducts, savedProduct]);
      }
      setEditingProduct(null);

      // Cierra el formulario después de 5 segundos
      setTimeout(() => {
        setShowProductForm(false);
      }, 5000);
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
        const currentProducts = Array.isArray(products) ? products : [];
        setProducts(currentProducts.filter((product) => product.id !== id));
      } catch (error) {
        console.error("Error al eliminar producto:", error);
        alert("Error al eliminar el producto.");
      }
    }
  };

  // Asegurarse de que products y categories sean arrays antes de usar métodos de array
  const safeProducts = Array.isArray(products) ? products : [];
  const safeCategories = Array.isArray(categories) ? categories : [];

  const filteredProducts = safeProducts.filter((product) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      (product.category && product.category.name === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const toggleProductExpansion = (productId) => {
    setExpandedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const expandAllProducts = () => {
    setExpandedProducts(new Set(filteredProducts.map((product) => product.id)));
  };

  const collapseAllProducts = () => {
    setExpandedProducts(new Set());
  };

  const getAttributeGroups = (attributes) => {
    if (!attributes || attributes.length === 0) return [];

    const groups = {};
    attributes.forEach((attr) => {
      const attributeName = attr.attribute_name || "Sin nombre";
      if (!groups[attributeName]) {
        groups[attributeName] = [];
      }
      groups[attributeName].push(attr.option_name || "Sin opción");
    });

    return Object.entries(groups).map(([attributeName, options]) => ({
      attributeName,
      options: [...new Set(options)], // Eliminar duplicados
    }));
  };

  const getProductAttributeSummary = (product) => {
    if (
      !product.product_attributes ||
      product.product_attributes.length === 0
    ) {
      return null;
    }

    const allAttributes = product.product_attributes.flatMap(
      (variant) => variant.attributes || []
    );

    if (allAttributes.length === 0) {
      return null;
    }

    const groups = getAttributeGroups(allAttributes);
    return groups
      .map((group) => `${group.attributeName}: ${group.options.join(", ")}`)
      .join(" | ");
  };

  if (showProductForm) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => {
              setShowProductForm(false);
              setEditingProduct(null);
            }}
            className="flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Volver a productos</span>
          </Button>
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
        <Button
          variant="primary"
          onClick={() => {
            setEditingProduct(null);
            setShowProductForm(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus size={18} />
          <span>Nuevo Producto</span>
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mt-6 mb-6">
        <StatCard
          title="Total de Productos"
          value={safeProducts.length}
          icon={<Package size={24} className="text-blue-500" />}
        />

        <StatCard
          title="Productos Activos"
          value={safeProducts.filter((p) => p.status === "ACTIVE").length}
          icon={<PackageOpen size={24} className="text-green-500" />}
        />

        <StatCard
          title="Con Stock"
          value={
            safeProducts.filter(
              (p) =>
                p.product_attributes &&
                p.product_attributes.some((attr) => attr.stock > 0)
            ).length
          }
          icon={<Package size={24} className="text-purple-500" />}
        />

        <StatCard
          title="Sin Stock"
          value={
            safeProducts.filter(
              (p) =>
                !p.product_attributes ||
                p.product_attributes.every((attr) => attr.stock === 0)
            ).length
          }
          icon={<Package size={24} className="text-red-500" />}
        />

        <StatCard
          title="Con Variantes"
          value={
            safeProducts.filter(
              (p) =>
                p.product_attributes &&
                p.product_attributes.length > 0 &&
                p.product_attributes.some(
                  (attr) => attr.attributes && attr.attributes.length > 0
                )
            ).length
          }
          icon={<Tag size={24} className="text-purple-500" />}
        />
      </div>

      {/* Filtros y búsqueda */}
      <ContentCard className="mb-6">
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
              {safeCategories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </ContentCard>

      {/* Lista de productos */}
      <ContentCard
        title="Lista de Productos"
        headerActions={
          filteredProducts.length > 0 ? (
            <div className="flex gap-2">
              <span className="text-sm text-gray-500 flex items-center">
                {expandedProducts.size} de {filteredProducts.length} expandidos
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={expandAllProducts}
                className="flex items-center gap-2"
                title="Expandir todos los productos"
              >
                <ChevronDown size={16} />
                Expandir todo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={collapseAllProducts}
                className="flex items-center gap-2"
                title="Contraer todos los productos"
              >
                <ChevronRight size={16} />
                Contraer todo
              </Button>
            </div>
          ) : null
        }
      >
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Package size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No hay productos encontrados</p>
            <p className="text-sm">
              {safeProducts.length === 0
                ? "Comienza creando tu primer producto"
                : "Intenta ajustar los filtros de búsqueda"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => {
              const isExpanded = expandedProducts.has(product.id);
              const hasAttributes =
                product.product_attributes &&
                product.product_attributes.length > 0;

              return (
                <div
                  key={product.id}
                  className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white"
                >
                  {/* Header del producto */}
                  <div className="flex items-center p-4 border-b bg-gray-50">
                    <div className="flex-1 flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {product.product_attributes &&
                        product.product_attributes.length > 0 &&
                        product.product_attributes[0].uploaded_images &&
                        product.product_attributes[0].uploaded_images.length >
                          0 ? (
                          <img
                            src={
                              product.product_attributes[0].uploaded_images[0]
                                .image
                            }
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/placeholder.jpg";
                            }}
                          />
                        ) : (
                          <Package size={24} className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">
                          {product.name}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-1">
                          {product.description}
                        </p>
                        {getProductAttributeSummary(product) && (
                          <p className="text-xs text-blue-600 mt-1 line-clamp-1">
                            {getProductAttributeSummary(product)}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-gray-500">
                            {product.category
                              ? product.category.name
                              : "Sin categoría"}
                          </span>
                          <span className="text-sm font-medium text-primary-600">
                            $
                            {product.product_attributes?.[0]?.selling_price ||
                              "N/A"}
                          </span>
                          <span className="text-xs text-gray-500">
                            Stock: {product.product_attributes?.[0]?.stock || 0}
                          </span>
                          {hasAttributes && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              {product.product_attributes.length} variante
                              {product.product_attributes.length !== 1
                                ? "s"
                                : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleProductExpansion(product.id)}
                        className="p-2 transition-colors"
                        title={
                          isExpanded ? "Contraer detalles" : "Expandir detalles"
                        }
                      >
                        {isExpanded ? (
                          <ChevronDown size={20} />
                        ) : (
                          <ChevronRight size={20} />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingProduct(product);
                          setShowProductForm(true);
                        }}
                        className=" p-2  transition-colors"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteProduct(product.id)}
                        className=" p-2 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>

                  {/* Contenido expandible */}
                  {isExpanded && (
                    <div className="p-4 bg-gray-50">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Información básica del producto */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                            <Info size={20} />
                            <span>Información del Producto</span>
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Nombre:</span>
                              <span className="font-medium">
                                {product.name}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Categoría:</span>
                              <span className="font-medium">
                                {product.category
                                  ? product.category.name
                                  : "Sin categoría"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Estado:</span>
                              <span
                                className={`font-medium px-2 py-1 rounded-full text-xs ${
                                  product.status === "ACTIVE"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {product.status === "ACTIVE"
                                  ? "Activo"
                                  : "Inactivo"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Fecha de creación:
                              </span>
                              <span className="font-medium">
                                {new Date(
                                  product.created_at
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <div className="mt-4">
                            <h4 className="font-medium text-gray-800 mb-2">
                              Descripción:
                            </h4>
                            <p className="text-gray-600 text-sm bg-white p-3 rounded-lg border">
                              {product.description || "Sin descripción"}
                            </p>
                          </div>
                        </div>

                        {/* Atributos y variantes */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                            <Tag size={20} />
                            <span>Atributos y Variantes</span>
                          </div>

                          {hasAttributes ? (
                            <div className="space-y-3">
                              {product.product_attributes.map(
                                (variant, index) => (
                                  <div
                                    key={index}
                                    className="bg-white p-4 rounded-lg border"
                                  >
                                    <div className="flex justify-between items-start mb-3">
                                      <h5 className="font-medium text-gray-800">
                                        Variante #{index + 1}
                                      </h5>
                                      <div className="text-right">
                                        <div className="font-medium text-primary-600">
                                          ${variant.selling_price || "N/A"}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                          Stock: {variant.stock || 0}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Atributos de esta variante */}
                                    {variant.attributes &&
                                    variant.attributes.length > 0 ? (
                                      <div className="space-y-2">
                                        <h6 className="text-sm font-medium text-gray-700">
                                          Atributos:
                                        </h6>
                                        <div className="flex flex-wrap gap-2">
                                          {getAttributeGroups(
                                            variant.attributes
                                          ).map((group, groupIndex) => (
                                            <span
                                              key={groupIndex}
                                              className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                            >
                                              {group.attributeName}:{" "}
                                              {group.options.join(", ")}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="text-sm text-gray-500">
                                        Sin atributos específicos
                                      </p>
                                    )}

                                    {/* SKU */}
                                    {variant.sku && (
                                      <div className="mt-2">
                                        <span className="text-sm text-gray-600">
                                          SKU:{" "}
                                        </span>
                                        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                          {variant.sku}
                                        </span>
                                      </div>
                                    )}

                                    {/* Imágenes de la variante */}
                                    {variant.uploaded_images &&
                                      variant.uploaded_images.length > 0 && (
                                        <div className="mt-3">
                                          <h6 className="text-sm font-medium text-gray-700 mb-2">
                                            Imágenes (
                                            {variant.uploaded_images.length}):
                                          </h6>
                                          <div className="grid grid-cols-4 gap-2">
                                            {variant.uploaded_images.map(
                                              (img, imgIndex) => (
                                                <div
                                                  key={imgIndex}
                                                  className="relative group"
                                                >
                                                  <img
                                                    src={img.image}
                                                    alt={`Imagen ${
                                                      imgIndex + 1
                                                    }`}
                                                    className="w-full h-16 object-cover rounded border cursor-pointer hover:opacity-75 transition-opacity"
                                                    onError={(e) => {
                                                      e.target.onerror = null;
                                                      e.target.src =
                                                        "/placeholder.jpg";
                                                    }}
                                                    onClick={() =>
                                                      window.open(
                                                        img.image,
                                                        "_blank"
                                                      )
                                                    }
                                                    title="Hacer clic para ver en tamaño completo"
                                                  />
                                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded flex items-center justify-center">
                                                    <span className="text-white text-xs opacity-0 group-hover:opacity-100">
                                                      Ver
                                                    </span>
                                                  </div>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <div className="bg-white p-4 rounded-lg border text-center text-gray-500">
                              <Package
                                size={32}
                                className="mx-auto mb-2 text-gray-300"
                              />
                              <p>
                                Este producto no tiene variantes configuradas
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ContentCard>
    </div>
  );
};

export default ProductPage;
