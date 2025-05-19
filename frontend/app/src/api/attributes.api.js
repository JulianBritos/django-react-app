import axios from "axios";

const API_URL = import.meta.env.VITE_BASE_URL + "/apps/products/attributes/";
const API_OPTIONS_URL = import.meta.env.VITE_BASE_URL + "/apps/products/attributeoptions/";

// Obtener todos los atributos
export const getAttributes = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Crear un nuevo atributo
export const createAttribute = async (attributeData) => {
  const response = await axios.post(API_URL, attributeData);
  return response.data;
};

// Editar un atributo existente
export const updateAttribute = async (id, attributeData) => {
  const response = await axios.put(`${API_URL}${id}/`, attributeData);
  return response.data;
};

// Eliminar un atributo
export const deleteAttribute = async (id) => {
  await axios.delete(`${API_URL}${id}/`);
};

// Obtener todas las opciones de atributos
export const getAttributeOptions = async () => {
  const response = await axios.get(API_OPTIONS_URL);
  return response.data;
};

// Crear una nueva opción de atributo
export const createAttributeOption = async (optionData) => {
  const response = await axios.post(API_OPTIONS_URL, optionData);
  return response.data;
};

// Editar una opción de atributo existente
export const updateAttributeOption = async (id, optionData) => {
  const response = await axios.put(`${API_OPTIONS_URL}${id}/`, optionData);
  return response.data;
};

// Eliminar una opción de atributo
export const deleteAttributeOption = async (id) => {
  await axios.delete(`${API_OPTIONS_URL}${id}/`);
};
