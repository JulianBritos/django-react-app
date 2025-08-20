import React, { useState, useEffect } from "react";
import { getCategories } from "../../api/categories.api";
import {
  getAttributes,
  getAttributeOptionsByAttributeId,
} from "../../api/attributes.api";
import {
  createProduct,
  updateProduct,
  createProductAttribute,
  createProductAttributeLink,
} from "../../api/products.api";

import FormHeader from "./FormHeader";
//import FormMessages from "./FormMessages";
import NameField from "./NameField";
import CategoryField from "./CategoryField";
//import PriceField from "./PriceField";
import ImageField from "./ImageField";
import AttributeManager from "./AttributeManager";
import FormFooter from "./FormFooter";
import DescriptionField from "./DescriptionField";
import toast from "react-hot-toast";
import ProductCombinationsTable from "./ProductCombinationsTable";

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
  const [checkedOptions, setCheckedOptions] = useState({});
  const [isSaveHidden, setIsSaveHidden] = useState(false);

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
      stock: "",
      price: "",
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
        toast.error("Error al cargar datos iniciales");
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
        setCheckedOptions({});
      } catch (error) {
        toast.error("Error al cargar las opciones del atributo.");
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
    // Verificar autenticación
    const token = localStorage.getItem("access");
    if (!token) {
      toast.error("Debes iniciar sesión para crear productos");
      return;
    }

    setIsLoading(true);

    if (!validateForm()) {
      toast.error("Por favor corrija los errores antes de continuar.");
      setIsLoading(false);
      return;
    }

    try {
      const productData = new FormData();
      productData.append("name", formData.name);
      productData.append("description", formData.description);
      productData.append("price", formData.price);
      productData.append("category_id", formData.category);

      formData.images.forEach((img) => {
        productData.append("uploaded_images", img);
      });

      const savedProduct = product?.id
        ? await updateProduct(product.id, productData)
        : await createProduct(productData);

      toast.success("Producto guardado exitosamente.");
      onSave(savedProduct);

      // Oculta el botón Guardar por 5 segundos
      setIsSaveHidden(true);
      setTimeout(() => setIsSaveHidden(false), 5000);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        toast.error("Sesión expirada. Por favor, inicia sesión nuevamente.");
        window.location.href = "/login";
      } else {
        toast.error("Error al guardar el producto.");
      }
      return;
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
        (option) => checkedOptions[option.id]
      );

      if (selectedOptions.length === 0) {
        toast.error("Debes seleccionar al menos una opción");
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
      toast.error("Error al agregar el atributo");
    }
  };
  const handleOptionChange = (optionId) => {
    setCheckedOptions((prev) => ({
      ...prev,
      [optionId]: !prev[optionId],
    }));
  };

  return (
    <div className="w-full max-w p-6 space-y-6">
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

        <AttributeManager
          attributes={attributes}
          productAttributes={productAttributes}
          setProductAttributes={setProductAttributes}
          selectedAttribute={selectedAttribute}
          setSelectedAttribute={setSelectedAttribute}
          handleAddAttribute={handleAddAttribute}
          attributeOptions={attributeOptions}
          checkedOptions={checkedOptions}
          handleOptionChange={handleOptionChange}
        />
      </div>

      {combinations.length > 0 && (
        <ProductCombinationsTable
          combinations={combinations}
          setCombinations={setCombinations}
          imagePreviews={imagePreviews}
        />
      )}

      <FormFooter
        onCancel={onCancel}
        onSave={handleSave}
        isLoading={isLoading}
        isSaveHidden={isSaveHidden}
      />
    </div>
  );
};

export default ProductForm;
