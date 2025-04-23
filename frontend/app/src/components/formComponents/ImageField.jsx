import { Trash2, Plus } from "lucide-react";
import { useRef } from "react";

const ImageField = ({ images, onChange, imagePreviews }) => {
  const inputRef = useRef();

  const handleRemoveImage = (indexToRemove) => {
    const newImages = images.filter((_, i) => i !== indexToRemove);
    const event = { target: { files: newImages } };
    onChange(event);
  };

  const handleFiles = (files) => {
    const event = { target: { files: [...images, ...files] } };
    onChange(event);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith("image/")
    );
    if (droppedFiles.length) handleFiles(droppedFiles);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <label className="block text-xl font-semibold mb-3">Fotos</label>

      <div
        className="w-full p-6 border-2 border-dashed border-blue-400 rounded-lg bg-blue-50 text-center text-blue-600 cursor-pointer hover:bg-blue-100 transition relative"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center">
          <Plus className="w-6 h-6 mb-1" />
          <p className="font-medium">Arrastrá y soltá, o subí fotos del producto</p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => {
          const files = Array.from(e.target.files);
          handleFiles(files);
        }}
        className="hidden"
      />

      <p className="text-xs text-gray-500 mt-2">
        📷 Tamaño mínimo recomendado: 1024px / Formatos recomendados: WEBP, PNG, JPEG o GIF
      </p>

      {imagePreviews.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {imagePreviews.map((src, i) => (
            <div key={src} className="relative group">
              <img
                src={src}
                alt={`Preview ${i}`}
                className="w-full h-32 object-cover rounded border"
                style={{
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
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

export default ImageField;
