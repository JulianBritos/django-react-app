const BasicFields = ({
    formData,
    categories,
    handleChange,
    handleImageChange,
  }) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre*</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
  
        <div>
          <label className="block text-sm font-medium mb-1">Categoría*</label>
          <select
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
        </div>
  
        <div>
          <label className="block text-sm font-medium mb-1">Precio Base*</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
  
        <div>
          <label className="block text-sm font-medium mb-1">Imágenes</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-2 border rounded"
          />
          {formData.images.length > 0 && (
            <div className="text-sm text-gray-600 mt-1">
              {formData.images.length} imagen(es) seleccionada(s)
            </div>
          )}
        </div>
      </div>
    );
  };
  
  export default BasicFields;
  