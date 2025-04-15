import React, { useState, useEffect } from "react";
import { Save } from "lucide-react";
import {
  getCategories
} from "../api/categorys.api";
import {
  getAttributes,
  getAttributeOptions,
  createAttribute,
} from "../api/attributes.api";
import {
  createProduct,
  updateProduct,
} from "../api/products.api";
import { getProducts } from "../api/products.api";

import FormHeader from "./formComponents/FormHeader";
import FormMessages from "./formComponents/FormMessages";
import FormFields from "./formComponents/BasicFields";
import ProductAttributesSection from "./formComponents/AttributeManager";
import FormFooter from "./formComponents/FormFooter";

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setFormData((prev) => ({ ...prev, images: files }));
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

  const handleSave = async () => {
    setError("");
    setSuccessMessage("");

    if (!formData.name || !formData.category || !formData.description) {
      setError("Nombre, categoría y descripción son requeridos.");
      return;
    }

    if (formData.price <= 0) {
      setError("El precio debe ser mayor a 0.");
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <FormHeader onCancel={onCancel} product={product} />
        <FormMessages error={error} successMessage={successMessage} />

        <div className="p-6 space-y-6">
          <FormFields
            formData={formData}
            categories={categories}
            handleChange={handleChange}
            handleImageChange={handleImageChange}
          />
          <div>
            <label className="block text-sm font-medium mb-1">Descripción*</label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
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
    </div>
  );
};

export default ProductForm3;
