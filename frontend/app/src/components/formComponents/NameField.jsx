const NameField = ({ value, onChange, error }) => (
  <div className="p-4 bg-white shadow-lg rounded-lg">
    <label htmlFor="name" className="block text-xl font-semibold mb-2">
      Nombre del producto*
    </label>
    <input
      id="name"
      type="text"
      name="name"
      value={value}
      onChange={onChange}
      className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400 focus:outline-none"
    />
    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
  </div>
);

export default NameField;