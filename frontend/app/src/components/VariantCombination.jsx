import { useState } from "react";

export default function VariantCombination({ options, onAdd }) {
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      sku,
      price: parseFloat(price),
      stock: parseInt(stock),
      option_ids: selectedOptions,
    });
    setSku("");
    setPrice("");
    setStock("");
    setSelectedOptions([]);
  };

  return (
    <div className="border p-4 rounded-lg bg-gray-50">
      <h4 className="font-bold mb-2">Nueva Combinación</h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          placeholder="SKU (Ej: CAM-ROJO-M)"
          className="border p-2 w-full rounded"
          required
        />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Precio"
          className="border p-2 w-full rounded"
          step="0.01"
          required
        />
        <input
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          placeholder="Stock"
          className="border p-2 w-full rounded"
          required
        />
        <div>
          <label className="block mb-1">Opciones:</label>
          <select
            multiple
            value={selectedOptions}
            onChange={(e) =>
              setSelectedOptions(
                [...e.target.selectedOptions].map((o) => o.value)
              )
            }
            className="border p-2 w-full rounded h-auto"
          >
            {options.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.variant.name}: {opt.value}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-purple-500 text-white px-4 py-2 rounded"
        >
          Añadir Combinación
        </button>
      </form>
    </div>
  );
}
