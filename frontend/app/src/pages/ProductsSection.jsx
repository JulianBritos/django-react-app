import { useEffect, useState } from "react";
import { getProducts } from "../api/products.api";
import { getCategories } from "../api/categories.api";
import { Outlet } from "react-router-dom";

const ProductsSection = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      // Asegurarse de que data sea un array
      const productsArray = Array.isArray(data) ? data : (Array.isArray(data?.results) ? data.results : []);
      setProducts(productsArray);
    } catch (error) {
      console.error("Error loading products", error);
      setProducts([]);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      // Asegurarse de que data sea un array
      const categoriesArray = Array.isArray(data) ? data : (Array.isArray(data?.results) ? data.results : []);
      setCategories(categoriesArray);
    } catch (error) {
      console.error("Error loading categories", error);
      setCategories([]);
    }
  };

  return (
    <div>
      {/* Outlet renderiza la subruta como CategoryPage */}
      <Outlet context={{ products, categories }} />
    </div>
  );
};

export default ProductsSection;
