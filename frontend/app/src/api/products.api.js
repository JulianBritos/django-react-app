import axios from "axios";

const API_URL = import.meta.env.VITE_BASE_URL + "/apps/products/";

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
