const TaxField = ({ value, onChange, error }) => (
  <div className="p-4 bg-white shadow-lg rounded-lg">
    <label htmlFor="impuesto" className="block text-xl font-semibold mb-2">
      Impuesto*
    </label>
    <input
      id="impuesto"
      type="number"
      name="impuesto"
      min="0"
      max="100"
      value={value}
      onChange={onChange}
      className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-primary-400 focus:outline-none"
    />
    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
  </div>
);

export default TaxField;
