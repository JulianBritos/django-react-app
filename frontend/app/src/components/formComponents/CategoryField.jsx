const CategoryField = ({ value, onChange, categories, error }) => (
  <div>
    <label htmlFor="category" className="block text-sm font-medium mb-1">
      Categoría*
    </label>
    <select
      id="category"
      name="category"
      value={value}
      onChange={onChange}
      className="w-full p-2 border rounded"
    >
      <option value="">Seleccionar categoría</option>
      {categories.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.name}
        </option>
      ))}
    </select>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

export default CategoryField;