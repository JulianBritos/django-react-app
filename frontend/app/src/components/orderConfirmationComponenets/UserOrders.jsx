// pages/UserOrders.jsx
import React from "react";
import { Link } from "react-router-dom";

const UserOrders = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6 text-center">Mis Pedidos</h1>

      <div className="space-y-4">
        {[1, 2, 3].map((order) => (
          <div
            key={order}
            className="border p-4 rounded-lg shadow-sm flex justify-between items-center"
          >
            <div className="text-sm text-gray-700">
              <p>
                <span className="font-medium">Pedido #:</span> #{order}00123
              </p>
              <p>
                <span className="font-medium">Fecha:</span> 25 de abril de 2025
              </p>
              <p>
                <span className="font-medium">Total:</span> $120.00
              </p>
              <p>
                <span className="font-medium">Estado:</span> Entregado
              </p>
            </div>
            <Link
              to={`/myorders/${order}00123`}
              className="text-blue-600 hover:underline"
            >
              Ver Detalle
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserOrders;
