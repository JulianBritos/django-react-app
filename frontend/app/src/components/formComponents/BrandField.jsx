// frontend/app/src/components/formComponents/BrandField.jsx
const BrandField = ({ value, onChange, error }) => (
  <div className="p-4 bg-white shadow-lg rounded-lg">
    <label htmlFor="brand" className="block text-xl font-semibold mb-2">
      Marca
    </label>
    <input
      id="brand"
      type="text"
      name="brand"
      value={value}
      onChange={onChange}
      placeholder="Ej: Samsung, Apple, Nike..."
      className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-primary-400 focus:outline-none"
    />
    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
  </div>
);

export default BrandField;
