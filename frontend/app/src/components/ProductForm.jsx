import { useState } from "react";

const ProductForm = ({ onSave }) => {
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    image: [],
  });

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
        <label>Imagen:</label>
        <input type="file" multiple onChange={handleFileChange} />
      </div>

      <button type="submit">Guardar Producto</button>
    </form>
  );
};

export default ProductForm;
