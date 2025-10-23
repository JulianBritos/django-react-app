import { FiSearch, FiFilter } from "react-icons/fi";

const SearchAndFilterBar = ({
  searchTerm,
  onSearchChange,
  categories,
  selectedCategory,
  onCategorySelect,
  isFilterMenuOpen,
  toggleFilterMenu,
  selectedFilters = []
}) => {
  return (
    <div className="flex justify-center w-full">
      {/* Contenedor centrado del buscador + filtro */}
      <div className="flex items-center gap-2 w-full max-w-3xl">
        {/* Barra de búsqueda */}
        <div className="relative flex-1 min-w-[300px]">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar productos"
            value={searchTerm}
            onChange={onSearchChange}
            className="border p-3 pl-10 rounded-lg text-lg font-medium w-full min-w-[300px] max-w-[600px]"
          />
        </div>

        {/* Botón de filtro pegado a la derecha del input */}
        <div className="relative group flex-shrink-0">
          <button
            onClick={toggleFilterMenu}
            className={`flex items-center justify-center p-2 rounded-full transition relative
              ${isFilterMenuOpen ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"}
            `}
          >
            <FiFilter className="text-xl" />
            {/* Indicador de filtros activos */}
            {selectedFilters.length > 0 && (
              <span className="absolute top-1 left-4 translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full border-2 border-white z-50"></span>
            )}
          </button>
          <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50">
            {isFilterMenuOpen ? "Ocultar filtros" : "Mostrar filtros"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilterBar;
