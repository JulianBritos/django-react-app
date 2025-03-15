import { useEffect, useState } from "react";
import { getProducts } from "../api/products.api"; // Solo necesitas obtener productos

const ProductsSection = () => {
  const [products, setProducts] = useState([]);

  // Cargar los productos al montar el componente
  useEffect(() => {
    loadProducts();
  }, []);

  // Función para cargar los productos
  const loadProducts = async () => {
    const data = await getProducts();
    setProducts(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Título de la página */}

      {/* Grid de productos */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Nuestros Productos
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Imagen del producto */}
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-64 object-cover"
            />

            {/* Detalles del producto */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {product.name}
              </h3>
              <p className="text-gray-600">${product.price}</p>

              {/* Botón para agregar al carrito (opcional) */}
              <button
                className="w-full mt-4 bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition"
                onClick={() => alert(`Agregaste ${product.name} al carrito`)}
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsSection;
