import { X } from "lucide-react";

const FormHeader = ({ isEditMode }) => {
  return (
    <div className="flex justify-between items-center p-4 mt-8 mx-auto max-w-4xl">
      <h2 className="text-4xl font-semibold">
        {isEditMode ? "Editar Producto" : "Nuevo Producto"}
      </h2>
      <button
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-[0px_10px_20px_rgba(0,0,0,0.25)] hover:shadow-[0px_15px_25px_rgba(0,0,0,0.35)] hover:bg-indigo-700 transition-all duration-200"
      >
        Guardar cambios
      </button>
    </div>
  );
};

export default FormHeader;
