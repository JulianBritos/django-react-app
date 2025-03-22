import axios from "axios";

const API_URL = "http://localhost:8000/api/products/"; // Ajustá si usás otro puerto

// Obtener lista de productos
export const getProducts = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Obtener un producto por ID
export const getProductById = async (productId) => {
  const response = await axios.get(`${API_URL}${productId}/`);
  return response.data;
};

// Crear un producto (con imagen)
export const createProduct = async (productData) => {
  const formData = new FormData();
  formData.append("name", productData.name);
  formData.append("description", productData.description);
  formData.append("price", productData.price);
  formData.append("category_id", productData.category_id);

  if (productData.images && productData.images.length > 0) {
    productData.images.forEach((image) => {
      formData.append("uploaded_images", image); // 🔥 Usa la clave correcta
    });
  }

  const response = await axios.post(API_URL, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

// Borrar producto
export const deleteProduct = async (productId) => {
  await axios.delete(`${API_URL}${productId}/`);
};
