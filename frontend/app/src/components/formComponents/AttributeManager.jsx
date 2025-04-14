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
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Atributos del Producto</h2>

      <button
        type="button"
        onClick={handleAddAttributeBlock}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
      >
        + Agregar Atributo
      </button>

      {attributeBlocks.length === 0 && (
        <p className="text-sm text-muted-foreground">No hay atributos agregados</p>
      )}

      {attributeBlocks.length > 0 && (
        <div className="border p-4 rounded space-y-4">
          {attributeBlocks.map((block, index) => (
            <div key={index} className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4 items-end">
              {/* Selector de atributo */}
              <div className="col-span-1">
                <label className="text-sm font-medium">Nuevo Atributo</label>
                <select
                  value={block.attributeId}
                  onChange={(e) =>
                    handleAttributeChange(index, 'attributeId', e.target.value)
                  }
                  className="w-full border p-2 rounded"
                >
                  <option value="">Seleccionar atributo</option>
                  {attributes.map((attr) => (
                    <option key={attr.id} value={attr.id}>
                      {attr.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector de opción */}
              <div className="col-span-1">
                <label className="text-sm font-medium text-transparent">-</label>
                <select
                  value={block.optionId}
                  onChange={(e) =>
                    handleAttributeChange(index, 'optionId', e.target.value)
                  }
                  className="w-full border p-2 rounded"
                >
                  <option value="">Seleccionar atributo</option>
                  {attributes
                    .find((attr) => attr.id === block.attributeId)
                    ?.options.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Stock */}
              <div className="col-span-1">
                <label className="text-sm font-medium">Stock</label>
                <input
                  type="number"
                  value={block.stock}
                  onChange={(e) =>
                    handleAttributeChange(index, 'stock', parseInt(e.target.value))
                  }
                  className="w-full border p-2 rounded"
                  min="0"
                />
              </div>

              {/* Precio adicional + eliminar */}
              <div className="col-span-1 flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium">Precio Adicional</label>
                  <input
                    type="number"
                    value={block.extraPrice}
                    onChange={(e) =>
                      handleAttributeChange(index, 'extraPrice', parseFloat(e.target.value))
                    }
                    className="w-full border p-2 rounded"
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
