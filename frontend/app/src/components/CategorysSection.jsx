const Categories = () => {
  return (
    <section className="py-16 text-center">
      <h2 className="text-3xl font-bold mb-6">Categories</h2>
      <p className="text-gray-600 mb-8">Find what you are looking for</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 shadow-lg rounded-lg bg-white">
          <h3 className="font-semibold">Natural Plants</h3>
        </div>
        <div className="p-6 shadow-lg rounded-lg bg-white">
          <h3 className="font-semibold">Plant Accessories</h3>
        </div>
        <div className="p-6 shadow-lg rounded-lg bg-white">
          <h3 className="font-semibold">Artificial Plants</h3>
        </div>
      </div>
      <button className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg shadow">
        Explore
      </button>
    </section>
  );
};

export default Categories;
