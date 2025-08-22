import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../context/AuthContext";
import { createOrder, formatCheckoutData } from "../../api/orders.api";
import toast from "react-hot-toast";

const CheckoutForm = () => {
  const navigate = useNavigate();
  const { cart, loading: cartLoading } = useCart();
  const { isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    notes: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("creditCard");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Validar que el carrito tenga items
  useEffect(() => {
    console.log("Cart effect - cart:", cart, "loading:", cartLoading); // Debug log
    // Solo redirigir si no se está procesando la orden y el carrito está vacío
    if (
      !cartLoading &&
      !isSubmitting &&
      cart &&
      (!cart.items || cart.items.length === 0)
    ) {
      console.log("Cart is empty, redirecting to cart page"); // Debug log
      toast.error("Tu carrito está vacío");
      navigate("/cart");
    }
  }, [cart, cartLoading, navigate, isSubmitting]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "El nombre es requerido";
    if (!formData.lastName.trim())
      newErrors.lastName = "El apellido es requerido";
    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El email no es válido";
    }
    if (!formData.phone.trim()) newErrors.phone = "El teléfono es requerido";
    if (!formData.address.trim())
      newErrors.address = "La dirección es requerida";
    if (!formData.city.trim()) newErrors.city = "La ciudad es requerida";
    if (!formData.postalCode.trim())
      newErrors.postalCode = "El código postal es requerido";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Por favor corrige los errores en el formulario");
      return;
    }

    console.log("Cart data:", cart); // Debug log

    if (!cart?.id) {
      toast.error("Error: No se pudo obtener el carrito");
      return;
    }

    setIsSubmitting(true);

    try {
      const checkoutData = formatCheckoutData(
        cart?.id,
        formData,
        paymentMethod,
        !isAuthenticated ? formData : null
      );

      const response = await createOrder(checkoutData);

      toast.success("¡Orden creada exitosamente!");

      // Redirigir a la página de confirmación
      navigate(`/order-confirmation/${response.order.id}`);
    } catch (error) {
      console.error("Error al crear la orden:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Error al procesar tu orden. Por favor intenta de nuevo.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando carrito...</p>
        </div>
      </div>
    );
  }

  console.log("Render - cart:", cart, "items:", cart?.items); // Debug log

  if (!cart?.items || cart?.items?.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">
            Carrito Vacío
          </h1>
          <p className="text-gray-600 mb-6">
            No tienes productos en tu carrito para proceder al checkout.
          </p>
          <Button onClick={() => navigate("/")} variant="primary">
            Continuar Comprando
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-semibold text-center mb-8">Checkout</h1>

      {/* Formulario de Información Personal */}
      <div className="mb-8">
        <h2 className="text-xl font-medium mb-4">Información Personal</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="John"
              className={`mt-1 p-2 w-full border rounded-md shadow-sm ${
                errors.firstName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Apellido *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Doe"
              className={`mt-1 p-2 w-full border rounded-md shadow-sm ${
                errors.lastName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="john@example.com"
              className={`mt-1 p-2 w-full border rounded-md shadow-sm ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Teléfono *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+54 11 1234-5678"
              className={`mt-1 p-2 w-full border rounded-md shadow-sm ${
                errors.phone ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>
        </div>
      </div>

      {/* Formulario de Información de Envío */}
      <div className="mb-8">
        <h2 className="text-xl font-medium mb-4">Información de Envío</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Dirección *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="123 Main St, Apt 4B"
              className={`mt-1 p-2 w-full border rounded-md shadow-sm ${
                errors.address ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Ciudad *
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="Buenos Aires"
              className={`mt-1 p-2 w-full border rounded-md shadow-sm ${
                errors.city ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.city && (
              <p className="text-red-500 text-sm mt-1">{errors.city}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Código Postal *
            </label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              placeholder="C1416"
              className={`mt-1 p-2 w-full border rounded-md shadow-sm ${
                errors.postalCode ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.postalCode && (
              <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Notas adicionales (opcional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Instrucciones especiales para la entrega..."
              rows="3"
              className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Formulario de Métodos de Pago */}
      <div className="mb-8">
        <h2 className="text-xl font-medium mb-4">Método de Pago</h2>
        <div className="space-y-4">
          <div>
            <input
              type="radio"
              id="creditCard"
              name="paymentMethod"
              value="creditCard"
              checked={paymentMethod === "creditCard"}
              onChange={() => setPaymentMethod("creditCard")}
              className="mr-2"
            />
            <label htmlFor="creditCard" className="text-sm">
              Tarjeta de Crédito/Débito
            </label>
          </div>
          <div>
            <input
              type="radio"
              id="paypal"
              name="paymentMethod"
              value="paypal"
              checked={paymentMethod === "paypal"}
              onChange={() => setPaymentMethod("paypal")}
              className="mr-2"
            />
            <label htmlFor="paypal" className="text-sm">
              PayPal
            </label>
          </div>
          <div>
            <input
              type="radio"
              id="bankTransfer"
              name="paymentMethod"
              value="bankTransfer"
              checked={paymentMethod === "bankTransfer"}
              onChange={() => setPaymentMethod("bankTransfer")}
              className="mr-2"
            />
            <label htmlFor="bankTransfer" className="text-sm">
              Transferencia Bancaria
            </label>
          </div>
        </div>
      </div>

      {/* Resumen de la Compra */}
      <div className="mb-8 border-t pt-4">
        <h2 className="text-xl font-medium mb-4">Resumen de la Compra</h2>
        <div className="space-y-3">
          {cart?.items?.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div className="flex-1">
                <span className="text-sm font-medium">
                  {item.product_name || item.name}
                </span>
                {item.selected_attributes && (
                  <p className="text-xs text-gray-500">
                    {Object.entries(item.selected_attributes)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(", ")}
                  </p>
                )}
                <span className="text-xs text-gray-500">
                  Cantidad: {item.quantity || 0}
                </span>
              </div>
              <span className="text-sm font-medium">
                ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
              </span>
            </div>
          ))}

          <div className="border-t pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>${(cart?.subtotal || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Envío:</span>
              <span>${(cart?.shipping || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t pt-2">
              <span>Total:</span>
              <span>${(cart?.total || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Botón de Confirmación */}
      <div className="text-center">
        <Button
          type="submit"
          variant="success"
          fullWidth
          disabled={
            isSubmitting || cartLoading || !cart?.id || !cart?.items?.length
          }
        >
          {isSubmitting ? "Procesando..." : "Confirmar Pedido"}
        </Button>

        {!isAuthenticated && (
          <p className="text-sm text-gray-600 mt-3">
            Al continuar, aceptas nuestros términos y condiciones
          </p>
        )}
      </div>
    </form>
  );
};

export default CheckoutForm;
