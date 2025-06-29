import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import ScrollableNavBar from "../components/ScrollableNavVar";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/Button";
import { ProductCard } from "./ProductCards";
import { useCart } from "../hooks/useCart";

function CategoryPage() {
  const { categoryName } = useParams();
  const { products, categories } = useOutletContext();
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const { addToCart } = useCart();

  const filteredProducts =
    categoryName === "allproducts"
      ? products
      : products.filter((product) => product.category.name === categoryName);

  const handleCategoryClick = (category) => {
    navigate(`/products/${category.name}`);
  };

  return (
    <div>
      <ScrollableNavBar
        categories={categories}
        onCategoryClick={handleCategoryClick}
      />

      <div className="min-h-screen bg-gray-50 p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          {categoryName === "allproducts" ? "Nuestros Productos" : categoryName}
        </h1>

        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="mb-4"
        >
          {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
        </Button>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              addToCart={addToCart}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategoryPage;
