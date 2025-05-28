import { useState } from "react";
import { createVariantOption } from "../api/variants.api";

export default function OptionCreator({ variants }) {
  const [selectedVariant, setSelectedVariant] = useState("");
  const [optionValue, setOptionValue] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createVariantOption(selectedVariant, optionValue);
      setOptionValue("");
    } catch (error) {
      console.error("Error creando opción:", error);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow mt-4">
      <h3 className="font-bold text-lg mb-2">Añadir Valor</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <select
          value={selectedVariant}
          onChange={(e) => setSelectedVariant(e.target.value)}
          className="border p-2 w-full rounded"
          required
        >
          <option value="">Selecciona una variante</option>
          {variants.map((variant) => (
            <option key={variant.id} value={variant.id}>
              {variant.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={optionValue}
          onChange={(e) => setOptionValue(e.target.value)}
          placeholder="Ej: Rojo, M"
          className="border p-2 w-full rounded"
          required
        />
        <button
          type="submit"
          className="bg-thirdary-500 text-white px-4 py-2 rounded"
        >
          Añadir
        </button>
      </form>
    </div>
  );
}
