import axios from "axios";

const API_URL = import.meta.env.VITE_BASE_URL + "/apps/products/";

// Configurar axios para incluir el token automáticamente
axios.interceptors.request.use(
  (config) => {
    // Corregir: usar "access" en lugar de "access_token"
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const getProducts = async () => {
  const response = await axios.get(`${API_URL}products/`);
  return response.data;
};

export const getProductById = async (id) => {
  const response = await axios.get(`${API_URL}products/${id}/`);
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await axios.post(`${API_URL}products/`, productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await axios.put(`${API_URL}products/${id}/`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await axios.delete(`${API_URL}products/${id}/`);
  return response.data;
};

export const getProductAttributes = async () => {
  const response = await axios.get(`${API_URL}productattributes/`);
  return response.data;
};

export const createProductAttribute = async (productAttributeData) => {
  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  };
  const response = await axios.post(
    `${API_URL}productattributes/`,
    productAttributeData
  );
  return response.data;
};

export const updateProductAttribute = async (id, productAttributeData) => {
  const response = await axios.put(
    `${API_URL}productattributes/${id}/`,
    productAttributeData
  );
  return response.data;
};

export const deleteProductAttribute = async (id) => {
  const response = await axios.delete(`${API_URL}productattributes/${id}/`);
  return response.data;
};

export const createProductAttributeLink = async (attributeLinkData) => {
  const response = await axios.post(
    `${API_URL}productattributeoptionlinks/`,
    attributeLinkData,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};
