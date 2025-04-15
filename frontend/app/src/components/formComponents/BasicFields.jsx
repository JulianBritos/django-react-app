import { useState, useEffect, useRef } from "react";
import { Trash2 } from "lucide-react"; // Ícono de Lucide

const BasicFields = ({
  formData,
  categories,
  handleChange,
  handleImageChange,
  formSubmitted,
}) => {
  const [errors, setErrors] = useState({});
  const [imagePreviews, setImagePreviews] = useState([]);
  const dropRef = useRef(null);

  // Genera previews de imágenes cada vez que cambia formData.images
  useEffect(() => {
    // Limpia previews anteriores para evitar fugas de memoria
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));

    const previews = formData.images.map((file) =>
      URL.createObjectURL(file)
    );
    setImagePreviews(previews);

    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [formData.images]);

  // Validación de errores al intentar enviar el formulario
  useEffect(() => {
    if (formSubmitted) {
      const newErrors = {};
      if (!formData.name.trim()) newErrors.name = "El nombre es obligatorio";
      if (!formData.category) newErrors.category = "Seleccione una categoría";
      if (formData.price === "" || Number(formData.price) < 0)
        newErrors.price = "Ingrese un precio válido";
      setErrors(newErrors);
    }
  }, [formSubmitted, formData]);

  // Maneja archivos al soltar imágenes en la zona de drop
  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );
    if (files.length > 0) {
      // Combina imágenes anteriores con nuevas
      const updatedImages = [...formData.images, ...files];
      const event = { target: { files: updatedImages } };
      handleImageChange(event);
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleClickUpload = () => {
    dropRef.current.click(); // Simula click en input hidden
  };

  const handleRemoveImage = (indexToRemove) => {
    const newImages = formData.images.filter((_, i) => i !== indexToRemove);
    const event = { target: { files: newImages } };
    handleImageChange(event);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Nombre */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Nombre*
        </label>
        <input
          id="name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        {formSubmitted && errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name}</p>
        )}
      </div>

      {/* Categoría */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium mb-1">
          Categoría*
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="">Seleccionar categoría</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {formSubmitted && errors.category && (
          <p className="text-red-500 text-sm mt-1">{errors.category}</p>
        )}
      </div>

      {/* Precio */}
      <div>
        <label htmlFor="price" className="block text-sm font-medium mb-1">
          Precio Base*
        </label>
        <input
          id="price"
          type="number"
          name="price"
          min="0"
          value={formData.price}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        {formSubmitted && errors.price && (
          <p className="text-red-500 text-sm mt-1">{errors.price}</p>
        )}
      </div>

      {/* Dropzone - toda la fila */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium mb-1">Imágenes</label>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={handleClickUpload}
          className="w-full p-6 border-2 border-dashed border-gray-300 rounded cursor-pointer text-center text-sm text-gray-600 hover:bg-gray-50 transition"
        >
          Arrastra imágenes aquí o haz clic para subir
        </div>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => {
            const files = Array.from(e.target.files);
            const updatedImages = [...formData.images, ...files];
            const event = { target: { files: updatedImages } };
            handleImageChange(event);
          }}
          ref={dropRef}
          className="hidden"
        />
      </div>

      {/* Miniaturas - toda la fila */}
      {imagePreviews.length > 0 && (
        <div className="md:col-span-2 mt-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {imagePreviews.map((src, i) => (
            <div key={src} className="relative group">
              <img
                src={src}
                alt={`Preview ${i}`}
                className="w-full h-32 object-cover rounded border"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(i)}
                className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md hover:bg-red-100"
              >
                <Trash2 size={16} className="text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BasicFields;
