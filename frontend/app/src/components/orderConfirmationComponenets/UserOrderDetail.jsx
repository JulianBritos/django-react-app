// pages/UserOrderDetail.jsx
import React from "react";
import { useParams } from "react-router-dom";

const UserOrderDetail = () => {
  const { orderId } = useParams();

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6 text-center">
        Detalle del Pedido #{orderId}
      </h1>

      {/* Información general */}
      <div className="bg-white p-4 rounded-xl shadow-md mb-6 text-sm text-gray-700">
        <p>
          <span className="font-medium">Fecha:</span> 25 de abril de 2025
        </p>
        <p>
          <span className="font-medium">Estado:</span> Entregado
        </p>
        <p>
          <span className="font-medium">Total:</span> $120.00
        </p>
        <p>
          <span className="font-medium">Dirección de envío:</span> 123 Calle
          Falsa, Buenos Aires
        </p>
      </div>

      {/* Productos */}
      <div className="bg-white p-4 rounded-xl shadow-md text-sm text-gray-700">
        <h2 className="text-xl font-medium mb-4">Productos</h2>
        <ul className="space-y-2">
          <li className="flex justify-between">
            <span>Remera negra x 2</span>
            <span>$40.00</span>
          </li>
          <li className="flex justify-between">
            <span>Gorra blanca x 1</span>
            <span>$25.00</span>
          </li>
          <li className="flex justify-between font-semibold border-t pt-2">
            <span>Total</span>
            <span>$120.00</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UserOrderDetail;
