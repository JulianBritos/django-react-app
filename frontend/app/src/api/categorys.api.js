import axios from "axios";

const API_URL = import.meta.env.VITE_BASE_URL + "/apps/products/categories/";

// Obtener lista de categorias
export const getCategories = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};