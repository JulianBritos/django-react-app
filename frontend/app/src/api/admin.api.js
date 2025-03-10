import axios from "axios";

const API_URL = "http://localhost:8000/api";

export const getUsers = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/users/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateUserRole = async (userId, role) => {
  const token = localStorage.getItem("token");
  await axios.patch(
    `${API_URL}/users/${userId}/`,
    { role },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};
