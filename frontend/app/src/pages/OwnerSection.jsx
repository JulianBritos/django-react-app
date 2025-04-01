import { useEffect, useState } from "react";
// import { getAdminData } from "../api/admin.api"; // Reemplazá esto cuando tengas tu API real
import { getProducts } from "../api/products.api";
import { getCategories } from "../api/categorys.api";
import AdminComponent from "../components/AdminComponent";

const OwnerSection = () => {
  const [data, setData] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);


  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    const data = await getProducts();
    setProducts(data);
  };

  const loadCategories = async () => {
    const data = await getCategories();
    setCategories(data);
  };

  return (
    <div className="p-4">
      <AdminComponent products={products} categories={categories}/>
    </div>
  );
};

export default OwnerSection;