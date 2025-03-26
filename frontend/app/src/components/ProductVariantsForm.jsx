import { useState } from "react";
import { createVariant } from "../api/variants.api";

const ProductVariantsForm = ({ onVariantAdded }) => {
  const [variant, setVariant] = useState({
    name: "",
    options: [],
  });

  const [option, setOption] = useState("");

  const handleChange = (e) => {
    setVariant({ ...variant, name: e.target.value });
  };

  const handleOptionChange = (e) => {
    setOption(e.target.value);
  };

  const addOption = () => {
    if (option.trim() !== "") {
      setVariant({ ...variant, options: [...variant.options, option] });
      setOption(""); // Limpiar input
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!variant.name || variant.options.length === 0) {
      alert("Debes ingresar un nombre y al menos una opción.");
      return;
    }

    try {
      await createVariant(variant);
      onVariantAdded(variant); // Refrescar lista de variantes en el frontend
      setVariant({ name: "", options: [] }); // Reset form
    } catch (error) {
      console.error("Error al crear variante:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Nombre de la Variante:</label>
        <input
          type="text"
          value={variant.name}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Opciones:</label>
        <input type="text" value={option} onChange={handleOptionChange} />
        <button type="button" onClick={addOption}>
          Agregar Opción
        </button>
      </div>

      <ul>
        {variant.options.map((opt, index) => (
          <li key={index}>{opt}</li>
        ))}
      </ul>

      <button type="submit">Guardar Variante</button>
    </form>
  );
};

export default ProductVariantsForm;
