import axios from "axios";

const URL =
  process.env.NODE_ENV === "production"
    ? import.meta.env.VITE_BACKEND_URL
    : "http://localhost:8000";

console.log(URL);
const tasksApi = axios.create({
  baseURL: `${URL}/tasks/api/v1/tasks`,
});

export const getAllTasks = () => tasksApi.get("/");

export const createTask = (task) => tasksApi.post("/", task);

export const deleteTask = (id) => tasksApi.delete(`/${id}/`);
