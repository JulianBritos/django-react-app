import ProductCard from "./ProductCard";

const ProductList = ({ products }) => {
  if (products.length === 0) {
    return (
      <p className="text-center text-gray-600">No hay productos disponibles.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductList;
