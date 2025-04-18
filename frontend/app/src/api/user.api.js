import axios from "axios";

const API_URL = "http://127.0.0.1:8000/apps/user"; // Cambia esto según tu configuración

// Configurar un interceptor global para manejar respuestas 401
axios.interceptors.response.use(
  (response) => response, // Devolver la respuesta si es exitosa
  (error) => {
    if (error.response && error.response.status === 401) {
      // Redirigir al usuario a la página de inicio de sesión
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Obtener información del usuario
export const getUserInfo = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/me/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Actualizar información del usuario
export const updateUserInfo = async (userData) => {
  const token = localStorage.getItem("token");
  const response = await axios.put(`${API_URL}/me/`, userData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Add a function to handle password change
export const changePassword = async (passwordData) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `${API_URL}/change-password/`,
    passwordData,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};
