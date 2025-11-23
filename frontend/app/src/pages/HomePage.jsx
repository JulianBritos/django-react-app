import HeroSection from "../components/landingPageComponents/HeroSection";
import Categories from "../components/landingPageComponents/CategoriesSection";
import AboutUs from "../components/landingPageComponents/AboutUs";
import Testimonials from "../components/landingPageComponents/Testimonials";
import BestProducts from "../components/landingPageComponents/BestProducts";
import ContactForm from "../components/landingPageComponents/ContactForm";
import { getProducts } from "../api/products.api";
import { getCategories } from "../api/categories.api";
import { useEffect, useState } from "react";

const HomePage = () => {

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

  console.log("Categories:", categories);

  return (
    <div className="">
      <div className="py-4 ">
        <div className="m-4">
          <HeroSection />
        </div>
      </div>
      <div className="py-4 ">
        <div className="m-4">
          <BestProducts products={products}/>
        </div>
      </div>
      <div className="py-4">
        <div className="m-4">
          <Categories categories={categories} />
        </div>
      </div>
      <div className="py-4  ">
        <div className="m-4">
          <AboutUs />
        </div>
      </div>
      <div className="py-4 ">
        <div className="m-4">
          <Testimonials />
        </div>
      </div>
      <div className="py-4 ">
        <div className="m-4">
          <ContactForm />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
