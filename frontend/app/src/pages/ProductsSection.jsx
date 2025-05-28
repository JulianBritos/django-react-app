// import { useEffect, useState } from "react";
// import { getProducts } from "../api/products.api"; // Solo necesitas obtener productos
// import { getCategories } from "../api/categorys.api"; // Solo necesitas obtener productos
// import ScrollableNavBar from "../components/ScrollableNavVar";

// const ProductsSection = () => {
//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);

//   const [selectedCategory, setSelectedCategory] =
//     useState("Nuestros Productos"); // ESTADO PARA ALMACENAR LA CATEGORÍA SELECCIONADA

//   // Cargar los productos al montar el componente
//   useEffect(() => {
//     loadProducts();
//     loadCategories()
//     console.log("categorias :" + categories)
//   }, []);

//   // Función para cargar los productos
//   const loadProducts = async () => {
//     const data = await getProducts();
//     setProducts(data);
//   };

//   const loadCategories = async () => {
//     const data = await getCategories();
//     setCategories(data);
//   };

//   const handleCategoryClick = (category) => {
//     setSelectedCategory(category); // ACTUALIZA EL ESTADO CON LA CATEGORÍA SELECCIONADA
//   };

//   return (
//     <div>
//       <ScrollableNavBar
//         categories={categories}
//         onCategoryClick={handleCategoryClick}
//       />

//       <div className="min-h-screen bg-gray-50 p-6">
//         {/* Implementación de ScrollableNavbar para mostrar categorías */}

//         {/* Título de la página */}
//         <h1 className="text-3xl font-bold text-gray-800 mb-6">
//           {selectedCategory} {/* SE MUESTRA LA CATEGORÍA SELECCIONADA */}
//         </h1>
//         {/* Grid de productos */}

//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//           {products.map((product) => (
//             <div
//               key={product.id}
//               className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
//             >
//               {/* Imagen del producto */}
//               <img
//                 src={
//                   product.uploaded_images.length > 0
//                     ? product.uploaded_images[0].image
//                     : "/placeholder.jpg"
//                 }
//                 alt={product.name}
//                 className="w-full h-64 object-cover"
//               />

//               {/* Detalles del producto */}
//               <div className="p-4">
//                 <h3 className="text-lg font-semibold text-gray-800">
//                   {product.name}
//                 </h3>
//                 <p className="text-gray-600">${product.price}</p>

//                 {/* Botón para agregar al carrito (opcional) */}
//                 <button
//                   className="w-full mt-4 bg-thirdary-500 text-white py-2 rounded-md hover:bg-thirdary-600 transition"
//                   onClick={() => alert(`Agregaste ${product.name} al carrito`)}
//                 >
//                   Agregar al carrito
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductsSection;

import { useEffect, useState } from "react";
import { getProducts } from "../api/products.api";
import { getCategories } from "../api/categorys.api";
import { Outlet } from "react-router-dom";

const ProductsSection = () => {
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
    <div>
      {/* Outlet renderiza la subruta como CategoryPage */}
      <Outlet context={{ products, categories }} />
    </div>
  );
};

export default ProductsSection;
