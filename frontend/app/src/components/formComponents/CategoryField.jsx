const CategoryField = ({ value, onChange, categories = [], error }) => {
  // Asegurarse de que categories sea un array
  const safeCategories = Array.isArray(categories) ? categories : [];
  
  return (
    <div className="p-4 bg-white shadow-lg rounded-lg">
      <label htmlFor="category" className="block text-xl font-semibold mb-2">
        Categoría*
      </label>
      <select
        id="category"
        name="category"
        value={value}
        onChange={onChange}
        className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-primary-400 focus:outline-none"
      >
        <option value="">Seleccionar categoría</option>
        {safeCategories
          .filter((cat) => !cat.parent_id) // Solo super categorías
          .map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
      </select>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default CategoryField;
