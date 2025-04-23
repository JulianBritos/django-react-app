import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';

const AttributeManagerOriginal = ({ attributes, onChange }) => {
  const [attributeBlocks, setAttributeBlocks] = useState([]);

  const handleAddAttributeBlock = () => {
    setAttributeBlocks([...attributeBlocks, {
      attributeId: '',
      optionId: '',
      stock: 0,
      extraPrice: 0
    }]);
  };

  const handleAttributeChange = (index, field, value) => {
    const updated = [...attributeBlocks];
    updated[index][field] = value;
    setAttributeBlocks(updated);
    onChange(updated); // Propagar al padre
  };

  const handleRemoveAttributeBlock = (index) => {
    const updated = [...attributeBlocks];
    updated.splice(index, 1);
    setAttributeBlocks(updated);
    onChange(updated); // Propagar al padre
  };

  return (
    <div className="p-4 bg-white shadow-lg rounded-lg space-y-4">
      <h2 className="text-xl font-semibold mb-4">Atributos del Producto</h2>

      <button
        type="button"
        onClick={handleAddAttributeBlock}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
      >
        + Agregar Atributo
      </button>

      {attributeBlocks.length === 0 && (
        <p className="text-sm text-gray-500">No hay atributos agregados</p>
      )}

      {attributeBlocks.length > 0 && (
        <div className="border p-4 rounded-lg space-y-4 bg-gray-50">
          {attributeBlocks.map((block, index) => (
            <div key={index} className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4 items-end">
              {/* Selector de atributo */}
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1">Nuevo Atributo</label>
                <select
                  value={block.attributeId}
                  onChange={(e) =>
                    handleAttributeChange(index, 'attributeId', e.target.value)
                  }
                  className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                >
                  <option value="">Seleccionar atributo</option>
                  {attributes.map((attr) => (
                    <option key={attr.id} value={attr.id}>
                      {attr.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock */}
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1">Stock</label>
                <input
                  type="number"
                  value={block.stock}
                  onChange={(e) =>
                    handleAttributeChange(index, 'stock', parseInt(e.target.value))
                  }
                  className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  min="0"
                />
              </div>

              {/* Precio adicional + eliminar */}
              <div className="col-span-1 flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Precio Adicional</label>
                  <input
                    type="number"
                    value={block.extraPrice}
                    onChange={(e) =>
                      handleAttributeChange(index, 'extraPrice', parseFloat(e.target.value))
                    }
                    className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    min="0"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveAttributeBlock(index)}
                  className="text-red-600 hover:text-red-800"
                  title="Eliminar atributo"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttributeManagerOriginal;
