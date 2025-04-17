import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth.api";
import toast from "react-hot-toast";
import GoogleLogin from "./GoogleLogin";
import { useAuth } from "../context/AuthContext"; // Importar el contexto de autenticación

const LoginForm = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({ username: false, password: false });
  const [isLoading, setIsLoading] = useState(false); // Estado para la animación de carga
  const { isAuthenticated, login } = useAuth(); // Obtener el estado de autenticación
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/"); // Redirigir si ya está autenticado
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ username: false, password: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Mostrar animación de carga

    try {
      const data = await loginUser(formData);
      localStorage.setItem("token", data.access);
      localStorage.setItem("userRole", data.role); // Guardar el rol del usuario
      login(data.access); // Actualizar el contexto de autenticación
      toast.success("Bienvenido!", { duration: 3000 });

      setTimeout(() => {
        setIsLoading(false); // Ocultar animación de carga
        navigate("/"); // Redirigir a la página de inicio
      }, 3000);
    } catch (error) {
      setIsLoading(false); // Asegurarse de ocultar la animación en caso de error
      toast.error("Credenciales inválidas");
      setErrors({ username: true, password: true });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      {isLoading ? (
        <div className="text-center">
          <div className="loader mb-4"></div>{" "}
          {/* Agregar un estilo de animación de carga */}
          <p className="text-lg font-semibold">
            Volviendo a página de inicio...
          </p>
        </div>
      ) : (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg shadow-blue-200 w-full max-w-lg lg:max-w-2xl lg:h-[400px] xl:h-[500px] mx-4">
          <h1 className="text-xl sm:text-2xl lg:text-4xl text-center font-bold py-2 mb-4 md:mb-16 ">
            Iniciar Sesión
          </h1>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              placeholder="Usuario"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 mb-4 
            ${
              errors.username
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-green-500"
            }`}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 mb-4 
              ${
                errors.password
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-green-500"
              }`}
              onChange={handleChange}
              required
            />

            <button
              type="submit"
              className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition mb-4"
            >
              Ingresar
            </button>
          </form>

          <GoogleLogin />

          <a
            href="/register"
            className="text-blue-700 hover:text-gray-950 text-sm sm:text-base text-center block"
          >
            ¿Aún no tienes una cuenta? Regístrate
          </a>
          <a
            href="#"
            className="text-blue-700 hover:text-gray-950 text-sm sm:text-base text-center block pt-1"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
