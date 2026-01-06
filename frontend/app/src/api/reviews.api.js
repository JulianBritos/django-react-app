import axios from "axios";

const API_URL = import.meta.env.VITE_BASE_URL + "/apps/products/";

// Configurar axios para incluir el token automáticamente
axios.interceptors.request.use(
  (config) => {
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
      const hadAuth = !!error.config?.headers?.Authorization;
      if (hadAuth) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/login";
      }
      // Para peticiones públicas de reviews, dejar que el caller maneje el 401
    }
    return Promise.reject(error);
  }
);

/**
 * Obtener reseñas de un producto
 */
export const getProductReviews = async (productId) => {
  const response = await axios.get(`${API_URL}reviews/?product_id=${productId}`);
  return response.data;
};

/**
 * Crear una nueva reseña
 */
export const createReview = async (reviewData) => {
  const response = await axios.post(`${API_URL}reviews/`, reviewData);
  return response.data;
};

/**
 * Marcar una reseña como útil o no útil
 */
export const markReviewHelpful = async (reviewId, isHelpful = true) => {
  const response = await axios.post(`${API_URL}reviews/${reviewId}/mark_helpful/`, {
    is_helpful: isHelpful
  });
  return response.data;
};

/**
 * Obtener una reseña específica
 */
export const getReviewById = async (reviewId) => {
  const response = await axios.get(`${API_URL}reviews/${reviewId}/`);
  return response.data;
};

