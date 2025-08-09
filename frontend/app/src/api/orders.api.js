import axios from "axios";

const API_URL = "http://localhost:8000/apps/orders/api";

// Configurar axios con interceptor para incluir session
axios.defaults.withCredentials = true;

// Crear orden (checkout completo)
export const createOrder = async (checkoutData) => {
  try {
    const response = await axios.post(
      `${API_URL}/orders/checkout/`,
      checkoutData
    );
    return response.data;
  } catch (error) {
    console.error("Error al crear orden:", error);
    throw error;
  }
};

// Obtener órdenes del usuario actual
export const getMyOrders = async () => {
  try {
    const response = await axios.get(`${API_URL}/orders/my_orders/`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener órdenes:", error);
    throw error;
  }
};

// Obtener detalles de una orden específica
export const getOrderDetails = async (orderId) => {
  try {
    const response = await axios.get(`${API_URL}/orders/${orderId}/`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener detalles de orden:", error);
    throw error;
  }
};

// Rastrear orden
export const trackOrder = async (orderId) => {
  try {
    const response = await axios.get(`${API_URL}/orders/${orderId}/track/`);
    return response.data;
  } catch (error) {
    console.error("Error al rastrear orden:", error);
    throw error;
  }
};

// Obtener historial de estados de una orden
export const getOrderStatusHistory = async (orderId) => {
  try {
    const response = await axios.get(
      `${API_URL}/orders/${orderId}/status_history/`
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener historial:", error);
    throw error;
  }
};

// Actualizar estado de orden (solo para admins)
export const updateOrderStatus = async (orderId, status, notes = "") => {
  try {
    const response = await axios.patch(
      `${API_URL}/orders/${orderId}/update_status/`,
      {
        status: status,
        notes: notes,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    throw error;
  }
};

// Funciones de utilidad

// Formatear datos de checkout
export const formatCheckoutData = (
  cartId,
  shippingData,
  paymentMethod,
  guestData = null
) => {
  const checkoutData = {
    cart_id: cartId,
    shipping_address: {
      first_name: shippingData.firstName || shippingData.first_name,
      last_name: shippingData.lastName || shippingData.last_name,
      address_line_1: shippingData.address || shippingData.address_line_1,
      city: shippingData.city,
      postal_code: shippingData.postalCode || shippingData.postal_code,
      phone: shippingData.phone || "",
    },
    payment_method: paymentMethod,
    notes: shippingData.notes || "",
  };

  // Si es guest checkout, agregar datos del invitado
  if (guestData) {
    checkoutData.guest_email = guestData.email;
    checkoutData.guest_phone = guestData.phone || shippingData.phone;
    checkoutData.guest_name = `${
      shippingData.firstName || shippingData.first_name
    } ${shippingData.lastName || shippingData.last_name}`;
  }

  return checkoutData;
};

// Formatear órdenes para mostrar en el frontend
export const formatOrdersForFrontend = (orders) => {
  return orders.map((order) => ({
    id: order.id,
    orderNumber: order.order_number,
    status: order.status,
    statusDisplay: order.status_display,
    total: parseFloat(order.total_amount),
    currency: order.currency,
    date: new Date(order.created_at),
    itemsCount: order.items_count,
    customerEmail: order.customer_email,
    customerName: order.customer_name,
  }));
};

// Obtener color del estado para la UI
export const getStatusColor = (status) => {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    processing: "bg-purple-100 text-purple-800",
    shipped: "bg-indigo-100 text-indigo-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    refunded: "bg-gray-100 text-gray-800",
  };

  return statusColors[status] || "bg-gray-100 text-gray-800";
};

// Obtener texto descriptivo del estado
export const getStatusDescription = (status) => {
  const descriptions = {
    pending: "Tu orden está siendo procesada",
    confirmed: "Tu orden ha sido confirmada",
    processing: "Estamos preparando tu orden",
    shipped: "Tu orden está en camino",
    delivered: "Tu orden ha sido entregada",
    cancelled: "Tu orden fue cancelada",
    refunded: "Tu orden fue reembolsada",
  };

  return descriptions[status] || "Estado desconocido";
};
