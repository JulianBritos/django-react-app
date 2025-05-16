import React from "react";

const CheckoutButton = ({ cartItems, userEmail }) => {
  const handleCheckout = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/create_preference/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: cartItems.map((item) => ({
              id: item.id,
              title: item.title,
              quantity: item.quantity,
              unit_price: item.price,
            })),
            payer: { email: userEmail },
            back_urls: { // OJO CON ESTOS ENDPOINTS. Deberia ir: import.meta.env.VITE_BASE_URL + "/success/"
              success: "http://localhost:3000/success",
              failure: "http://localhost:3000/failure",
              pending: "http://localhost:3000/pending",
            },
          }),
        }
      );

      const data = await response.json();
      console.log("Respuesta del backend:", data);

      if (data.init_point) {
        window.location.href = data.init_point; // Redirige a MercadoPago
      }
    } catch (error) {
      console.error("Error al crear preferencia:", error);
    }
  };

  return <button onClick={handleCheckout}>Pagar con MercadoPago</button>;
};

export default CheckoutButton;
