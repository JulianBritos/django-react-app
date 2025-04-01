import { useState } from "react";
import { FiFilter, FiEdit, FiSearch } from "react-icons/fi";

function AdminComponent({ products, categories }) {
  const productsTest = [
    {
      id: 1,
      name: "Camiseta Blanca",
      price: 19.99,
      category: "ropa",
      uploaded_images: [
        {
          image: "https://source.unsplash.com/400x400/?tshirt,white",
        },
      ],
    },
    {
      id: 2,
      name: "Laptop HP",
      price: 899.99,
      category: "electronica",
      uploaded_images: [
        {
          image: "https://source.unsplash.com/400x400/?laptop",
        },
      ],
    },
    {
      id: 3,
      name: "Harry Potter y la piedra filosofal",
      price: 12.5,
      category: "libros",
      uploaded_images: [
        {
          image: "https://source.unsplash.com/400x400/?book,harrypotter",
        },
      ],
    },
    {
      id: 4,
      name: "Pantalón Jeans",
      price: 39.99,
      category: "ropa",
      uploaded_images: [
        {
          image: "https://source.unsplash.com/400x400/?jeans",
        },
      ],
    },
    {
      id: 5,
      name: "Auriculares Bluetooth",
      price: 59.99,
      category: "electronica",
      uploaded_images: [
        {
          image: "https://source.unsplash.com/400x400/?headphones",
        },
      ],
    },
  ];

  const categoriesTest = [
    { name: "allproducts", label: "Todos" },
    { name: "ropa", label: "Ropa" },
    { name: "electronica", label: "Electrónica" },
    { name: "libros", label: "Libros" },
  ];

  const [filteredProducts, setFilteredProducts] = useState(productsTest);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("allproducts");
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setIsFilterMenuOpen(false);
    if (category === "allproducts") {
      setFilteredProducts(productsTest);
    } else {
      setFilteredProducts(productsTest.filter((product) => product.category === category));
    }
    setSearchTerm("");
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredProducts(
      productsTest.filter((product) =>
        product.category === selectedCategory || selectedCategory === "allproducts"
      ).filter((product) => product.name.toLowerCase().includes(term))
    );
  };

  return (
    <div className="admin-page p-6">
      <div className="flex items-center justify-between mb-6 relative">
        <h1 className="text-3xl font-bold text-gray-800">
          {selectedCategory === "allproducts" ? "Todos los Productos" : categoriesTest.find(c => c.name === selectedCategory)?.label}
        </h1>
        <div className="relative flex items-center gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar productos"
              value={searchTerm}
              onChange={handleSearch}
              className="border p-2 pl-10 rounded-lg text-lg font-medium"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
              className="flex items-center gap-2 bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              <FiFilter /> Filtrar
            </button>
            {isFilterMenuOpen && (
              <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-lg p-2">
                {categoriesTest.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => handleCategoryClick(category.name)}
                    className={`block w-full text-left px-4 py-2 rounded-md hover:bg-gray-100 ${selectedCategory === category.name ? 'font-bold' : ''}`}
                  >
                    {category.label}
                  </button>
                ))}
                <button
                  onClick={() => handleCategoryClick("allproducts")}
                  className="block w-full text-left px-4 py-2 rounded-md text-red-600 hover:bg-red-100"
                >
                  Quitar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div key={product.id} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <img src={product.uploaded_images?.[0]?.image || "/placeholder.jpg"} alt={product.name} className="w-full h-64 object-cover" />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                <p className="text-gray-600">${product.price}</p>
                <button className="w-full mt-4 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition flex items-center justify-center gap-2">
                  <FiEdit /> Editar producto
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 col-span-full text-center">No se encontraron productos.</p>
        )}
      </div>
    </div>
  );
}

export default AdminComponent;
