import React from "react";

const OrderConfirmation = () => {
  return (
    <div className="max-w-2xl mx-auto p-6 text-center">
      <h1 className="text-3xl font-semibold text-thirdary-600 mb-4">
        ¡Gracias por tu compra!
      </h1>
      <p className="text-gray-700 mb-6">
        Tu pedido ha sido confirmado y está en proceso.
      </p>

      {/* Resumen del Pedido */}
      <div className="bg-gray-100 rounded-xl p-4 text-left mb-6 shadow-md">
        <h2 className="text-xl font-medium mb-3">Resumen del Pedido</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Número de pedido:</span>
            <span>#123456</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Fecha:</span>
            <span>3 de mayo, 2025</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Productos:</span>
            <span>2 artículos</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Total:</span>
            <span>$80.00</span>
          </div>
        </div>
      </div>

      {/* Dirección de envío */}
      <div className="bg-white rounded-xl p-4 text-left mb-6 border shadow-sm">
        <h2 className="text-lg font-medium mb-2">Dirección de envío</h2>
        <p className="text-sm text-gray-700">
          John Doe
          <br />
          123 Main St
          <br />
          Buenos Aires, C1416
          <br />
          Argentina
        </p>
      </div>

      {/* Botón para seguir navegando */}
      <div className="text-center">
        <a
          href="/"
          className="inline-block bg-thirdary-500 text-white py-2 px-6 rounded-lg hover:bg-thirdary-600 transition"
        >
          Volver al Inicio
        </a>
      </div>
    </div>
  );
};

export default OrderConfirmation;
