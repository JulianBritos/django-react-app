import { FiSearch, FiFilter } from "react-icons/fi";

const SearchAndFilterBar = ({
  searchTerm,
  onSearchChange,
  categories,
  selectedCategory,
  onCategorySelect,
  isFilterMenuOpen,
  toggleFilterMenu
}) => {
  return (
    <div className="flex justify-center w-full">
      {/* Contenedor centrado del buscador + filtro */}
      <div className="flex items-center gap-2 w-full max-w-xl">
        {/* Barra de búsqueda */}
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar productos"
            value={searchTerm}
            onChange={onSearchChange}
            className="border p-2 pl-10 rounded-lg text-lg font-medium w-full"
          />
        </div>

        {/* Botón de filtro pegado a la derecha del input */}
        <div className="relative group flex-shrink-0">
          <button
            onClick={toggleFilterMenu}
            className="flex items-center justify-center bg-gray-200 p-2 rounded-full hover:bg-gray-300 transition relative"
          >
            <FiFilter className="text-xl" />
          </button>
          <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            Filtrar
          </span>

          {isFilterMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg p-2 z-10">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => onCategorySelect(category.name)}
                  className={`block w-full text-left px-4 py-2 rounded-md hover:bg-gray-100 ${
                    selectedCategory === category.name ? "font-bold" : ""
                  }`}
                >
                  {category.label}
                </button>
              ))}
              <button
                onClick={() => onCategorySelect("allproducts")}
                className="block w-full text-left px-4 py-2 rounded-md text-red-600 hover:bg-red-100"
              >
                Quitar filtros
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilterBar;
