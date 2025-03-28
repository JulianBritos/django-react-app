import axios from "axios";

const API_URL = "http://127.0.0.1:8000/apps/products/products/";

// Crear un producto con imágenes
export const createProduct = async (formData) => {
  try {
    const response = await axios.post(API_URL, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error al crear el producto:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Obtener todos los productos
export const getProducts = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error(
      "Error al obtener los productos:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Obtener un producto por ID
export const getProductById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}${id}/`);
    return response.data;
  } catch (error) {
    console.error(
      "Error al obtener el producto:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Actualizar un producto
export const updateProduct = async (id, formData) => {
  try {
    const response = await axios.put(`${API_URL}${id}/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error al actualizar el producto:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Eliminar un producto
export const deleteProduct = async (id) => {
  try {
    await axios.delete(`${API_URL}${id}/`);
  } catch (error) {
    console.error(
      "Error al eliminar el producto:",
      error.response?.data || error.message
    );
    throw error;
  }
};
