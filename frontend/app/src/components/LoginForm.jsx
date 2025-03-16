import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth.api";
import toast from "react-hot-toast";

const LoginForm = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });

  const [errors, setErrors] = useState({ username: false, password: false });


  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ username: false, password: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrors({ username: false, password: false });
    
    try {
      const data = await loginUser(formData);
      localStorage.setItem("token", data.access);
      toast.success("Bienvenido!");
      navigate("/dashboard"); // O a donde quieras redirigir después de login
    } catch (error) {
      toast.error("Credenciales inválidas");

      setErrors({ username: true, password: true });

    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg shadow-blue-200 w-full max-w-sm mx-4">
        <h1 className="text-xl sm:text-2xl text-center font-bold py-2 mb-4">
          Iniciar Sesión
        </h1>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Usuario"

            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 mb-4 
            ${errors.username ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-green-500"}`}

            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 mb-4 
              ${errors.username ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-green-500"}`}
            onChange={handleChange}
            required
          />
          
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition mb-4"
          >
            Ingresar
          </button>
          <a
            href="/register"
            className="text-blue-700 hover:text-gray-950 text-sm sm:text-base text-center block"
          >
            ¿Aún no tienes una cuenta? Regístrate
          </a>
          <a href="#" class="text-blue-700 hover:text-gray-950 text-sm sm:text-base text-center block pt-1">¿Olvidaste tu contraseña?</a>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
