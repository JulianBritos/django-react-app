import axios from "axios";

const API_URL = "http://localhost:8000/apps/user"; // Ajusta según corresponda

export const loginUser = async (credentials) => {
  const response = await axios.post(`${API_URL}/login/`, credentials);
  return response.data;
};

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register/`, userData);
    return response.data;
  } catch (error) {
    console.error(
      "Error en el registro:",
      error.response?.data || error.message
    );
    throw error;
  }
};
