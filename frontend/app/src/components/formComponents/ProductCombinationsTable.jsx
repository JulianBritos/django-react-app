import React from "react";

const ProductCombinationsTable = ({
  combinations,
  setCombinations,
  imagePreviews,
}) => {
  return (
    <div className="p-4 bg-white shadow-lg rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Variantes generadas</h3>
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Combinación</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Precio</th>
              <th className="p-3">Imágenes</th>
              <th className="p-3">Código</th>
            </tr>
          </thead>
          <tbody>
            {combinations.map((combo, index) => (
              <tr key={index} className="border-t">
                <td className="p-3">
                  {combo.attributes.map((attr) => attr.optionName).join(" | ")}
                </td>
                <td className="p-3">
                  <input
                    type="number"
                    min="0"
                    className="w-24 p-2 border rounded"
                    value={combo.stock}
                    onChange={(e) => {
                      const updated = [...combinations];
                      updated[index].stock = parseInt(e.target.value) || 0;
                      setCombinations(updated);
                    }}
                    required
                  />
                </td>
                <td className="p-3">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="w-24 p-2 border rounded"
                    value={combo.price}
                    onChange={(e) => {
                      const updated = [...combinations];
                      updated[index].price = parseFloat(e.target.value) || 0;
                      setCombinations(updated);
                    }}
                    required
                  />
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2 items-center">
                    <div className="flex gap-2">
                      {imagePreviews.map((preview, imgIndex) => (
                        <div
                          key={imgIndex}
                          className={`relative w-12 h-12 border rounded cursor-pointer ${
                            combo.images.includes(imgIndex)
                              ? "border-primary-500 border-3"
                              : "border-gray-200"
                          }`}
                          onClick={() => {
                            const updated = [...combinations];
                            const imageIndex =
                              updated[index].images.indexOf(imgIndex);
                            if (imageIndex === -1) {
                              updated[index].images.push(imgIndex);
                            } else {
                              updated[index].images.splice(imageIndex, 1);
                            }
                            setCombinations(updated);
                          }}
                        >
                          <img
                            src={preview}
                            alt={`Preview ${imgIndex + 1}`}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <input
                    type="text"
                    value={combo.sku}
                    onChange={(e) => {
                      const updated = [...combinations];
                      updated[index].sku = e.target.value;
                      setCombinations(updated);
                    }}
                    className="w-24 p-2 border rounded"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductCombinationsTable;
