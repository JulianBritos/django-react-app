import { useState, useEffect } from "react";
import Select from "react-select";
import { getVariants } from "../api/variants.api";

const ProductForm = ({ onSave }) => {
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    image: [],
    selectedVariants: [],
  });

  const [variants, setVariants] = useState([]);
  useEffect(() => {
    // Cargar variantes al montar el componente
    const fetchVariants = async () => {
      const data = await getVariants();
      setVariants(data);
    };
    fetchVariants();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files); // ✅ Convierte FileList en array

    setProduct((prevProduct) => ({
      ...prevProduct,
      images: files, // ✅ Guarda todas las imágenes
    }));
  };

  const handleVariantChange = (selectedOptions) => {
    setProduct((prevProduct) => ({
      ...prevProduct,
      selectedVariants: selectedOptions.map((opt) => opt.value), // Solo IDs
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(product);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Nombre:</label>
        <input
          type="text"
          name="name"
          value={product.name}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Descripción:</label>
        <textarea
          name="description"
          value={product.description}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Precio:</label>
        <input
          type="number"
          name="price"
          value={product.price}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Categoría (ID por ahora):</label>
        <input
          type="number"
          name="category_id"
          value={product.category_id}
          onChange={handleChange}
          //required
        />
      </div>

      <div>
        <label>Variantes:</label>
        <Select
          isMulti
          options={variants.map((variant) => ({
            value: variant.id,
            label: `${variant.name} - ${variant.value}`,
          }))}
          value={variants
            .filter((variant) => product.selectedVariants.includes(variant.id))
            .map((variant) => ({
              value: variant.id,
              label: `${variant.name} - ${variant.value}`,
            }))}
          onChange={handleVariantChange}
        />
      </div>

      <div>
        <label>Imagen:</label>
        <input type="file" multiple onChange={handleFileChange} />
      </div>

      <div className="mt-4">
        <button
          className="bg-white text-black shadow-md shadow-purple-400"
          type="submit"
        >
          Guardar Producto
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
