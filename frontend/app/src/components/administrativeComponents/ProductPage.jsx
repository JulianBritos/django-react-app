import React from "react";

export default function EmptyProductView({ onAddProduct }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
      <img
        src="/ruta/a/tu/imagen.png" // Cambia esto por la ruta real donde guardes la imagen
        alt="Sin productos"
        className="w-60 h-60 mb-6"
      />
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
        No hay productos
      </h2>
      <p className="text-gray-600 mb-6 max-w-md">
        Empieza a añadir productos a tu tienda para que tus clientes puedan verlos y comprarlos.
      </p>
      <button
        onClick={onAddProduct}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow transition"
      >
        Agregar producto
      </button>
    </div>
  );
}
