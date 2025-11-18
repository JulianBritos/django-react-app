import { createContext, useState, useEffect, useCallback } from "react";
import {
  getCurrentCart,
  addToCart as apiAddToCart,
  updateCartItem,
  removeFromCart as apiRemoveFromCart,
  clearCart as apiClearCart,
  getCartCount,
  formatProductForCart,
  formatCartForFrontend,
} from "../api/carts.api";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";

// Creamos el contexto
const CartContext = createContext();

// Proveedor
export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({
    id: null,
    items: [],
    subtotal: 0,
    shipping: 0,
    total: 0,
    itemsCount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar carrito inicial
  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCurrentCart();
      const formattedCart = formatCartForFrontend(response);

      if (formattedCart) {
        setCart(formattedCart);
      } else {
        // Carrito vacío
        setCart({
          id: response.cart?.id || null,
          items: [],
          subtotal: 0,
          shipping: 0,
          total: 0,
          itemsCount: 0,
        });
      }
    } catch (err) {
      // Si es 401 (no autenticado) o 403, simplemente dejar el carrito vacío
      // Esto es normal para usuarios guest, no es un error
      if (err.response?.status === 401 || err.response?.status === 403) {
        setCart({
          id: null,
          items: [],
          subtotal: 0,
          shipping: 0,
          total: 0,
          itemsCount: 0,
        });
        setError(null); // No es un error, es un usuario guest
        return; // Salir temprano sin mostrar error
      }
      // Solo mostrar errores para otros códigos de estado
      console.error("Error al cargar carrito:", err);
      setError("Error al cargar el carrito");
      // En caso de error, mantener carrito vacío
      setCart({
        id: null,
        items: [],
        subtotal: 0,
        shipping: 0,
        total: 0,
        itemsCount: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar carrito al montar el componente (funciona para usuarios autenticados y guest)
  useEffect(() => {
    loadCart();
  }, [loadCart]); // Cargar siempre, sin importar si está autenticado

  // Agregar producto al carrito
  const addToCart = async (
    product,
    productAttribute = null,
    quantity = 1,
    selectedAttributes = null
  ) => {
    try {
      setLoading(true);
      setError(null);

      const productData = formatProductForCart(
        product,
        productAttribute,
        quantity,
        selectedAttributes
      );
      const response = await apiAddToCart(productData);

      // Recargar carrito después de agregar
      await loadCart();

      toast.success(response.message || "Producto agregado al carrito");
      return response;
    } catch (err) {
      console.error("Error al agregar al carrito:", err);
      const errorMsg =
        err.response?.data?.message || "Error al agregar producto al carrito";
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar cantidad de un item
  const updateQuantity = async (itemId, quantity) => {
    try {
      setLoading(true);
      setError(null);

      const response = await updateCartItem(itemId, quantity);

      // Recargar carrito después de actualizar
      await loadCart();

      toast.success(response.message || "Cantidad actualizada");
      return response;
    } catch (err) {
      console.error("Error al actualizar cantidad:", err);
      const errorMsg =
        err.response?.data?.message || "Error al actualizar cantidad";
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar item del carrito
  const removeFromCart = async (itemId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiRemoveFromCart(itemId);

      // Recargar carrito después de eliminar
      await loadCart();

      toast.success(response.message || "Producto eliminado del carrito");
      return response;
    } catch (err) {
      console.error("Error al eliminar del carrito:", err);
      const errorMsg =
        err.response?.data?.message || "Error al eliminar producto";
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Vaciar carrito completo
  const clearCart = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClearCart();

      // Recargar carrito después de vaciar
      await loadCart();

      toast.success(response.message || "Carrito vaciado");
      return response;
    } catch (err) {
      console.error("Error al vaciar carrito:", err);
      const errorMsg = err.response?.data?.message || "Error al vaciar carrito";
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtener contador del carrito
  const getCount = async () => {
    try {
      const response = await getCartCount();
      return response.count;
    } catch (err) {
      console.error("Error al obtener contador:", err);
      return 0;
    }
  };

  const value = {
    cart,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    loadCart,
    getCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext; // Exporta por default el contexto
