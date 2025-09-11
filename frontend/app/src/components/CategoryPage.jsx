import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import ScrollableNavBar from "../components/ScrollableNavVar";
import { ProductCard } from "./ProductCards";
import { useCart } from "../hooks/useCart";
import SearchAndFilterBar from "../components/ui/SearchAndFilterBar";
import FilterPanel from "./ui/FilterPanel";

function CategoryPage() {
  const { categoryName } = useParams();
  const { products, categories } = useOutletContext();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Estados
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categoryName || "allproducts");
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    filtrarProductos(searchTerm, selectedCategory);
  }, [products, selectedCategory, searchTerm]);

  const filtrarProductos = (term, category) => {
    let resultado = products;

    if (category !== "allproducts") {
      resultado = resultado.filter((p) => p.category.name === category);
    }

    if (term.trim() !== "") {
      resultado = resultado.filter((p) =>
        p.name.toLowerCase().includes(term.toLowerCase())
      );
    }

    setFilteredProducts(resultado);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    navigate(`/products/${category}`);
    setIsFilterMenuOpen(false);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div>
      <ScrollableNavBar
        categories={categories}
        onCategoryClick={handleCategoryClick}
      />

      <div className="min-h-screen bg-gray-50 p-6">
        {/* Contenedor título + barra */}
        <div className="relative mb-6 max-[480px]:flex max-[480px]:flex-col max-[480px]:items-stretch max-[480px]:gap-4">
          
          {/* Barra de búsqueda y filtros */}
          <div className="absolute left-1/2 top-0 transform -translate-x-1/2 max-[480px]:relative max-[480px]:order-1 max-[480px]:w-full max-[480px]:mb-2">
            <div className="w-full">
              <SearchAndFilterBar
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                categories={categories}
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategoryClick}
                isFilterMenuOpen={isFilterMenuOpen}
                toggleFilterMenu={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
              />
            </div>
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold text-gray-800 max-[480px]:order-2">
            {selectedCategory === "allproducts"
              ? "Nuestros Productos"
              : categories.find((c) => c.name === selectedCategory)?.label || selectedCategory}
          </h1>
        </div>

        {/* Layout con panel de filtros y productos */}
        <div className="flex gap-6">
          {isFilterMenuOpen && (
            <div className="w-64 relative">
              <FilterPanel
                categories={categories}
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategoryClick}
                onClose={() => setIsFilterMenuOpen(false)}
              />
            </div>
          )}

          {/* Grilla de productos */}
          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              <div
                className="
                  grid 
                  grid-cols-1 
                  max-[480px]:grid-cols-2   /* 👈 Dos columnas en ≤ 480px */
                  sm:grid-cols-2 
                  md:grid-cols-3 
                  lg:grid-cols-4 
                  gap-6
                "
              >
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    addToCart={addToCart}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center">No se encontraron productos.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryPage;

