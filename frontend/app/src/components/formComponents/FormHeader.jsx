import { X } from "lucide-react";

const FormHeader = ({ isEditMode, onCancel }) => {
  return (
    <div className="flex justify-between items-center p-4 border-b">
      <h2 className="text-xl font-semibold">
        {isEditMode ? "Editar Producto" : "Nuevo Producto"}
      </h2>
      <button
        onClick={onCancel}
        className="text-gray-500 hover:text-gray-700"
      >
        <X size={24} />
      </button>
    </div>
  );
};

export default FormHeader;
