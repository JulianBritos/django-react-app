import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Para redirigir
import { registerUser } from "../api/auth.api"; // Función para hacer la petición
import toast, { Toaster } from "react-hot-toast"; // Importamos toast
import GoogleLogin from "./GoogleLogin";

const RegisterForm = () => {
  const navigate = useNavigate(); // Hook de navegación

  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password2: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.password2) {
      toast.error("❌ Las contraseñas no coinciden");
      return;
    }

    try {
      await registerUser(formData);
      toast.success("✅ Registro exitoso. Redirigiendo...", { duration: 2000 });

      setTimeout(() => {
        navigate("/Home"); // Redirigir tras 2 segundos
      }, 2000);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "❌ Error al registrar usuario"
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg shadow-blue-200 w-full max-w-sm mx-4">
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-6">
          Registro
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="first_name"
            placeholder="Nombre"
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <input
            type="text"
            name="last_name"
            placeholder="Apellido"
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <input
            type="text"
            name="username"
            placeholder="Usuario"
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <input
            type="password"
            name="password2"
            placeholder="Confirmar Contraseña"
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
          >
            Registrarse
          </button>
          <GoogleLogin />
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
