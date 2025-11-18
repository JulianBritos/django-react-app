import axios from "axios";

const API_URL = "http://localhost:8000/apps/carts/api";

// Crear una instancia de axios específica para el carrito
// Esta instancia NO tiene los interceptores globales que redirigen al login
// porque el carrito debe funcionar para usuarios anónimos (guest checkout)
const cartAxios = axios.create({
  withCredentials: true, // Importante para mantener sesiones de guest
});

// Interceptor de request para agregar token si existe (opcional para guest)
cartAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de response que NO redirige al login en caso de 401
// porque el carrito debe funcionar para usuarios anónimos
cartAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Para rutas de carrito, no redirigir al login automáticamente
    // Los errores se manejan en el contexto del carrito
    if (error.response?.status === 401) {
      // Solo loguear el error, no redirigir
      console.warn("Carrito: Usuario no autenticado, continuando como guest");
    }
    return Promise.reject(error);
  }
);

// Obtener carrito actual
export const getCurrentCart = async () => {
  try {
    const response = await cartAxios.get(`${API_URL}/carts/current/`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener carrito:", error);
    throw error;
  }
};

// Agregar producto al carrito
export const addToCart = async (productData) => {
  try {
    const response = await cartAxios.post(
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
    const response = await cartAxios.patch(`${API_URL}/carts/update_item/`, {
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
    const response = await cartAxios.delete(`${API_URL}/carts/remove_item/`, {
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
    const response = await cartAxios.delete(`${API_URL}/carts/clear/`);
    return response.data;
  } catch (error) {
    console.error("Error al vaciar carrito:", error);
    throw error;
  }
};

// Obtener contador del carrito
export const getCartCount = async () => {
  try {
    const response = await cartAxios.get(`${API_URL}/carts/count/`);
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
