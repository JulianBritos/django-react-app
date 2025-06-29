import React from "react";
import { Button } from "../ui/Button";

const FormFooter = ({ onCancel, onSave, loading = false }) => {
  return (
    <div className="flex justify-end space-x-4 mt-6">
      <Button variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button
        variant="success"
        onClick={onSave}
        disabled={loading}
        isLoading={loading}
      >
        Guardar
      </Button>
    </div>
  );
};

export default FormFooter;
