import { useState, useEffect } from "react";
import Select from "react-select";
import { getVariants, getVariantOptions } from "../api/variants.api";

const ProductForm = ({ onSave, initialVariants, initialVariantOptions }) => {
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "", // Precio base
    category_id: "",
    images: [],
    variant_ids: [], // IDs de variantes genéricas
    product_variants: [], // Combinaciones específicas
  });

  const [variantsData, setVariantsData] = useState([]); // Renombrado
  const [variantOptionsData, setVariantOptionsData] = useState([]); // Renombrado
  const [currentCombination, setCurrentCombination] = useState({
    sku: "",
    price: "",
    stock: "",
    option_ids: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      const variantsResponse = await getVariants();
      setVariantsData(variantsResponse.data);

      const optionsResponse = await getVariantOptions();
      setVariantOptionsData(optionsResponse.data);
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleFileChange = (e) => {
    setProduct({
      ...product,
      images: Array.from(e.target.files),
    });
  };

  const handleVariantChange = (selectedOptions) => {
    setProduct({
      ...product,
      variant_ids: selectedOptions.map((opt) => opt.value),
    });
  };

  const handleCombinationChange = (e) => {
    const { name, value } = e.target;
    setCurrentCombination({
      ...currentCombination,
      [name]: value,
    });
  };

  const handleOptionSelect = (selectedOptions) => {
    setCurrentCombination({
      ...currentCombination,
      option_ids: selectedOptions.map((opt) => opt.value),
    });
  };

  const addCombination = () => {
    if (
      currentCombination.sku &&
      currentCombination.price &&
      currentCombination.stock &&
      currentCombination.option_ids.length > 0
    ) {
      setProduct({
        ...product,
        product_variants: [
          ...product.product_variants,
          {
            sku: currentCombination.sku,
            price: parseFloat(currentCombination.price),
            stock: parseInt(currentCombination.stock),
            option_ids: currentCombination.option_ids,
          },
        ],
      });
      setCurrentCombination({
        sku: "",
        price: "",
        stock: "",
        option_ids: [],
      });
    }
  };

  const removeCombination = (index) => {
    const updated = [...product.product_variants];
    updated.splice(index, 1);
    setProduct({ ...product, product_variants: updated });
  };

  const generateSKU = () => {
    const prefix = product.name.substring(0, 3).toUpperCase();
    const optionsStr = currentCombination.option_ids
      .map((optId) => {
        const opt = variantOptionsData.find((o) => o.id == optId);
        return opt.value.substring(0, 3).toUpperCase();
      })
      .join("-");
    setCurrentCombination({
      ...currentCombination,
      sku: `${prefix}-${optionsStr}`,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(product);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      {/* Sección de información básica */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">Nombre:</label>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Precio Base:</label>
          <input
            type="number"
            name="price"
            value={product.price}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            step="0.01"
          />
        </div>
      </div>

      <div>
        <label className="block mb-1 font-medium">Descripción:</label>
        <textarea
          name="description"
          value={product.description}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          rows={3}
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Categoría ID:</label>
        <input
          type="number"
          name="category_id"
          value={product.category_id}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Sección de variantes genéricas */}
      <div className="border-t pt-4">
        <h3 className="font-bold mb-2">Variantes Disponibles</h3>
        <Select
          isMulti
          options={variantsData.map((variant) => ({
            value: variant.id,
            label: variant.name,
          }))}
          onChange={handleVariantChange}
          value={variantsData
            .filter((v) => product.variant_ids.includes(v.id))
            .map((v) => ({ value: v.id, label: v.name }))}
          className="basic-multi-select"
          classNamePrefix="select"
        />
      </div>

      {/* Sección de combinaciones específicas */}
      <div className="border-t pt-4">
        <h3 className="font-bold mb-2">Combinaciones de Variantes</h3>

        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block mb-1">SKU:</label>
              <input
                type="text"
                name="sku"
                value={currentCombination.sku}
                onChange={handleCombinationChange}
                className="w-full p-2 border rounded"
                placeholder="Ej: CAM-ROJO-M"
              />
              <button
                type="button"
                onClick={generateSKU}
                className="mt-1 text-sm text-blue-600"
              >
                Generar SKU
              </button>
            </div>

            <div>
              <label className="block mb-1">Precio:</label>
              <input
                type="number"
                name="price"
                value={currentCombination.price}
                onChange={handleCombinationChange}
                className="w-full p-2 border rounded"
                step="0.01"
              />
            </div>

            <div>
              <label className="block mb-1">Stock:</label>
              <input
                type="number"
                name="stock"
                value={currentCombination.stock}
                onChange={handleCombinationChange}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1">Opciones:</label>
            <Select
              isMulti
              options={variantOptionsData.map((option) => ({
                value: option.id,
                label: `${option.variant.name}: ${option.value}`,
              }))}
              onChange={handleOptionSelect}
              value={variantOptionsData
                .filter((opt) => currentCombination.option_ids.includes(opt.id))
                .map((opt) => ({
                  value: opt.id,
                  label: `${opt.variant.name}: ${opt.value}`,
                }))}
              className="basic-multi-select"
              classNamePrefix="select"
            />
          </div>

          <button
            type="button"
            onClick={addCombination}
            className="bg-purple-500 text-white px-4 py-2 rounded"
          >
            Añadir Combinación
          </button>
        </div>

        {/* Lista de combinaciones añadidas */}
        {product.product_variants.length > 0 && (
          <div className="mt-4">
            <h4 className="font-bold mb-2">Combinaciones Añadidas</h4>
            <ul className="space-y-2">
              {product.product_variants.map((pv, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center bg-gray-100 p-2 rounded"
                >
                  <div>
                    <span className="font-medium">{pv.sku}</span> - ${pv.price}{" "}
                    - Stock: {pv.stock}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCombination(index)}
                    className="text-red-500"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Sección de imágenes */}
      <div className="border-t pt-4">
        <label className="block mb-1 font-medium">Imágenes:</label>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="border-t pt-4">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700"
        >
          Guardar Producto
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
