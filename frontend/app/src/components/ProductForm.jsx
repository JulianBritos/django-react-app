import { useState } from "react";
import { createProduct } from "../api/products.api";
import { toast } from "react-hot-toast";
import { Upload, Trash2 } from "lucide-react";

const ProductForm = () => {
  const [product, setProduct] = useState({
    name: "",
    description: "",
    base_price: "",
    category_id: "",
    stock: "",
    images: [],
  });

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setProduct({ ...product, images: [...product.images, ...files] });
  };

  const handleRemoveImage = (index) => {
    const updatedImages = [...product.images];
    updatedImages.splice(index, 1);
    setProduct({ ...product, images: updatedImages });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    Object.keys(product).forEach((key) => {
      if (key !== "images") {
        formData.append(key, product[key]);
      }
    });

    product.images.forEach((image) => {
      formData.append("images", image);
    });

    try {
      await createProduct(formData);
      toast.success("Producto creado con éxito!");
      setProduct({
        name: "",
        description: "",
        price: "",
        stock: "",
        images: [],
      });
    } catch (error) {
      toast.error("Error al crear el producto.");
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Crear Producto</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Nombre del producto"
          value={product.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          name="description"
          placeholder="Descripción"
          value={product.description}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Precio"
          value={product.base_price}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="number"
          name="category"
          placeholder="Category"
          value={product.category_id}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="number"
          name="stock"
          placeholder="Stock"
          value={product.stock}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />

        {/* Sección de imágenes */}
        <div className="border p-3 rounded-md">
          <label className="flex items-center gap-2 cursor-pointer">
            <Upload className="w-5 h-5" />
            <span>Subir imágenes</span>
            <input
              type="file"
              multiple
              onChange={handleImageChange}
              className="hidden"
              accept="image/*"
            />
          </label>
          <div className="flex flex-wrap gap-2 mt-2">
            {product.images.map((image, index) => (
              <div key={index} className="relative w-16 h-16">
                <img
                  src={URL.createObjectURL(image)}
                  alt="Preview"
                  className="w-full h-full object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Guardar Producto
        </button>
      </form>
    </div>
  );
};

export default ProductForm;
