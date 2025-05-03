import React from "react";

const UserProfilePage = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6 text-center">Mi Perfil</h1>

      {/* Información del Usuario */}
      <div className="bg-white p-4 rounded-xl shadow-md mb-8">
        <h2 className="text-xl font-medium mb-4">Información Personal</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <span className="font-medium">Nombre:</span> John Doe
          </div>
          <div>
            <span className="font-medium">Email:</span> john@example.com
          </div>
          <div>
            <span className="font-medium">Dirección:</span> 123 Main St, Buenos
            Aires
          </div>
          <div>
            <span className="font-medium">Teléfono:</span> +54 11 1234-5678
          </div>
        </div>
      </div>

      {/* Historial de Pedidos */}
      <div className="bg-white p-4 rounded-xl shadow-md">
        <h2 className="text-xl font-medium mb-4">Historial de Pedidos</h2>
        <div className="space-y-4">
          {[1, 2].map((order) => (
            <div key={order} className="border rounded-lg p-4">
              <div className="flex justify-between text-sm text-gray-700 mb-2">
                <div>
                  <span className="font-medium">Pedido #:</span> #{order}00123
                </div>
                <div>
                  <span className="font-medium">Fecha:</span> 2 de mayo, 2025
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-700">
                <div>
                  <span className="font-medium">Total:</span> $80.00
                </div>
                <div>
                  <span className="font-medium">Estado:</span> Enviado
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
