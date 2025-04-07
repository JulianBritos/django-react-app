// src/components/GoogleLogin.jsx
import { useEffect } from "react";
import toast from "react-hot-toast";

const GoogleLogin = () => {
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
        toast.success("Sesión iniciada con Google");
        // Redirigí donde quieras
      } else {
        toast.error(data.detail || "Error al iniciar sesión con Google");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al conectar con el servidor");
    }
  };

  return <div id="google-login-button"></div>;
};

export default GoogleLogin;
