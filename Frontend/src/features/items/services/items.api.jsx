import axios from "axios";

const api = axios.create({
  baseURL: "/api/items",
  withCredentials: true,
});

export const saveItem = async (formData) => {
  const response = await api.post("/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getItems = async () => {
  const response = await api.get("/");
  return response.data;
};

export const getClusters = async () => {
    const response = await api.get("/clusters");
    return response.data;
};

export const getResurfacedItems = async (days = 30) => {
    const response = await api.get(`/resurfaced?days=${days}`);
    return response.data;
};

export const searchSimilar = async (query) => {
    const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
    return response.data;
};

