import React from "react";
import { Button } from "../ui/Button";

const FormFooter = ({ onCancel, onSave, isLoading = false, isSaveHidden = false }) => {
  return (
    <div className="flex justify-end space-x-4 mt-6">
      <Button variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button
        variant="success"
        onClick={onSave}
        disabled={isLoading}
        isLoading={isLoading}
        className={isSaveHidden ? "hidden" : ""}
      >
        Guardar
      </Button>
    </div>
  );
};

export default FormFooter;
