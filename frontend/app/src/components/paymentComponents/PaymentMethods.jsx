import React, { useState } from "react";
import { Button } from "../ui/Button";

const PaymentMethods = () => {
  const [methods, setMethods] = useState([
    { id: 1, type: "visa", number: "4242 5678 9012 3456", expiration: "12/26" },
    {
      id: 2,
      type: "mastercard",
      number: "5555 5678 9012 3456",
      expiration: "12/26",
    },
  ]);
  const [newMethod, setNewMethod] = useState({ type: "", number: "" });

  const handleRemoveMethod = (id) => {
    // Implement the logic to remove a method
    console.log("Removing method with id:", id);
  };

  const handleAddMethod = () => {
    // Implement the logic to add a new method
    console.log("Adding new method:", newMethod);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6 text-center">
        Mis Métodos de Pago
      </h1>

      {/* Lista de Métodos de Pago Guardados */}
      <div className="bg-white p-4 rounded-xl shadow-md mb-8">
        <h2 className="text-xl font-medium mb-4">Guardados</h2>
        <div className="space-y-4">
          {methods.map((method) => (
            <div
              key={method.id}
              className="border rounded-lg p-4 flex justify-between items-center text-sm text-gray-700"
            >
              <div>
                <p className="font-medium">
                  {method.type} terminada en {method.number}
                </p>
                <p className="text-gray-500">Expira {method.expiration}</p>
              </div>
              <Button
                variant="link"
                className=""
                onClick={() => handleRemoveMethod(method.id)}
              >
                Eliminar
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Formulario para Agregar Nuevo Método */}
      <div className="mt-6 p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-4">
          Agregar Nuevo Método de Pago
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tipo de Tarjeta
            </label>
            <select
              value={newMethod.type}
              onChange={(e) =>
                setNewMethod({ ...newMethod, type: e.target.value })
              }
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seleccionar tipo</option>
              <option value="visa">Visa</option>
              <option value="mastercard">Mastercard</option>
              <option value="amex">American Express</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Número de Tarjeta
            </label>
            <input
              type="text"
              value={newMethod.number}
              onChange={(e) =>
                setNewMethod({ ...newMethod, number: e.target.value })
              }
              placeholder="1234 5678 9012 3456"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <Button
            variant="success"
            onClick={handleAddMethod}
            disabled={!newMethod.type || !newMethod.number}
          >
            Agregar Método
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethods;
