import React from "react";

export default function EmptyProductView({ onAddProduct }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
      <img
        className="w-60 h-60 mb-6"
        src="https://i.postimg.cc/2V2TScPC/Chat-GPT-Image-20-abr-2025-09-04-22-p-m.png"
        border="0"
        alt="Chat-GPT-Image-20-abr-2025-09-04-22-p-m"
      />

      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
        No hay productos
      </h2>
      <p className="text-gray-600 mb-6 max-w-md">
        Empieza a añadir productos a tu tienda para que tus clientes puedan
        verlos y comprarlos.
      </p>
      <button
        onClick={onAddProduct} // Notificar al nivel superior para renderizar NewProduct
        className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg shadow transition"
      >
        Agregar producto
      </button>
    </div>
  );
}
