import { Save } from "lucide-react";

const FormFooter = ({ onCancel, onSave, isLoading }) => {
  return (
    <div className="flex justify-end gap-2 p-4 border-t">
      <button
        onClick={onCancel}
        className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
        disabled={isLoading}
      >
        Cancelar
      </button>
      <button
        onClick={onSave}
        disabled={isLoading}
        className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
      >
        {isLoading ? (
          <svg
            className="animate-spin h-5 w-5 mr-1 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        ) : (
          <Save size={16} />
        )}
        Guardar
      </button>
    </div>
  );
};

export default FormFooter;
