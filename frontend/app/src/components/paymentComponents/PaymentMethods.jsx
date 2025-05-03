import React from "react";

const PaymentMethods = () => {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6 text-center">
        Mis Métodos de Pago
      </h1>

      {/* Lista de Métodos de Pago Guardados */}
      <div className="bg-white p-4 rounded-xl shadow-md mb-8">
        <h2 className="text-xl font-medium mb-4">Guardados</h2>
        <div className="space-y-4">
          {[1, 2].map((method) => (
            <div
              key={method}
              className="border rounded-lg p-4 flex justify-between items-center text-sm text-gray-700"
            >
              <div>
                <p className="font-medium">Visa terminada en 4242</p>
                <p className="text-gray-500">Expira 12/26</p>
              </div>
              <button className="text-red-600 hover:underline">Eliminar</button>
            </div>
          ))}
        </div>
      </div>

      {/* Formulario para Agregar Nuevo Método */}
      <div className="bg-white p-4 rounded-xl shadow-md">
        <h2 className="text-xl font-medium mb-4">Agregar nuevo método</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Número de Tarjeta
            </label>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              className="mt-1 p-2 w-full border rounded-md shadow-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fecha de Vencimiento
              </label>
              <input
                type="text"
                placeholder="MM/AA"
                className="mt-1 p-2 w-full border rounded-md shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                CVV
              </label>
              <input
                type="text"
                placeholder="123"
                className="mt-1 p-2 w-full border rounded-md shadow-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
          >
            Guardar Método de Pago
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentMethods;
