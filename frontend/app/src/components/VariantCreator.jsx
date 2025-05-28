import { useState } from "react";
import { createVariant } from "../api/variants.api";

export default function VariantCreator({ onVariantCreated }) {
  const [variantName, setVariantName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createVariant(variantName);
      setVariantName("");
      onVariantCreated?.();
    } catch (error) {
      console.error("Error creando variante:", error);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-bold text-lg mb-2">Crear Variante</h3>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={variantName}
          onChange={(e) => setVariantName(e.target.value)}
          placeholder="Ej: Color, Talla"
          className="border p-2 flex-grow rounded"
          required
        />
        <button
          type="submit"
          className="bg-primary-500 text-white px-4 py-2 rounded"
        >
          Crear
        </button>
      </form>
    </div>
  );
}
