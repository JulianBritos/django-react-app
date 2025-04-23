const PriceField = ({ value, onChange, error }) => (
  <div>
    <label htmlFor="price" className="block text-sm font-medium mb-1">
      Precio Base*
    </label>
    <input
      id="price"
      type="number"
      name="price"
      min="0"
      value={value}
      onChange={onChange}
      className="w-full p-2 border rounded"
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

export default PriceField;