import React from "react";
import { FiX } from "react-icons/fi";

function FilterPanel({
  categories,
  selectedCategory,
  onCategorySelect,
  onClose,
  selectedFilters,
  setSelectedFilters,
  onClearFilters,
  isMobile = false, // <-- added prop to detect mobile usage
}) {
  const exampleFilters = [
    "En stock",
    "En oferta",
    "Envío gratis",
    "Novedades",
    "Más vendidos",
    "Precio bajo a alto",
    "Precio alto a bajo",
    "En stock",
    "En oferta",
    "Envío gratis",
    "Novedades",
    "Más vendidos",
    "Precio bajo a alto",
    "Precio alto a bajo"
  ];

  // Toggle individual
  const handleCheckboxChange = (filter) => {
    setSelectedFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  return (
    <aside
      className={
        // keep relative for the close button positioning; apply sticky + self-start + max-height only on escritorio
        `bg-white rounded-lg shadow p-4 relative min-w-[16rem] z-30 ${
          isMobile ? "" : "sticky top-4 self-start max-h-[calc(100vh-4rem)] overflow-auto"
        }`
      }
    >
      <button
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
        onClick={onClose}
        title="Cerrar panel de filtros"
      >
        <FiX size={20} />
      </button>

      <div className="font-bold mb-4">Filtros</div>

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

      <div className="flex gap-2 mt-2">
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
          onClick={() => {
            console.log("Filtros aplicados:", selectedFilters);
            if (onClose) onClose(); // Cierra el panel
          }}
        >
          Aplicar Filtros
        </button>
        <button
          className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition"
          onClick={onClearFilters}
        >
          Limpiar Filtros
        </button>
      </div>
    </aside>
  );
}

export default FilterPanel;

