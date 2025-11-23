import { useState, useEffect } from "react";
import { FiSearch, FiFilter, FiX, FiChevronDown } from "react-icons/fi";
import { Button } from "./Button";

const AdvancedSearchBar = ({
  onSearch,
  categories = [],
  initialFilters = {},
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialFilters.search || "");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: initialFilters.category || "",
    minPrice: initialFilters.minPrice || "",
    maxPrice: initialFilters.maxPrice || "",
    inStock: initialFilters.inStock ?? true,
    onSale: initialFilters.onSale ?? false,
    ordering: initialFilters.ordering || "name",
  });

  const handleSearch = () => {
    const searchParams = {
      search: searchTerm.trim() || undefined,
      ...filters,
    };
    // Limpiar valores vacíos
    Object.keys(searchParams).forEach((key) => {
      if (searchParams[key] === "" || searchParams[key] === undefined) {
        delete searchParams[key];
      }
    });
    onSearch(searchParams);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilters({
      category: "",
      minPrice: "",
      maxPrice: "",
      inStock: true,
      onSale: false,
      ordering: "name",
    });
    onSearch({});
  };

  const hasActiveFilters = () => {
    return (
      searchTerm ||
      filters.category ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.onSale ||
      filters.ordering !== "name"
    );
  };

  return (
    <div className="w-full space-y-4">
      {/* Barra de búsqueda principal */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar productos por nombre, descripción, SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
        </div>
        <Button
          variant="primary"
          onClick={handleSearch}
          isLoading={isLoading}
          className="px-6"
        >
          Buscar
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="px-4"
        >
          <FiFilter className="w-4 h-4 mr-2" />
          Filtros
          {hasActiveFilters() && (
            <span className="ml-2 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
              {Object.values(filters).filter((v) => v && v !== "name").length +
                (searchTerm ? 1 : 0)}
            </span>
          )}
        </Button>
        {hasActiveFilters() && (
          <Button variant="ghost" onClick={handleClearFilters} size="sm">
            <FiX className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Panel de filtros avanzados */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Filtros avanzados</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                value={filters.category}
                onChange={(e) =>
                  setFilters({ ...filters, category: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat.id || cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Precio mínimo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio mínimo
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={filters.minPrice}
                onChange={(e) =>
                  setFilters({ ...filters, minPrice: e.target.value })
                }
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Precio máximo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio máximo
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={filters.maxPrice}
                onChange={(e) =>
                  setFilters({ ...filters, maxPrice: e.target.value })
                }
                placeholder="9999.99"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Ordenamiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ordenar por
              </label>
              <select
                value={filters.ordering}
                onChange={(e) =>
                  setFilters({ ...filters, ordering: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Nombre (A-Z)</option>
                <option value="-name">Nombre (Z-A)</option>
                <option value="price">Precio (Menor a Mayor)</option>
                <option value="-price">Precio (Mayor a Menor)</option>
                <option value="-created_at">Más recientes</option>
                <option value="created_at">Más antiguos</option>
              </select>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={(e) =>
                  setFilters({ ...filters, inStock: e.target.checked })
                }
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Solo en stock</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.onSale}
                onChange={(e) =>
                  setFilters({ ...filters, onSale: e.target.checked })
                }
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Solo en oferta</span>
            </label>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
            <Button variant="outline" onClick={handleClearFilters}>
              Limpiar filtros
            </Button>
            <Button variant="primary" onClick={handleSearch} isLoading={isLoading}>
              Aplicar filtros
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchBar;

