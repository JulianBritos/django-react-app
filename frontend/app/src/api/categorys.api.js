import axios from "axios";

const API_URL = "http://localhost:8000/apps/products/categories/"; // Ajustá si usás otro puerto

// Obtener lista de categorias
export const getCategories = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};