import axios from "axios";

const API_URL = import.meta.env.VITE_BASE_URL + "/api";

export const getUsers = async () => {
  const token = localStorage.getItem("access");
  const response = await axios.get(`${API_URL}/users/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateUserRole = async (userId, role) => {
  const token = localStorage.getItem("access");
  await axios.patch(
    `${API_URL}/users/${userId}/update_role/`,
    { role },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const getUserById = async (userId) => {
  const token = localStorage.getItem("access");
  const response = await axios.get(`${API_URL}/users/${userId}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const token = localStorage.getItem("access");
  const response = await axios.patch(`${API_URL}/users/${userId}/`, userData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getCurrentUser = async () => {
  const token = localStorage.getItem("access");
  const response = await axios.get(`${API_URL}/users/me/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getAvailableRoles = async () => {
  const token = localStorage.getItem("access");
  const response = await axios.get(`${API_URL}/users/roles/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.roles;
};
