import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import ScrollableNavBar from "../components/ScrollableNavVar";
import { Button } from "./ui/Button";
import { ProductCard } from "./ProductCards";
import { useCart } from "../hooks/useCart";
import SearchAndFilterBar from "../components/ui/SearchAndFilterBar";

function CategoryPage() {
  const { categoryName } = useParams();
  const { products, categories } = useOutletContext();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categoryName || "allproducts");
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    // Filtrado inicial
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            {selectedCategory === "allproducts"
              ? "Nuestros Productos"
              : categories.find((c) => c.name === selectedCategory)?.label || selectedCategory}
          </h1>

          {/* Barra de búsqueda y filtros */}
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

        {/* Grilla de productos */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
  );
}

export default CategoryPage;
