import React, { useState, useEffect } from "react";
import { Save } from "lucide-react";
import {
  getCategories
} from "../../api/categorys.api";
import {
  getAttributes,
  getAttributeOptions,
  createAttribute,
} from "../../api/attributes.api";
import {
  createProduct,
  updateProduct,
} from "../../api/products.api";
import { getProducts } from "../../api/products.api";

import FormHeader from "./FormHeader";
import FormMessages from "./FormMessages";
import NameField from "./NameField";
import CategoryField from "./CategoryField";
import PriceField from "./PriceField";
import ImageField from "./ImageField";
import ProductAttributesSection from "./AttributeManager";
import FormFooter from "./FormFooter";
import DescriptionField from "./DescriptionField";

const ProductForm3 = ({ product, onSave, onCancel }) => {
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
  const [productAttributes, setProductAttributes] = useState(product?.attributes || []);
  const [selectedAttribute, setSelectedAttribute] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [imagePreviews, setImagePreviews] = useState([]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

      formData.images.forEach((img) => {
        productData.append("uploaded_images", img);
      });

      const savedProduct = product?.id
        ? await updateProduct(product.id, productData)
        : await createProduct(productData);

      for (const pa of productAttributes) {
        await createAttribute({
          product: savedProduct.id,
          attribute: pa.attribute,
          options: pa.options.map((opt) => opt.id),
        });
      }

      setSuccessMessage("Producto guardado exitosamente.");
      onSave(savedProduct);
    } catch (err) {
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
      const options = await getAttributeOptions(selectedAttribute);
      setProductAttributes((prev) => [
        ...prev,
        {
          attribute: selectedAttribute,
          options,
          stocks: options.map((opt) => ({
            option: opt.id,
            stock: 0,
            price: 0,
          })),
        },
      ]);
      setSelectedAttribute("");
    } catch (err) {
      setError("Error al cargar opciones del atributo");
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
          onChange={handleChange}
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
       
        <ProductAttributesSection
          attributes={attributes}
          productAttributes={productAttributes}
          setProductAttributes={setProductAttributes}
          selectedAttribute={selectedAttribute}
          setSelectedAttribute={setSelectedAttribute}
          handleAddAttribute={handleAddAttribute}
        />
      </div>

      <FormFooter
        onCancel={onCancel}
        onSave={handleSave}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ProductForm3;
