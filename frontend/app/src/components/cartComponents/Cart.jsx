import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import CartItem from "./cart-item";
import { useCart } from "../../hooks/useCart";
import toast from "react-hot-toast";

const Cart = () => {
  const navigate = useNavigate();
  const { cart, loading, error, updateQuantity, removeFromCart, clearCart } =
    useCart();
  const [cartItems, setCartItems] = useState([]);

  // Sincronizar cartItems con el cart del contexto
  useEffect(() => {
    if (cart.items) {
      setCartItems(cart.items.map((item) => ({ ...item, checked: true })));
    }
  }, [cart.items]);

  const handleRemove = async (id) => {
    try {
      await removeFromCart(id);
    } catch (error) {
      console.error("Error al eliminar item:", error);
    }
  };

  const handleCheck = (id) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleIncrease = async (id) => {
    const item = cartItems.find((item) => item.id === id);
    if (item) {
      try {
        await updateQuantity(id, item.quantity + 1);
      } catch (error) {
        console.error("Error al aumentar cantidad:", error);
      }
    }
  };

  const handleDecrease = async (id) => {
    const item = cartItems.find((item) => item.id === id);
    if (item && item.quantity > 1) {
      try {
        await updateQuantity(id, item.quantity - 1);
      } catch (error) {
        console.error("Error al disminuir cantidad:", error);
      }
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
    } catch (error) {
      console.error("Error al vaciar carrito:", error);
    }
  };

  // Calcular valores usando items marcados
  const subtotal = cartItems.reduce(
    (total, item) =>
      item.checked ? total + item.price * item.quantity : total,
    0
  );

  const hasChecked = cartItems.some((item) => item.checked);
  const shipping = hasChecked ? 4.99 : 0;
  const total = subtotal + shipping;

  // Usar valores del backend si están disponibles
  const displaySubtotal = cart.subtotal || subtotal;
  const displayShipping = cart.shipping || shipping;
  const displayTotal = cart.total || total;

  const handleFinalizePurchase = () => {
    const checkedItems = cartItems.filter((item) => item.checked);
    if (checkedItems.length === 0) {
      toast.error("Selecciona al menos un producto para continuar");
      return;
    }

    navigate("/checkout", {
      state: {
        cartId: cart.id,
        items: checkedItems,
        subtotal: displaySubtotal,
        shipping: displayShipping,
        total: displayTotal,
      },
    });
  };

  // Mostrar loading spinner
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Cargando carrito...</span>
        </div>
      </div>
    );
  }

  // Mostrar error si existe
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-2"
            variant="outline"
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8 text-center md:text-left">
        Tu Carrito de Compras
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <div className="divide-y divide-gray-200">
              {cartItems.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  No hay productos en el carrito.
                </div>
              ) : (
                cartItems.map((item, index) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    checked={item.checked}
                    onCheck={() => handleCheck(item.id)}
                    onIncrease={() => handleIncrease(item.id)}
                    onDecrease={() => handleDecrease(item.id)}
                    onRemove={() => handleRemove(item.id)}
                    isFirstItem={index === 0}
                  />
                ))
              )}
            </div>

            <div className="mt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center space-x-2">
                <label className="block mb-1 font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
                <Button variant="outline">Aplicar</Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 flex items-center"
                onClick={handleClearCart}
                disabled={cartItems.length === 0 || loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-1" />
                )}
                <span>Vaciar carrito</span>
              </Button>
            </div>
          </div>

          <div className="flex justify-between mt-4">
            <Button variant="outline">Continuar Comprando</Button>
            <Button variant="outline">Actualizar Carrito</Button>
          </div>
        </div>

        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Resumen de Compra</h2>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>${displaySubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Envío</span>
                <span>${displayShipping.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-semibold">
                <span>Total</span>
                <span>${displayTotal.toFixed(2)}</span>
              </div>
            </div>

            <Button
              className="w-full bg-thirdary-600 hover:bg-thirdary-700 text-white font-semibold"
              disabled={cartItems.length === 0 || !hasChecked || loading}
              onClick={handleFinalizePurchase}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Finalizar Compra"
              )}
            </Button>

            <div className="mt-4 text-xs text-gray-500">
              <p>Métodos de pago aceptados:</p>
              <div className="flex space-x-2 mt-2">
                <div className="w-10 h-6 bg-gray-200 rounded"></div>
                <div className="w-10 h-6 bg-gray-200 rounded"></div>
                <div className="w-10 h-6 bg-gray-200 rounded"></div>
                <div className="w-10 h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
