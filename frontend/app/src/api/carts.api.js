import axios from "axios";

const API_URL = "http://localhost:8000/apps/carts/api";

// Configurar axios con interceptor para incluir session
axios.defaults.withCredentials = true;

// Obtener carrito actual
export const getCurrentCart = async () => {
  try {
    const response = await axios.get(`${API_URL}/carts/current/`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener carrito:", error);
    throw error;
  }
};

// Agregar producto al carrito
export const addToCart = async (productData) => {
  try {
    const response = await axios.post(
      `${API_URL}/carts/add_item/`,
      productData
    );
    return response.data;
  } catch (error) {
    console.error("Error al agregar al carrito:", error);
    throw error;
  }
};

// Actualizar cantidad de un item
export const updateCartItem = async (itemId, quantity) => {
  try {
    const response = await axios.patch(`${API_URL}/carts/update_item/`, {
      item_id: itemId,
      quantity: quantity,
    });
    return response.data;
  } catch (error) {
    console.error("Error al actualizar item:", error);
    throw error;
  }
};

// Eliminar item del carrito
export const removeFromCart = async (itemId) => {
  try {
    const response = await axios.delete(`${API_URL}/carts/remove_item/`, {
      data: { item_id: itemId },
    });
    return response.data;
  } catch (error) {
    console.error("Error al eliminar del carrito:", error);
    throw error;
  }
};

// Vaciar carrito
export const clearCart = async () => {
  try {
    const response = await axios.delete(`${API_URL}/carts/clear/`);
    return response.data;
  } catch (error) {
    console.error("Error al vaciar carrito:", error);
    throw error;
  }
};

// Obtener contador del carrito
export const getCartCount = async () => {
  try {
    const response = await axios.get(`${API_URL}/carts/count/`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener contador:", error);
    throw error;
  }
};

// Funciones de utilidad para formatear datos

// Formatear producto para agregar al carrito
export const formatProductForCart = (
  product,
  productAttribute = null,
  quantity = 1,
  selectedAttributes = null
) => {
  return {
    product_id: product.id,
    product_attribute_id: productAttribute?.id || null,
    quantity: quantity,
    selected_attributes: selectedAttributes,
    notes: "",
  };
};

// Formatear respuesta del carrito para el frontend
export const formatCartForFrontend = (cartData) => {
  if (!cartData.cart) return null;

  const cart = cartData.cart;

  return {
    id: cart.id,
    items: cart.items.map((item) => ({
      id: item.id,
      product_name: item.name || item.product_name,
      name: item.name || item.product_name,
      price: parseFloat(item.price || item.unit_price),
      quantity: item.quantity,
      image: item.image,
      checked: true, // Por defecto marcado para checkout
      subtotal: parseFloat(item.subtotal),
      selected_attributes: item.selected_attributes || null,
    })),
    subtotal: parseFloat(cart.subtotal),
    shipping: parseFloat(cart.shipping_cost),
    total: parseFloat(cart.total),
    itemsCount: cart.total_items,
  };
};
