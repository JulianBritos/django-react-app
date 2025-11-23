import { useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";

const Categories = ({ categories = [] }) => {
  const navigate = useNavigate();

  // Asegurarse de que categories sea un array
  const safeCategories = Array.isArray(categories) ? categories : [];

  return (
    <section className="py-16 text-center w-full max-w-7xl mx-auto mt-6 p-6 rounded-2xl flex flex-col">
      <h2 className="text-3xl font-bold mb-6">Categorias</h2>
      <p className="text-gray-600 mb-8">¿Qué estás buscando?</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {safeCategories.slice(0, 3).map((category) => (
          <div
            key={category.name}
            className="p-6 shadow-lg rounded-lg bg-white cursor-pointer hover:bg-gray-100 transition"
            onClick={() => navigate(`/products/${category.name}`)}
          >
            <h3 className="font-semibold">{category.name}</h3>
          </div>
        ))}
      </div>
      <Button
        variant="primary"
        size="default"
        className="mt-6"
        onClick={() => {
          navigate("/products/allproducts");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      >
        Explore
      </Button>
    </section>
  );
};

export default Categories;
