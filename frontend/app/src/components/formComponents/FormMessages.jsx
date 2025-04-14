import { AlertCircle, Save } from "lucide-react";

const FormMessages = ({ error, successMessage }) => {
  return (
    <div className="space-y-2 px-6 pt-4">
      {error && (
        <div className="bg-red-100 text-red-700 p-3 flex items-center gap-2 rounded">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
      {successMessage && (
        <div className="bg-green-100 text-green-700 p-3 flex items-center gap-2 rounded">
          <Save size={18} />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
};

export default FormMessages;
