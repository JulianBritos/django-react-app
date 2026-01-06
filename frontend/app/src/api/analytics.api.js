import axios from "axios";

const API_URL = import.meta.env.VITE_BASE_URL + "/apps/analytics/api/";

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
      // Si no llevaba Authorization, no redirigir automáticamente
    }
    return Promise.reject(error);
  }
);

/**
 * Obtener resumen del dashboard
 */
export const getDashboardSummary = async () => {
  const response = await axios.get(`${API_URL}analytics/dashboard_summary/`);
  return response.data;
};

/**
 * Obtener reporte de ventas
 */
export const getSalesReport = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.start_date) queryParams.append('start_date', params.start_date);
  if (params.end_date) queryParams.append('end_date', params.end_date);
  if (params.group_by) queryParams.append('group_by', params.group_by);
  
  const response = await axios.get(`${API_URL}analytics/sales_report/?${queryParams.toString()}`);
  return response.data;
};

/**
 * Obtener productos más vendidos
 */
export const getTopProducts = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.start_date) queryParams.append('start_date', params.start_date);
  if (params.end_date) queryParams.append('end_date', params.end_date);
  
  const response = await axios.get(`${API_URL}analytics/top_products/?${queryParams.toString()}`);
  return response.data;
};

/**
 * Obtener ventas por categoría
 */
export const getCategorySales = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.start_date) queryParams.append('start_date', params.start_date);
  if (params.end_date) queryParams.append('end_date', params.end_date);
  
  const response = await axios.get(`${API_URL}analytics/category_sales/?${queryParams.toString()}`);
  return response.data;
};

/**
 * Obtener analíticas de clientes
 */
export const getCustomerAnalytics = async () => {
  const response = await axios.get(`${API_URL}analytics/customer_analytics/`);
  return response.data;
};

/**
 * Obtener reporte de inventario
 */
export const getInventoryReport = async () => {
  const response = await axios.get(`${API_URL}analytics/inventory_report/`);
  return response.data;
};

/**
 * Obtener métricas de conversión
 */
export const getConversionMetrics = async () => {
  const response = await axios.get(`${API_URL}analytics/conversion_metrics/`);
  return response.data;
};

