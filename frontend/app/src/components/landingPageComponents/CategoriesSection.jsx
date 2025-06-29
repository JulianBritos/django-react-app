import { Button } from "../ui/Button";

const Categories = () => {
  return (
    <section className="py-16 text-center w-full max-w-7xl mx-auto mt-6 p-6 rounded-2xl flex flex-col">
      <h2 className="text-3xl font-bold mb-6">Categorias</h2>
      <p className="text-gray-600 mb-8">Que estás buscando?</p>
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
      <Button variant="primary" size="default" className="mt-6">
        Explore
      </Button>
    </section>
  );
};

export default Categories;
