import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import {
  createAttribute,
  createAttributeOption,
} from "../../api/attributes.api";

const AttributeManager = ({
  attributes,
  productAttributes,
  setProductAttributes,
  selectedAttribute,
  setSelectedAttribute,
  attributeOptions,
}) => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [creatingNewAttribute, setCreatingNewAttribute] = useState(false);
  const [newAttributeName, setNewAttributeName] = useState("");
  const [newOptionName, setNewOptionName] = useState("");

  const handleAddClick = () => {
    setShowSidebar(true);
    setSelectedAttribute("");
    setSelectedOptions([]);
  };

  const handleClosePanel = () => {
    setShowSidebar(false);
    setSelectedAttribute("");
    setSelectedOptions([]);
  };

  const handleAttributeSelect = (attributeId) => {
    setSelectedAttribute(attributeId);
    setSelectedOptions([]);
  };

  const handleOptionToggle = (option) => {
    setSelectedOptions((prev) => {
      const isSelected = prev.some((opt) => opt.id === option.id);
      if (isSelected) {
        return prev.filter((opt) => opt.id !== option.id);
      } else {
        return [...prev, option];
      }
    });
  };

  const handleSaveOptions = () => {
    if (selectedAttribute && selectedOptions.length > 0) {
      const newAttribute = {
        attribute: selectedAttribute,
        options: selectedOptions,
      };

      setProductAttributes((prev) => {
        // Check if attribute already exists
        const existingIndex = prev.findIndex(
          (pa) => pa.attribute === selectedAttribute
        );
        if (existingIndex >= 0) {
          // Update existing attribute's options
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            options: [...selectedOptions],
          };
          return updated;
        } else {
          // Add new attribute
          return [...prev, newAttribute];
        }
      });

      setShowSidebar(false);
      setSelectedAttribute("");
      setSelectedOptions([]);
    }
  };

  const removeAttribute = (index) => {
    setProductAttributes((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="p-4 bg-white shadow-lg rounded-lg">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Atributos y variantes</h3>
          <button
            type="button"
            onClick={handleAddClick}
            className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <Plus className="h-5 w-5" />
            Agregar atributo
          </button>
        </div>

        {/* Lista de atributos seleccionados */}
        <div className="space-y-4">
          {productAttributes.map((pa, index) => {
            const attr = attributes.find((a) => a.id === pa.attribute);
            return (
              <div
                key={index}
                className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900">
                      {attr?.name}
                    </h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {pa.options.map((opt) => (
                        <span
                          key={opt.id}
                          className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {opt.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => removeAttribute(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Panel lateral */}
      <div
        className={`fixed inset-y-0 right-0 w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          showSidebar ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">
                Agregar atributo
              </h3>
              <button
                onClick={handleClosePanel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Selector de atributo */}
              <div className="flex justify-between items-center max-w-4xl">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar atributo
                </label>

                <button
                  type="button"
                  onClick={() => setCreatingNewAttribute(true)}
                  className="text-blue-700 rounded-lg transition-all duration-200"
                >
                  Crear nuevo atributo
                </button>
              </div>
              <div>
                <select
                  value={selectedAttribute}
                  onChange={(e) => handleAttributeSelect(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccione un atributo</option>
                  {attributes.map((attr) => (
                    <option key={attr.id} value={attr.id}>
                      {attr.name}
                    </option>
                  ))}
                </select>
                {creatingNewAttribute && (
                  <div className="space-y-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nuevo atributo
                      </label>
                      <input
                        type="text"
                        value={newAttributeName}
                        onChange={(e) => setNewAttributeName(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                        placeholder="Ej: Talla, Color"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nueva opción
                      </label>
                      <input
                        type="text"
                        value={newOptionName}
                        onChange={(e) => setNewOptionName(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                        placeholder="Ej: Rojo, M, Grande"
                      />
                    </div>
                    <button
                      type="button"
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg"
                      onClick={async () => {
                        try {
                          const newAttr = await createAttribute({
                            name: newAttributeName,
                          });
                          const newOpt = await createAttributeOption({
                            name: newOptionName,
                            attribute: newAttr.id,
                          });

                          // Opcional: podrías actualizar la lista de atributos con el nuevo
                          // setAttributes(prev => [...prev, newAttr]); // si tuvieras setAttributes

                          setSelectedAttribute(newAttr.id);
                          setSelectedOptions([newOpt]);

                          setCreatingNewAttribute(false);
                          setNewAttributeName("");
                          setNewOptionName("");
                        } catch (error) {
                          console.error(
                            "Error al crear atributo y opción:",
                            error
                          );
                        }
                      }}
                    >
                      Guardar
                    </button>
                  </div>
                )}
              </div>

              {/* Selección de opciones */}
              {selectedAttribute && attributeOptions.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opciones disponibles
                  </label>
                  <div className="space-y-2">
                    {attributeOptions.map((option) => (
                      <label
                        key={option.id}
                        className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                      >
                        <input
                          type="checkbox"
                          checked={selectedOptions.some(
                            (opt) => opt.id === option.id
                          )}
                          onChange={() => handleOptionToggle(option)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          data-option-id={option.id}
                        />
                        <span className="ml-3 text-gray-700">
                          {option.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t bg-gray-50">
            <button
              onClick={handleSaveOptions}
              disabled={!selectedAttribute || selectedOptions.length === 0}
              className="w-full bg-blue-500 text-white py-2.5 px-4 rounded-lg hover:bg-blue-600 
                disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Agregar opciones
            </button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm transition-opacity z-40"
          onClick={handleClosePanel}
        />
      )}
    </div>
  );
};

export default AttributeManager;
