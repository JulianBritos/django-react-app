import { useCart } from "../hooks/useCart";

const CartPage = () => {
  const { cartItems, removeFromCart, clearCart } = useCart();

  const total = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Tu Carrito</h1>
      {cartItems.length === 0 ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center border p-3 rounded"
            >
              <div>
                <h3 className="font-bold">{item.name}</h3>
                <p>
                  ${item.price} x {item.quantity}
                </p>
              </div>
              <button
                className="bg-red-500 text-white px-3 py-1 rounded"
                onClick={() => removeFromCart(item.id)}
              >
                Eliminar
              </button>
            </div>
          ))}
          <div className="text-right font-bold text-xl mt-4">
            Total: ${total.toFixed(2)}
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              className="bg-gray-500 text-white px-4 py-2 rounded"
              onClick={clearCart}
            >
              Vaciar Carrito
            </button>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded"
              onClick={() => alert("Ir al checkout (MercadoPago o similar)")}
            >
              Finalizar Compra
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
