import { useState, useEffect } from "react";
import { Button } from "./Button";

// Recibe los atributos como prop con sus opciones ya incluidas
const AttributeSelector = ({ attributes = [], onSelectionChange }) => {
  const [selectedOptions, setSelectedOptions] = useState({});

  useEffect(() => {
    // Inicializar selectedOptions con valores vacíos
    const initialSelected = {};
    attributes.forEach((attr) => {
      initialSelected[attr.id] = "";
    });
    setSelectedOptions(initialSelected);
  }, [attributes]);

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedOptions);
    }
  }, [selectedOptions, onSelectionChange]);

  const handleOptionSelect = (attributeId, optionId) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [attributeId]: optionId,
    }));
  };

  if (!attributes || attributes.length === 0) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg text-gray-500 text-center">
        No hay variantes disponibles para este producto.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {attributes.map((attribute) => {
        const options = attribute.options || [];

        if (options.length === 0) {
          return null; // No mostrar atributos sin opciones
        }

        return (
          <div key={attribute.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {attribute.name}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {options.map((option) => (
                <button
                  key={option.id}
                  className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                    selectedOptions[attribute.id] === option.id.toString()
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                  onClick={() =>
                    handleOptionSelect(attribute.id, option.id.toString())
                  }
                >
                  {option.name}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AttributeSelector;
