const TaxField = ({ value, onChange, error }) => (
  <div className="p-4 bg-white shadow-lg rounded-lg">
    <label htmlFor="tax" className="block text-xl font-semibold mb-2">
      Impuesto*
    </label>
    <input
      id="tax"
      type="number"
      name="tax"
      min="0"
      max="100"
      step="0.01"
      value={value || ""}
      onChange={onChange}
      placeholder="0.00"
      className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-primary-400 focus:outline-none"
    />
    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    <p className="text-xs text-gray-500 mt-1">Porcentaje de impuesto (0-100)</p>
  </div>
);

export default TaxField;
