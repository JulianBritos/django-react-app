import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import CartItem from "./cart-item";

// Datos dummy para el carrito
const cartItems = [
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
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const shipping = 4.99;
  const total = subtotal + shipping;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8 text-center md:text-left">
        Tu Carrito de Compras
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sección: Lista de productos */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            {/* Cabecera para desktop */}
            <div className="hidden md:grid md:grid-cols-5 gap-4 mb-4 text-sm font-semibold text-gray-600">
              <div className="col-span-2">Producto</div>
              <div className="text-center">Precio</div>
              <div className="text-center">Cantidad</div>
              <div className="text-center">Total</div>
            </div>

            {/* Productos */}
            <div className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            {/* Código de descuento + Vaciar carrito */}
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
              >
                <Trash2 className="h-4 w-4 mr-1" />
                <span>Vaciar carrito</span>
              </Button>
            </div>
          </div>

          {/* Acciones inferiores */}
          <div className="flex justify-between mt-4">
            <Button variant="outline">Continuar Comprando</Button>
            <Button variant="outline">Actualizar Carrito</Button>
          </div>
        </div>

        {/* Sección: Resumen de compra */}
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

            <Button className="w-full bg-green-600 hover:bg-green-700">
              Proceder al Pago
            </Button>

            {/* Métodos de pago (placeholder visual) */}
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
