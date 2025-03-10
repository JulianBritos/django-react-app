import { useEffect, useState } from "react";
import { getProducts } from "../api/products.api";
import ProductList from "../components/ProductList";
import HeroSection from "../components/HeroSection";

const HomePage = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getProducts();
      setProducts(data);
    };
    fetchProducts();
  }, []);

  return (
    <div className="flex flex-col items-center">
      {/* Contenedor central con max-width */}
      <div className="w-full max-w-7xl px-4">
        <HeroSection />

        {/* Sección Productos Destacados alineada */}
        <div className="py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            {/* Texto y botón */}
            <div className="w-full md:w-1/3 mb-6 md:mb-0">
              <h2 className="text-3xl font-bold text-black">
                Best Selling Plants
              </h2>
              <p className="text-gray-500 mt-2">
                Easiest way to healthy life by buying your favorite plants
              </p>
              <a
                href="/products"
                className="mt-4 inline-flex items-center bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
              >
                See more
                <span className="ml-2">→</span>
              </a>
            </div>

            {/* Grid de productos */}
            <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.slice(0, 3).map((product) => (
                <div
                  key={product.id}
                  className="bg-white shadow rounded-lg overflow-hidden"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <p className="text-gray-500">₱ {product.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
