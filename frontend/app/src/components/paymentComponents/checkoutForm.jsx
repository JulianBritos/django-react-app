import React, { useState } from "react";

const CheckoutForm = () => {
  const [paymentMethod, setPaymentMethod] = useState("creditCard");

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-semibold text-center mb-8">Checkout</h1>

      {/* Formulario de Información de Envío */}
      <div className="mb-8">
        <h2 className="text-xl font-medium mb-4">Información de Envío</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre completo
            </label>
            <input
              type="text"
              placeholder="John Doe"
              className="mt-1 p-2 w-full border rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Dirección
            </label>
            <input
              type="text"
              placeholder="123 Main St"
              className="mt-1 p-2 w-full border rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Ciudad
            </label>
            <input
              type="text"
              placeholder="Buenos Aires"
              className="mt-1 p-2 w-full border rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Código Postal
            </label>
            <input
              type="text"
              placeholder="C1416"
              className="mt-1 p-2 w-full border rounded-md shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Formulario de Métodos de Pago */}
      <div className="mb-8">
        <h2 className="text-xl font-medium mb-4">Método de Pago</h2>
        <div className="space-y-4">
          <div>
            <input
              type="radio"
              id="creditCard"
              name="paymentMethod"
              value="creditCard"
              checked={paymentMethod === "creditCard"}
              onChange={() => setPaymentMethod("creditCard")}
              className="mr-2"
            />
            <label htmlFor="creditCard" className="text-sm">
              Tarjeta de Crédito/Débito
            </label>
          </div>
          <div>
            <input
              type="radio"
              id="paypal"
              name="paymentMethod"
              value="paypal"
              checked={paymentMethod === "paypal"}
              onChange={() => setPaymentMethod("paypal")}
              className="mr-2"
            />
            <label htmlFor="paypal" className="text-sm">
              PayPal
            </label>
          </div>
          <div>
            <input
              type="radio"
              id="bankTransfer"
              name="paymentMethod"
              value="bankTransfer"
              checked={paymentMethod === "bankTransfer"}
              onChange={() => setPaymentMethod("bankTransfer")}
              className="mr-2"
            />
            <label htmlFor="bankTransfer" className="text-sm">
              Transferencia Bancaria
            </label>
          </div>
        </div>
      </div>

      {/* Resumen de la Compra */}
      <div className="mb-8 border-t pt-4">
        <h2 className="text-xl font-medium mb-4">Resumen de la Compra</h2>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Producto 1</span>
            <span className="text-sm">$30.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Producto 2</span>
            <span className="text-sm">$50.00</span>
          </div>
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>$80.00</span>
          </div>
        </div>
      </div>

      {/* Botón de Confirmación */}
      <div className="text-center">
        <button className="w-full bg-thirdary-500 text-white p-3 rounded-lg hover:bg-thirdary-600 focus:outline-none focus:ring-2 focus:ring-thirdary-400">
          Confirmar Pedido
        </button>
      </div>
    </div>
  );
};

export default CheckoutForm;
