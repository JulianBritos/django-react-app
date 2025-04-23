const NameField = ({ value, onChange, error }) => (
  <div className="md:col-span-2 p-4 bg-white shadow-lg rounded-lg">
    <label htmlFor="name" className="block text-2xl font-bold mb-1">
      Nombre del producto*
    </label>
    <input
      id="name"
      type="text"
      name="name"
      value={value}
      onChange={onChange}
      className="w-full p-2 border rounded"
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

export default NameField;