import React, { useState } from 'react';
import { FiX } from "react-icons/fi";

function FilterPanel({ categories, selectedCategory, onCategorySelect, onClose }) {
  const exampleFilters = [
    "En stock",
    "En oferta",
    "Envío gratis",
    "Novedades",
    "Más vendidos",
    "Precio bajo a alto",
    "Precio alto a bajo"
  ];

  // Estado para almacenar los filtros seleccionados
  const [selectedFilters, setSelectedFilters] = useState([]);

  // Maneja cambios de los checkboxes
  const handleCheckboxChange = (filter) => {
    setSelectedFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter) // Si estaba seleccionado, lo quita
        : [...prev, filter]                // Si no estaba, lo agrega
    );
  };

  // Limpiar filtros: desmarcar todos
  const handleClearFilters = () => {
    setSelectedFilters([]); // Deja vacío el array → desmarca todo
  };

  // Aplicar filtros: en el futuro agregaremos la lógica real
  const handleApplyFilters = () => {
    console.log("Filtros aplicados:", selectedFilters);
    // Luego agregaremos la lógica real para filtrar productos
  };

  return (
    <aside
      className="
        bg-white rounded-lg shadow p-4
        sticky top-4
        min-w-[16rem]
        z-30
        max-h-[90vh]
        overflow-y-auto
      "
    >
      {/* Botón cerrar */}
      <button
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
        onClick={onClose}
        title="Cerrar panel de filtros"
      >
        <FiX size={20} />
      </button>
      <div className="font-bold mb-4">Filtros</div>

      {/* Lista de filtros */}
      <div className="flex flex-col gap-3 mb-4">
        {exampleFilters.map((filter) => (
          <label key={filter} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="accent-blue-500"
              checked={selectedFilters.includes(filter)}
              onChange={() => handleCheckboxChange(filter)}
            />
            <span>{filter}</span>
          </label>
        ))}
      </div>

      {/* Botones de acción */}
      <div className="flex gap-2 mt-2">
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
          onClick={handleApplyFilters}
        >
          Aplicar Filtros
        </button>
        <button
          className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition"
          onClick={handleClearFilters}
        >
          Limpiar Filtros
        </button>
      </div>
    </aside>
  );
}

export default FilterPanel;
