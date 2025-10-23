import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import ScrollableNavBar from "../components/ScrollableNavVar";
import { ProductCard, ProductCardMobile } from "./ProductCards";
import { useCart } from "../hooks/useCart";
import SearchAndFilterBar from "../components/ui/SearchAndFilterBar";
import FilterPanel from "./ui/FilterPanel";
import SearchAndFilterBar from "../components/ui/SearchAndFilterBar";

function CategoryPage() {
  const { categoryName, subCategoryName } = useParams();
  const { products, categories } = useOutletContext();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categoryName || "allproducts");
  const [selectedSubCategory, setSelectedSubCategory] = useState(subCategoryName || null);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 480);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    filtrarProductos();
  }, [products, selectedCategory, selectedSubCategory, searchTerm, selectedFilters]);

  useEffect(() => {
    setSelectedCategory(categoryName || "allproducts");
    setSelectedSubCategory(subCategoryName || null);
  }, [categoryName, subCategoryName]);

  const filtrarProductos = () => {
    let resultado = products;

    if (selectedCategory !== "allproducts") {
      resultado = resultado.filter((p) => p.category.name === selectedCategory);
    }

    if (selectedSubCategory) {
      resultado = resultado.filter(
        (p) => p.sub_category?.name === selectedSubCategory
      );
    }

    if (searchTerm.trim() !== "") {
      resultado = resultado.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedFilters.includes("En stock")) {
      resultado = resultado.filter((p) => p.stock > 0);
    }
    if (selectedFilters.includes("En oferta")) {
      resultado = resultado.filter((p) => p.discount > 0);
    }

    setFilteredProducts(resultado);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setSelectedSubCategory(null);
    navigate(`/products/${category}`);
    setIsFilterMenuOpen(false);
  };

  const handleSubCategoryClick = (subCategory) => {
    setSelectedSubCategory(subCategory);
    navigate(`/products/${selectedCategory}/${subCategory}`);
    setIsFilterMenuOpen(false);
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleClearFilters = () => setSelectedFilters([]);
  const handleCloseMobileModal = () => {
    filtrarProductos(); 
    setIsFilterMenuOpen(false);
  };

  // Breadcrumb
  const breadcrumbs = [
    { label: "Nuestros Productos", clickable: true },
  ];
  if (selectedCategory && selectedCategory !== "allproducts") {
    breadcrumbs.push({ label: selectedCategory, clickable: true });
  }
  if (selectedSubCategory) {
    breadcrumbs.push({ label: selectedSubCategory, clickable: true });
  }

  const handleBreadcrumbClick = (index) => {
    if (index === 0) {
      navigate("/products/allproducts");
      setSelectedCategory("allproducts");
      setSelectedSubCategory(null);
    } else if (index === 1) {
      navigate(`/products/${selectedCategory}`);
      setSelectedSubCategory(null);
    } else if (index === 2) {
      navigate(`/products/${selectedCategory}/${selectedSubCategory}`);
    }
  };

  return (
    <div>
      <ScrollableNavBar
        categories={categories}
        onCategoryClick={handleCategoryClick}
      />

      <div className="min-h-screen bg-gray-50 p-6">
        {/* Breadcrumb */}
        <nav className="text-gray-600 mb-4 flex flex-wrap items-center gap-1">
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className="flex items-center">
              {crumb.clickable ? (
                <button
                  className="text-3xl font-bold text-gray-800 hover:underline"
                  onClick={() => handleBreadcrumbClick(index)}
                >
                  {crumb.label}
                </button>
              ) : (
                <span className="text-3xl font-bold text-gray-800">{crumb.label}</span>
              )}
              {index < breadcrumbs.length - 1 && (
                <span className="mx-1 text-3xl font-bold">/</span>
              )}
            </span>
          ))}
        </nav>

        {/* Barra de búsqueda y filtros siempre debajo del breadcrumb */}
        <div className="mb-6 w-full flex justify-center">
          <div className="w-full max-w-5xl">
            <SearchAndFilterBar
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              categories={categories}
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategoryClick}
              isFilterMenuOpen={isFilterMenuOpen}
              toggleFilterMenu={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
              selectedFilters={selectedFilters}
            />
          </div>
        </div>

        {/* Layout con panel de filtros y productos */}
        <div className="flex gap-6">
          {isFilterMenuOpen &&
            (isMobile ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg max-h-[90vh] overflow-y-auto">
                  <FilterPanel
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategorySelect={handleCategoryClick}
                    onClose={handleCloseMobileModal}
                    selectedFilters={selectedFilters}
                    setSelectedFilters={setSelectedFilters}
                    onClearFilters={handleClearFilters}
                    isMobile={true} // <-- preserve mobile behavior
                  />
                </div>
              </div>
            ) : (
              <FilterPanel
                categories={categories}
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategoryClick}
                onClose={() => setIsFilterMenuOpen(false)}
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}
                onClearFilters={handleClearFilters}
                isMobile={false} // <-- apply desktop sticky/self-start + max-height
              />
            ))}

          {/* Grilla de productos */}
          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              <div
                className="
                  grid 
                  grid-cols-1 
                  max-[1020px]:grid-cols-2   
                  sm:grid-cols-2 
                  md:grid-cols-3 
                  lg:grid-cols-4 
                  gap-6
                "
              >
                {filteredProducts.map((product) =>
                  isMobile ? (
                    <ProductCardMobile
                      key={product.id}
                      product={product}
                      addToCart={addToCart}
                    />
                  ) : (
                    <ProductCard
                      key={product.id}
                      product={product}
                      addToCart={addToCart}
                    />
                  )
                )}
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

