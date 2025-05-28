import React, { useState, useEffect } from "react";
import { getCategories } from "../../api/categorys.api";
import {
  getAttributes,
  getAttributeOptionsByAttributeId,
} from "../../api/attributes.api";
import {
  createProduct,
  updateProduct,
  createProductAttribute,
} from "../../api/products.api";

import FormHeader from "./FormHeader";
import FormMessages from "./FormMessages";
import NameField from "./NameField";
import CategoryField from "./CategoryField";
import PriceField from "./PriceField";
import ImageField from "./ImageField";
import AttributeManager from "./AttributeManager";
import FormFooter from "./FormFooter";
import DescriptionField from "./DescriptionField";

function crossJoin(optionsPerAttribute) {
  return optionsPerAttribute.reduce(
    (acc, options) =>
      acc.map((combo) => options.map((opt) => [...combo, opt])).flat(),
    [[]]
  );
}

const ProductForm = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || 0,
    category: product?.category || "",
    images: product?.uploaded_images || [],
    status: product?.status || "",
  });

  const [attributes, setAttributes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productAttributes, setProductAttributes] = useState(
    product?.attributes || []
  );
  const [selectedAttribute, setSelectedAttribute] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [imagePreviews, setImagePreviews] = useState([]);
  const [combinations, setCombinations] = useState([]);
  const [attributeOptions, setAttributeOptions] = useState([]);

  useEffect(() => {
    if (productAttributes.length === 0) {
      setCombinations([]);
      return;
    }

    const optionsPerAttribute = productAttributes.map((pa) =>
      pa.options.map((opt) => ({
        attributeId: pa.attribute,
        optionId: opt.id,
        optionName: opt.name,
      }))
    );

    const rawCombinations = crossJoin(optionsPerAttribute);

    const enrichedCombinations = rawCombinations.map((combo) => ({
      attributes: combo,
      stock: 0,
      price: 0,
      images: [], // Add array to store image associations
      sku: "", // Add SKU field
    }));

    setCombinations(enrichedCombinations);
  }, [productAttributes]);

  useEffect(() => {
    if (product?.uploaded_images) {
      setFormData((prev) => ({
        ...prev,
        category: product.category?.id || "",
      }));
    }

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

  useEffect(() => {
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    const previews = formData.images.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [formData.images]);

  useEffect(() => {
    const fetchAttributeOptions = async () => {
      if (!selectedAttribute) {
        setAttributeOptions([]);
        return;
      }

      try {
        const options = await getAttributeOptionsByAttributeId(
          selectedAttribute
        );
        setAttributeOptions(options);

        // También actualizar el atributo en la lista general, si necesitás
        setAttributes((prev) =>
          prev.map((attr) =>
            attr.id === selectedAttribute
              ? { ...attr, attributeoption_set: options }
              : attr
          )
        );
      } catch (error) {
        setError("Error al cargar las opciones del atributo.");
      }
    };

    fetchAttributeOptions();
  }, [selectedAttribute]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDescriptionChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      description: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setFormData((prev) => ({ ...prev, images: files }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "El nombre es obligatorio";
    if (!formData.category) newErrors.category = "Seleccione una categoría";
    if (formData.price === "" || Number(formData.price) < 0)
      newErrors.price = "Ingrese un precio válido";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    setError("");
    setSuccessMessage("");

    if (!validateForm()) {
      setError("Por favor corrija los errores antes de continuar.");
      return;
    }

    setIsLoading(true);

    try {
      const productData = new FormData();
      productData.append("name", formData.name);
      productData.append("description", formData.description);
      productData.append("price", formData.price);
      productData.append("category_id", formData.category);

      // Save base product images
      formData.images.forEach((img) => {
        productData.append("uploaded_images", img);
      });

      const savedProduct = product?.id
        ? await updateProduct(product.id, productData)
        : await createProduct(productData);

      // Create product attributes with their combinations and images
      for (const combo of combinations) {
        const variantData = new FormData();
        const optionIds = combo.attributes.map((attr) => attr.optionId);

        variantData.append("product", savedProduct.id);
        variantData.append("attributeoption", JSON.stringify(optionIds));
        variantData.append("stock", combo.stock);
        variantData.append(
          "selling_price",
          parseFloat(formData.price) + parseFloat(combo.price)
        );

        // Append SKU if provided
        variantData.append("sku", combo.sku || "");

        // Append selected images for this variant
        combo.images.forEach((imgIndex) => {
          if (formData.images[imgIndex]) {
            variantData.append("uploaded_images", formData.images[imgIndex]);
          }
        });

        await createProductAttribute(variantData);
      }

      setSuccessMessage("Producto guardado exitosamente.");
      onSave(savedProduct);
    } catch (err) {
      console.error(err);
      setError("Error al guardar el producto.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAttribute = async () => {
    if (!selectedAttribute) return;

    const alreadyExists = productAttributes.some(
      (pa) => pa.attribute === selectedAttribute
    );
    if (alreadyExists) return;

    try {
      const currentAttribute = attributes.find(
        (attr) => attr.id === selectedAttribute
      );
      if (!currentAttribute) return;

      // Obtener las opciones seleccionadas del panel
      const selectedOptions = currentAttribute.attributeoption_set.filter(
        (option) =>
          document.querySelector(`input[data-option-id="${option.id}"]`)
            ?.checked
      );

      if (selectedOptions.length === 0) {
        setError("Debes seleccionar al menos una opción");
        return;
      }

      setProductAttributes((prev) => [
        ...prev,
        {
          attribute: selectedAttribute,
          options: selectedOptions,
        },
      ]);
      setSelectedAttribute("");
    } catch (err) {
      setError("Error al agregar el atributo");
    }
  };

  return (
    <div className="w-full max-w-4xl p-6 space-y-6">
      <FormHeader onCancel={onCancel} product={product} />
      <FormMessages error={error} successMessage={successMessage} />

      <div className="space-y-6">
        <NameField
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
        />
        <DescriptionField
          description={formData.description}
          onChange={handleDescriptionChange}
        />
        <ImageField
          images={formData.images}
          onChange={handleImageChange}
          imagePreviews={imagePreviews}
        />
        <CategoryField
          value={formData.category}
          onChange={handleChange}
          categories={categories}
          error={errors.category}
        />
        <PriceField
          value={formData.price}
          onChange={handleChange}
          error={errors.price}
        />
        <AttributeManager
          attributes={attributes}
          productAttributes={productAttributes}
          setProductAttributes={setProductAttributes}
          selectedAttribute={selectedAttribute}
          setSelectedAttribute={setSelectedAttribute}
          handleAddAttribute={handleAddAttribute}
          attributeOptions={attributeOptions}
        />
      </div>

      {combinations.length > 0 && (
        <div className="p-4 bg-white shadow-lg rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Variantes generadas</h3>
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full bg-white text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-3">Combinación</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Precio adicional</th>
                  <th className="p-3">Imágenes</th>
                  <th className="p-3">Código</th>
                </tr>
              </thead>
              <tbody>
                {combinations.map((combo, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-3">
                      {combo.attributes
                        .map((attr) => attr.optionName)
                        .join(" | ")}
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
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-24 p-2 border rounded"
                        value={combo.price}
                        onChange={(e) => {
                          const updated = [...combinations];
                          updated[index].price =
                            parseFloat(e.target.value) || 0;
                          setCombinations(updated);
                        }}
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
      )}

      <FormFooter
        onCancel={onCancel}
        onSave={handleSave}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ProductForm;
