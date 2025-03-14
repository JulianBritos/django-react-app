import { useEffect, useState } from "react";
import { getProducts } from "../api/products.api";

const BestProducts = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getProducts();
      setProducts(data);
    };
    fetchProducts();
  }, []);

  return (
    <section className="text-center">
      <div className="py-2">
        {" "}
        <div className="flex flex-col md:flex-row items-center md:items-center justify-between">
          {/* Texto y botón */}
          <div className="md:w-3/6 mb-6 md:mb-0">
            <h2 className="text-start text-3xl font-bold text-black">
              Best Selling Products
            </h2>
            <p className="text-start text-gray-500 mt-2">
              Easiest way to healthy life by buying your favorite toys
            </p>

            <div className="flex flex-col items-start">
              <a
                href="/products"
                className="mt-4 text-starts items-start inline-flex shadow-md shadow-purple-300 bg-white text-purple-700 font-bold py-2 px-6 rounded-lg hover:bg-gray-200 transition"
              >
                Ver más
                <span className="ml-2">→</span>
              </a>
            </div>
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
    </section>
  );
};

export default BestProducts;
