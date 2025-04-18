import { useEffect, useState } from "react";
import { FiFilter, FiEdit, FiSearch, FiPlus } from "react-icons/fi";
import ProductForm3 from "./ProductForm3";

function AdminComponent({ products, categories }) {
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("allproducts");
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // 🔧 Actualizar productos filtrados cuando cambian los productos originales
  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setIsFilterMenuOpen(false);

    const filtered = category === "allproducts"
      ? products
      : products.filter((product) => product.category === category);

    setFilteredProducts(filtered);
    setSearchTerm("");
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = products
      .filter((product) =>
        product.category === selectedCategory || selectedCategory === "allproducts"
      )
      .filter((product) => product.name.toLowerCase().includes(term));

    setFilteredProducts(filtered);
  };

  const handleOpenProductForm = (product = null) => {
    setSelectedProduct(product);
    setIsProductFormOpen(true);
  };

  const handleCloseProductForm = () => {
    setIsProductFormOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="admin-page p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {selectedCategory === "allproducts"
            ? "Todos los Productos"
            : categories.find(c => c.name === selectedCategory)?.label}
        </h1>

        <div className="flex-1 flex justify-center items-center gap-4">
          <div className="relative w-2/5 min-w-[300px]">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar productos"
              value={searchTerm}
              onChange={handleSearch}
              className="border p-2 pl-10 rounded-lg text-lg font-medium w-full"
            />
          </div>

          <div className="relative group">
            <button
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
              className="flex items-center justify-center bg-gray-200 p-2 rounded-full hover:bg-gray-300 transition relative"
            >
              <FiFilter className="text-xl" />
            </button>
            <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              Filtrar
            </span>

            {isFilterMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg p-2 z-10">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => handleCategoryClick(category.name)}
                    className={`block w-full text-left px-4 py-2 rounded-md hover:bg-gray-100 ${selectedCategory === category.name ? 'font-bold' : ''}`}
                  >
                    {category.label}
                  </button>
                ))}
                <button
                  onClick={() => handleCategoryClick("allproducts")}
                  className="block w-full text-left px-4 py-2 rounded-md text-red-600 hover:bg-red-100"
                >
                  Quitar filtros
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => handleOpenProductForm()}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          <FiPlus /> Nuevo Producto
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div key={product.id} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <img
                src={product.uploaded_images?.[0]?.image || "/placeholder.jpg"}
                alt={product.name}
                className="w-full h-64 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                <p className="text-gray-600">${product.price}</p>
                <button
                  onClick={() => handleOpenProductForm(product)}
                  className="w-full mt-4 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition flex items-center justify-center gap-2"
                >
                  <FiEdit /> Editar producto
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 col-span-full text-center">No se encontraron productos.</p>
        )}
      </div>

      {isProductFormOpen && (
        <ProductForm3
          product={selectedProduct}
          onSave={(savedProduct) => {
            console.log("Producto guardado:", savedProduct);
            setIsProductFormOpen(false);
            setSelectedProduct(null);
          }}
          onCancel={handleCloseProductForm}
        />
      )}
    </div>
  );
}

export default AdminComponent;