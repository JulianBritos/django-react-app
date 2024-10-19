import axios from "axios";

const URL =
  process.env.NODE_ENV === "production"
    ? import.meta.env.VITE_BACKEND_URL
    : "http://localhost:8000";

console.log(URL);

// API para tareas
const tasksApi = axios.create({
  baseURL: `${URL}/tasks/api/v1/tasks`,
});

// API para autenticación (registro)
const authApi = axios.create({
  baseURL: `${URL}/tasks/`,
});

// Interceptor para incluir el token en cada solicitud
tasksApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken"); // Obtener el token de localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Incluir el token en los encabezados
  }
  return config; // Retornar la configuración actualizada
});

// Función para registrar un nuevo usuario
export const registerUser = (userData) => axios.post(`${URL}/`, userData);

// Funciones para tareas
export const getAllTasks = () => tasksApi.get("/");

export const getTask = (id) => tasksApi.get(`/${id}/`);

export const createTask = (task) => tasksApi.post("/", task);

export const deleteTask = (id) => tasksApi.delete(`/${id}/`);

export const updateTask = (id, task) => tasksApi.put(`/${id}/`, task);
