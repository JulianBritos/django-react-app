import { useState, useEffect } from "react";
import { getAttributeOptionsByAttributeId } from "../../api/attributes.api";

// Recibe los atributos como prop
const AttributeSelector = ({ attributes = [] }) => {
  const [optionsByAttribute, setOptionsByAttribute] = useState({});
  const [searchQueries, setSearchQueries] = useState({});
  const [selectedOptions, setSelectedOptions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOptions = async () => {
      if (!attributes || attributes.length === 0) {
        setLoading(false);
        return;
      }
      try {
        // Inicializar queries y selectedOptions
        const queries = {};
        const selected = {};
        attributes.forEach((attr) => {
          queries[attr.id] = "";
          selected[attr.id] = "";
        });
        setSearchQueries(queries);
        setSelectedOptions(selected);

        // Cargar opciones para cada atributo
        const optionsPromises = attributes.map((attr) =>
          getAttributeOptionsByAttributeId(attr.id)
        );
        const optionsResults = await Promise.all(optionsPromises);

        const optionsMap = {};
        attributes.forEach((attr, index) => {
          optionsMap[attr.id] = optionsResults[index];
        });
        setOptionsByAttribute(optionsMap);
        setLoading(false);
      } catch (error) {
        console.error("Error loading attribute options:", error);
        setLoading(false);
      }
    };
    loadOptions();
  }, [attributes]);

  const handleSearchChange = (attributeId, searchValue) => {
    setSearchQueries((prev) => ({
      ...prev,
      [attributeId]: searchValue.toLowerCase(),
    }));
  };

  const handleOptionSelect = (attributeId, optionId) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [attributeId]: optionId,
    }));
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-white p-6 rounded-lg shadow-lg">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  // Filtrar atributos válidos (que tengan nombre y al menos una opción)
  const validAttributes = attributes.filter(
    (attribute) =>
      attribute &&
      attribute.name &&
      optionsByAttribute[attribute.id]?.length > 0
  );

  if (!validAttributes.length) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg text-gray-500 text-center">
        No hay atributos disponibles para este producto.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="space-y-4">
        {validAttributes.map((attribute) => {
          const options = optionsByAttribute[attribute.id] || [];
          const filteredOptions = options.filter((option) =>
            option.name.toLowerCase().includes(searchQueries[attribute.id])
          );

          return (
            <div key={attribute.id} className="flex flex-col items-start">
              <label className="text-sm font-medium text-gray-700 mb-1 text-left">
                {attribute.name || `Atributo #${attribute.id}`}
              </label>
              <div className="flex flex-col items-start space-y-2">
                <select
                  className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-transparent"
                  value={selectedOptions[attribute.id]}
                  onChange={(e) =>
                    handleOptionSelect(attribute.id, e.target.value)
                  }
                >
                  <option className="bg-transparent" value="">
                    Seleccionar {attribute.name || `Atributo #${attribute.id}`}
                  </option>
                  {filteredOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AttributeSelector;
