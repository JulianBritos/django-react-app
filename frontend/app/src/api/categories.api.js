import axios from "axios";

const API_URL = import.meta.env.VITE_BASE_URL + "/apps/products/categories/";

// Obtener lista de categorias
export const getCategories = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Obtener una categoría específica
export const getCategory = async (id) => {
  const response = await axios.get(`${API_URL}${id}/`);
  return response.data;
};

// Crear una nueva categoría
export const createCategory = async (categoryData) => {
  const response = await axios.post(API_URL, categoryData);
  return response.data;
};

// Actualizar una categoría
export const updateCategory = async (id, categoryData) => {
  const response = await axios.put(`${API_URL}${id}/`, categoryData);
  return response.data;
};

// Eliminar una categoría
export const deleteCategory = async (id) => {
  const response = await axios.delete(`${API_URL}${id}/`);
  return response.data;
};
