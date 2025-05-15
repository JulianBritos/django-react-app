import { useParams } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import ScrollableNavBar from "../components/ScrollableNavVar";
import { useNavigate } from "react-router-dom";

function CategoryPage() {
  const { categoryName } = useParams();
  const { products, categories } = useOutletContext();
  const navigate = useNavigate();

  const filteredProducts =
    categoryName === "allproducts"
      ? products
      : products.filter((product) => product.category.name === categoryName);

  const handleCategoryClick = (category) => {
    navigate(`/products/${category.name}`);
  };

  return (
    <div>
      <ScrollableNavBar
        categories={categories}
        onCategoryClick={handleCategoryClick}
      />

      <div className="min-h-screen bg-gray-50 p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          {categoryName === "allproducts" ? "Nuestros Productos" : categoryName}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
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
                <h3 className="text-lg font-semibold text-gray-800">
                  {product.name}
                </h3>
                <p className="text-gray-600">${product.price}</p>
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
    </div>
  );
}

export default CategoryPage;
