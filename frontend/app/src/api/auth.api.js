import axios from "axios";

const API_URL = "http://localhost:8000/api"; // Ajusta según corresponda

export const loginUser = async (credentials) => {
  const response = await axios.post(`${API_URL}/token/`, credentials);
  return response.data;
};

export const registerUser = async (userData) => {
  await axios.post(`${API_URL}/register/`, userData);
};
