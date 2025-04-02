import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Save, AlertCircle } from "lucide-react";
import { getCategories } from "../api/categorys.api";
import {
  getAttributes,
  getAttributeOptions,
  createAttribute,
  createAttributeOption,
} from "../api/attributes.api";
import {
  createProduct,
  updateProduct,
  createProductAttribute,
} from "../api/products.api";

const ProductForm3 = ({ product, onSave, onCancel }) => {
  // Estados del formulario
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || 0,
    category: product?.category || "",
    image: null,
  });
  const [attributes, setAttributes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productAttributes, setProductAttributes] = useState(
    product?.attributes || []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, attrs] = await Promise.all([
          getCategories(),
          getAttributes(),
        ]);
        setCategories(cats);
        setAttributes(attrs);
      } catch (err) {
        setError("Error al cargar datos iniciales");
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddAttribute = async () => {
    try {
      const newAttr = await createAttribute({
        name: `Nuevo Atributo ${attributes.length + 1}`,
      });
      const newOption = await createAttributeOption({
        attribute: newAttr.id,
        name: "Opción 1",
      });

      setAttributes([...attributes, newAttr]);
      setProductAttributes([
        ...productAttributes,
        {
          attribute: newAttr.id,
          options: [newOption],
          stocks: [{ option: newOption.id, stock: 0, price: 0 }],
        },
      ]);
    } catch (err) {
      setError("Error al crear atributo");
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.category) {
      setError("Nombre y categoría son requeridos");
      return;
    }

    if (window.confirm("¿Guardar producto?")) {
      setIsLoading(true);
      try {
        // 1. Crear/Actualizar producto
        const productData = new FormData();
        productData.append("name", formData.name);
        productData.append("description", formData.description);
        productData.append("price", formData.price);
        productData.append("category", formData.category);
        if (formData.image) productData.append("image", formData.image);

        const savedProduct = product?.id
          ? await updateProduct(product.id, productData)
          : await createProduct(productData);

        // 2. Guardar atributos del producto
        for (const pa of productAttributes) {
          await createProductAttribute({
            product: savedProduct.id,
            attribute: pa.attribute,
            options: pa.options.map((opt) => opt.id),
          });
        }

        onSave(savedProduct);
      } catch (err) {
        setError("Error al guardar el producto");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">
            {product?.id ? "Editar Producto" : "Nuevo Producto"}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Campos básicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre*
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría*
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Seleccionar categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio Base*
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imagen Principal
              </label>
              <input
                type="file"
                name="image"
                onChange={handleChange}
                className="w-full p-2 border rounded"
                accept="image/*"
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Atributos */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Atributos del Producto</h3>
              <button
                type="button"
                onClick={handleAddAttribute}
                className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                <Plus size={16} />
                <span>Agregar Atributo</span>
              </button>
            </div>

            {productAttributes.length === 0 && (
              <p className="text-gray-500 text-sm">
                No hay atributos agregados
              </p>
            )}

            {productAttributes.map((pa, index) => {
              const attribute = attributes.find((a) => a.id === pa.attribute);
              return (
                <div key={index} className="border p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">
                      {attribute?.name || "Nuevo Atributo"}
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm("¿Eliminar este atributo?")) {
                          setProductAttributes(
                            productAttributes.filter((_, i) => i !== index)
                          );
                        }
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Opciones del atributo */}
                  <div className="space-y-3">
                    {pa.options.map((option, optIndex) => (
                      <div key={optIndex} className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Opción
                          </label>
                          <input
                            type="text"
                            value={option.name}
                            onChange={(e) => {
                              const newOptions = [...pa.options];
                              newOptions[optIndex].name = e.target.value;
                              setProductAttributes(
                                productAttributes.map((item, i) =>
                                  i === index
                                    ? { ...item, options: newOptions }
                                    : item
                                )
                              );
                            }}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Stock
                          </label>
                          <input
                            type="number"
                            value={pa.stocks[optIndex]?.stock || 0}
                            onChange={(e) => {
                              const newStocks = [...pa.stocks];
                              newStocks[optIndex] = {
                                ...newStocks[optIndex],
                                stock: parseInt(e.target.value),
                              };
                              setProductAttributes(
                                productAttributes.map((item, i) =>
                                  i === index
                                    ? { ...item, stocks: newStocks }
                                    : item
                                )
                              );
                            }}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Precio Adicional
                          </label>
                          <input
                            type="number"
                            value={pa.stocks[optIndex]?.price || 0}
                            onChange={(e) => {
                              const newStocks = [...pa.stocks];
                              newStocks[optIndex] = {
                                ...newStocks[optIndex],
                                price: parseFloat(e.target.value),
                              };
                              setProductAttributes(
                                productAttributes.map((item, i) =>
                                  i === index
                                    ? { ...item, stocks: newStocks }
                                    : item
                                )
                              );
                            }}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t">
          <button
            type="button"
            onClick={() => {
              if (
                formData.name ||
                formData.description ||
                productAttributes.length > 0
              ) {
                if (window.confirm("¿Cancelar sin guardar cambios?")) {
                  onCancel();
                }
              } else {
                onCancel();
              }
            }}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            <Save size={18} />
            <span>{isLoading ? "Guardando..." : "Guardar Producto"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductForm3;
