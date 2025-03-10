import { useCart } from "../hooks/useCart";

const Cart = () => {
  const { cartItems, removeFromCart } = useCart();

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Carrito de Compras</h2>
      {cartItems.length === 0 ? (
        <p>No hay productos en el carrito.</p>
      ) : (
        <ul className="space-y-4">
          {cartItems.map((item) => (
            <li
              key={item.id}
              className="flex justify-between items-center border p-2 rounded"
            >
              <div>
                <p className="font-bold">{item.name}</p>
                <p>
                  ${item.price} x {item.quantity}
                </p>
              </div>
              <button
                onClick={() => removeFromCart(item.id)}
                className="bg-red-500 text-white p-2 rounded"
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Cart;
