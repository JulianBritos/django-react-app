import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderDetails } from "../../api/orders.api";
import toast from "react-hot-toast";

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const orderData = await getOrderDetails(orderId);
        setOrder(orderData);
      } catch (err) {
        console.error("Error al obtener detalles de la orden:", err);
        setError("No se pudo cargar la información de la orden");
        toast.error("Error al cargar la información de la orden");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando confirmación de orden...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-semibold text-red-600 mb-4">
          Error al cargar la orden
        </h1>
        <p className="text-gray-700 mb-6">
          {error || "No se pudo encontrar la orden solicitada."}
        </p>
        <button
          onClick={() => navigate("/")}
          className="inline-block bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition"
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>
        <h1 className="text-3xl font-semibold text-green-600 mb-2">
          ¡Gracias por tu compra!
        </h1>
        <p className="text-gray-700">
          Tu pedido ha sido confirmado y está en proceso.
        </p>
      </div>

      {/* Resumen del Pedido */}
      <div className="bg-gray-100 rounded-xl p-4 text-left mb-6 shadow-md">
        <h2 className="text-xl font-medium mb-3">Resumen del Pedido</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Número de pedido:</span>
            <span className="font-medium">
              #{order.order_number || order.id}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Fecha:</span>
            <span>{formatDate(order.created_at)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Estado:</span>
            <span className="font-medium capitalize">
              {order.status_display || order.status}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Productos:</span>
            <span>
              {order.items_count || order.items?.length || 0} artículos
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>${parseFloat(order.subtotal_amount || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Envío:</span>
            <span>${parseFloat(order.shipping_amount || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg border-t pt-2">
            <span>Total:</span>
            <span>${parseFloat(order.total_amount || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Detalles de los productos */}
      {order.items && order.items.length > 0 && (
        <div className="bg-white rounded-xl p-4 text-left mb-6 border shadow-sm">
          <h2 className="text-lg font-medium mb-3">Productos ordenados</h2>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.product_name}</p>
                  {item.selected_attributes && (
                    <p className="text-xs text-gray-500">
                      {Object.entries(item.selected_attributes)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(", ")}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Cantidad: {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-medium">
                  ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dirección de envío */}
      {order.shipping_address && (
        <div className="bg-white rounded-xl p-4 text-left mb-6 border shadow-sm">
          <h2 className="text-lg font-medium mb-2">Dirección de envío</h2>
          <p className="text-sm text-gray-700">
            {order.shipping_address.first_name}{" "}
            {order.shipping_address.last_name}
            <br />
            {order.shipping_address.address_line_1}
            <br />
            {order.shipping_address.city}, {order.shipping_address.postal_code}
            <br />
            {order.shipping_address.phone && (
              <>
                Tel: {order.shipping_address.phone}
                <br />
              </>
            )}
          </p>
        </div>
      )}

      {/* Información adicional */}
      {order.notes && (
        <div className="bg-white rounded-xl p-4 text-left mb-6 border shadow-sm">
          <h2 className="text-lg font-medium mb-2">Notas adicionales</h2>
          <p className="text-sm text-gray-700">{order.notes}</p>
        </div>
      )}

      {/* Próximos pasos */}
      <div className="bg-blue-50 rounded-xl p-4 text-left mb-6 border border-blue-200">
        <h2 className="text-lg font-medium mb-2 text-blue-800">
          Próximos pasos
        </h2>
        <div className="text-sm text-blue-700 space-y-1">
          <p>
            • Recibirás un email de confirmación con los detalles de tu pedido
          </p>
          <p>• Te notificaremos cuando tu pedido sea enviado</p>
          <p>• Puedes rastrear tu pedido desde tu cuenta</p>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="text-center space-y-3">
        <button
          onClick={() => navigate("/")}
          className="inline-block bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition mr-3"
        >
          Continuar Comprando
        </button>

        {order.id && (
          <button
            onClick={() => navigate(`/orders/${order.id}`)}
            className="inline-block bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600 transition"
          >
            Ver Detalles de la Orden
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderConfirmation;
