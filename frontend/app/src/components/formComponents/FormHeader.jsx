import React from "react";
import { Button } from "../ui/Button";

const FormHeader = ({ title, onBack }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <Button
        variant="primary"
        onClick={onBack}
        className="bg-primary-600 text-white px-4 py-2 rounded-lg shadow-[0px_10px_20px_rgba(0,0,0,0.25)] hover:shadow-[0px_15px_25px_rgba(0,0,0,0.35)] hover:bg-primary-700 transition-all duration-200"
      >
        Volver
      </Button>
    </div>
  );
};

export default FormHeader;
