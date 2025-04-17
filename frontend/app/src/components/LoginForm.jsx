import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth.api";
import toast from "react-hot-toast";
import GoogleLogin from "./GoogleLogin";
import { useAuth } from "../context/AuthContext";

const siteKey = "6LeXWhsrAAAAAFu3XvyaoYr3u3-ML96uEqsSfvtW"; // 🔒 Reemplazalo por el de tu cuenta

const LoginForm = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({ username: false, password: false });
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }

    // Cargar el script de reCAPTCHA v3 al montar
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    document.body.appendChild(script);
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ username: false, password: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ username: false, password: false });

    try {
      if (!window.grecaptcha) {
        throw new Error("reCAPTCHA no está disponible.");
      }

      const captchaToken = await window.grecaptcha.execute(siteKey, {
        action: "login",
      });

      const payload = {
        ...formData,
        captchaToken,
      };

      const data = await loginUser(payload);
      localStorage.setItem("token", data.access);
      login(data.access);
      toast.success("Bienvenido!", { duration: 3000 });

      setIsLoading(true);
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setErrors({ username: true, password: true });
        toast.error("Usuario o contraseña incorrectos");
        setFormData({ username: "", password: "" });
      } else {
        toast.error("Error al intentar iniciar sesión");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      {isLoading ? (
        <div className="text-center">
          <div className="loader mb-4"></div>
          <p className="text-lg font-semibold">
            Volviendo a página de inicio...
          </p>
        </div>
      ) : (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg shadow-blue-200 w-full max-w-lg lg:max-w-xl lg:h-[450px] xl:h-[500px] mx-4">
          <h1 className="text-xl sm:text-2xl lg:text-4xl text-center font-bold py-2 mb-4 md:mb-16 ">
            Iniciar Sesión
          </h1>
          {errors.username && errors.password && (
            <p className="text-red-500 text-center mb-4">
              Usuario o contraseña incorrectos
            </p>
          )}
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
