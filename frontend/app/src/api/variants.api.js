import axios from "axios";

const BASE_URL = "http://localhost:8000/apps/products/";

// Variants
export const getVariants = async () => {
  return axios.get(`${BASE_URL}variants/`);
};

export const createVariant = async (name) => {
  return axios.post(`${BASE_URL}variants/`, { name });
};

// Variant Options
export const getVariantOptions = async (variantId) => {
  return axios.get(`${BASE_URL}variant-options/?variant=${variantId}`);
};

export const createVariantOption = async (variantId, value) => {
  return axios.post(`${BASE_URL}variant-options/`, {
    variant: variantId,
    value,
  });
};

// Product Variants
export const getProductVariants = async (productId) => {
  return axios.get(`${BASE_URL}product-variants/?product=${productId}`);
};

export const createProductVariant = async (data) => {
  return axios.post(`${BASE_URL}product-variants/`, {
    product: data.productId,
    sku: data.sku,
    price: data.price,
    stock: data.stock,
    option_ids: data.optionIds, // ¡Usamos option_ids en lugar de options!
  });
};
