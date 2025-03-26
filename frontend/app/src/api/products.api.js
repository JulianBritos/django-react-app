import axios from "axios";

const API_URL = "http://localhost:8000/apps/products/products/"; // Ajustá si usás otro puerto

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

  if (productData.variant_ids) {
    productData.variant_ids.forEach((id) => formData.append("variant_ids", id));
  }

  if (productData.images && productData.images.length > 0) {
    productData.images.forEach((image) => {
      formData.append("uploaded_images", image); // 🔥 Usa la clave correcta
    });
  }

  if (productData.product_variants) {
    productData.product_variants.forEach((variant, index) => {
      formData.append(`product_variants[${index}][sku]`, variant.sku);
      formData.append(`product_variants[${index}][price]`, variant.price);
      formData.append(`product_variants[${index}][stock]`, variant.stock);
      variant.option_ids.forEach((optId) =>
        formData.append(`product_variants[${index}][option_ids]`, optId)
      );
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
