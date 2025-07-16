import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import CartItem from "./cart-item";

const cartItemsData = [
  {
    id: 1,
    name: "Camiseta Premium",
    price: 29.99,
    quantity: 2,
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 2,
    name: "Zapatillas Deportivas",
    price: 89.99,
    quantity: 1,
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 3,
    name: "Reloj Inteligente",
    price: 199.99,
    quantity: 1,
    image: "/placeholder.svg?height=80&width=80",
  },
];

export default function Cart() {
  const [cartItems, setCartItems] = useState(
    cartItemsData.map((item) => ({ ...item, checked: true }))
  );

  const handleRemove = (id) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const handleCheck = (id) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleIncrease = (id) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecrease = (id) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const subtotal = cartItems.reduce(
    (total, item) => (item.checked ? total + item.price * item.quantity : total),
    0
  );

  const hasChecked = cartItems.some((item) => item.checked);
  const shipping = hasChecked ? 4.99 : 0;
  const total = subtotal + shipping;

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
                disabled={cartItems.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-1" />
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
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Envío</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-semibold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <Button
              className="w-full bg-thirdary-600 hover:bg-thirdary-700"
              disabled={cartItems.length === 0 || !hasChecked}
            >
              Proceder al Pago
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
}
