import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import {
  createAttribute,
  createAttributeOption,
} from "../../api/attributes.api";
import { Button } from "../ui/Button";

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
  const [newOptionNames, setNewOptionNames] = useState([""]);
  const [selectedAttributeName, setSelectedAttributeName] = useState("");

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
    // Convertir el attributeId a número ya que viene como string del select
    const attr = attributes.find((a) => a.id === parseInt(attributeId, 10));
    if (attr) {
      setSelectedAttribute(attributeId);
      setSelectedOptions([]);
      setSelectedAttributeName(attr.name);
    }
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

  const handleRemoveOption = (attributeId, optionId) => {
    setProductAttributes(
      (prev) =>
        prev
          .map((pa) =>
            pa.attribute === attributeId
              ? {
                  ...pa,
                  options: pa.options.filter((opt) => opt.id !== optionId),
                }
              : pa
          )
          .filter((pa) => pa.options.length > 0) // elimina atributos sin opciones
    );
  };

  return (
    <div className="p-4 bg-white shadow-lg rounded-lg">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Atributos y variantes</h3>
          <Button variant="outline" size="sm" onClick={handleAddClick}>
            Agregar atributo
          </Button>
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
                      {attributes.find(
                        (a) => a.id === parseInt(pa.attribute, 10)
                      )?.name || "Atributo sin nombre"}
                    </h4>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {pa.options.map((opt) => (
                        <div
                          key={opt.id}
                          className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          <span>{opt.name}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleRemoveOption(pa.attribute, opt.id)
                            }
                            className=" ml-1"
                            title="Quitar opción"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAttribute(index)}
                    className="transition-colors duration-200"
                  >
                    <X className="h-5 w-5" />
                  </Button>
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
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClosePanel}
                className="transition-colors"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Selector de atributo */}
              <div className="flex justify-between items-center max-w-4xl">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedAttribute
                    ? "Atributo seleccionado"
                    : "Seleccionar atributo"}
                </label>

                <Button
                  variant="link"
                  onClick={() => {
                    setCreatingNewAttribute(true);
                    setSelectedAttribute("");
                    setSelectedAttributeName("");
                    setSelectedOptions([]);
                  }}
                  className="transition-all duration-200"
                >
                  Crear nuevo atributo
                </Button>
              </div>
              <div>
                {!creatingNewAttribute && !selectedAttribute && (
                  <select
                    value={selectedAttribute}
                    onChange={(e) => handleAttributeSelect(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Seleccione un atributo</option>
                    {attributes.map((attr) => (
                      <option key={attr.id} value={attr.id}>
                        {attr.name}
                      </option>
                    ))}
                  </select>
                )}

                {selectedAttribute && !creatingNewAttribute && (
                  <div className="p-3 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">
                        {attributes.find(
                          (a) => a.id === parseInt(selectedAttribute, 10)
                        )?.name || selectedAttributeName}
                      </span>
                      <Button
                        variant="link"
                        onClick={() => {
                          setSelectedAttribute("");
                          setSelectedAttributeName("");
                          setSelectedOptions([]);
                        }}
                        className="text-sm"
                      >
                        Cambiar
                      </Button>
                    </div>
                  </div>
                )}

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
                        Opciones del nuevo atributo
                      </label>

                      {newOptionNames.map((name, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 mb-2"
                        >
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => {
                              const updated = [...newOptionNames];
                              updated[index] = e.target.value;
                              setNewOptionNames(updated);
                            }}
                            className="flex-1 p-2 border rounded-lg"
                            placeholder={`Ej: opción ${index + 1}`}
                          />
                          {index === newOptionNames.length - 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setNewOptionNames([...newOptionNames, ""])
                              }
                              className=""
                            >
                              <Plus className="w-5 h-5" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCreatingNewAttribute(false);
                          setNewAttributeName("");
                          setNewOptionNames([""]);
                        }}
                        fullWidth
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="success"
                        onClick={async () => {
                          try {
                            const newAttr = await createAttribute({
                              name: newAttributeName,
                            });
                            const createdOptions = await Promise.all(
                              newOptionNames
                                .filter((name) => name.trim() !== "")
                                .map((name) =>
                                  createAttributeOption({
                                    name,
                                    attribute: newAttr.id,
                                  })
                                )
                            );

                            setSelectedAttribute(newAttr.id);
                            setSelectedOptions(createdOptions);
                            setSelectedAttributeName(newAttributeName);
                            setCreatingNewAttribute(false);
                            setNewAttributeName("");
                            setNewOptionNames([""]);
                          } catch (error) {
                            console.error(
                              "Error al crear atributo y opción:",
                              error
                            );
                          }
                        }}
                        fullWidth
                      >
                        Guardar
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Selección de opciones */}
              {selectedAttribute && attributeOptions.length > 0 && (
                <div className="space-y-4 mt-6">
                  <label className="block text-sm font-medium text-gray-700">
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
                          className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
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
            <Button
              variant="primary"
              onClick={handleSaveOptions}
              disabled={!selectedAttribute || selectedOptions.length === 0}
              fullWidth
            >
              Agregar opciones
            </Button>
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
