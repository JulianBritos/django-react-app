import axios from "axios";

const API_URL = "http://127.0.0.1:8000/apps/user"; // Corregir el prefijo de la URL base

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
