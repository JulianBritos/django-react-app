import { useEffect, useState } from "react";
import { getProducts } from "../../api/products.api";
import { Button } from "../ui/Button";

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
    <section className="w-full max-w-7xl mx-auto mt-6 p-6 rounded-2xl flex flex-col">
      <div className="py-2">
        {" "}
        <div className="flex flex-col md:flex-row items-center md:items-center justify-between">
          {/* Texto y botón */}
          <div className="md:w-3/6 mb-6 md:mb-0">
            <h2 className="text-start text-3xl font-bold text-black">
              Productos destacados
            </h2>
            <p className="text-start text-gray-500 mt-2">
              La forma más fácil de llevar una vida saludable comprando tus
              juguetes favoritos.
            </p>

            <div className="flex flex-col items-start">
              <Button
                variant="outline"
                size="default"
                as="a"
                href="/products"
                className="mt-4"
              >
                Ver más
                <span className="ml-2">→</span>
              </Button>
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
                  src={
                    product.product_attributes?.[0]?.uploaded_images?.[0]?.image
                      ? product.product_attributes[0].uploaded_images[0].image
                      : "/placeholder.jpg"
                  }
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
