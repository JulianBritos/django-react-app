// src/components/GoogleLogin.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const GoogleLogin = () => {
  const [userName, setUserName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    /* global google */
    window.google.accounts.id.initialize({
      client_id:
        "1038991088253-6djblu3k6aem19ep1161ruk0ha1ak9hu.apps.googleusercontent.com",
      callback: handleCredentialResponse,
    });

    window.google.accounts.id.renderButton(
      document.getElementById("google-login-button"),
      { theme: "outline", size: "large" } // Puedes cambiar diseño
    );
  }, []);

  const handleCredentialResponse = async (response) => {
    const idToken = response.credential;

    try {
      const res = await fetch("http://127.0.0.1:8000/apps/user/auth/google/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_token: idToken }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.access);
        setUserName(data.user_name || "Usuario"); // Asume que el backend devuelve el nombre del usuario
        setIsLoggedIn(true);
        toast.success("Sesión iniciada con Google");
        navigate("/"); // Redirige a la landing
      } else {
        toast.error(data.detail || "Error al iniciar sesión con Google");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al conectar con el servidor");
    }
  };

  return (
    <div>
      {!isLoggedIn ? (
        <div id="google-login-button"></div>
      ) : (
        <div>
          <h2>¡Bienvenido, {userName}!</h2>
          <p>Has iniciado sesión exitosamente.</p>
        </div>
      )}
    </div>
  );
};

export default GoogleLogin;
