import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/items",
  withCredentials: true,
});

export const getGraphData = async () => {
  const response = await api.get("/graph");
  return response.data;
};

export const getRelatedItems = async (itemId) => {
  const response = await api.get(`/${itemId}/related`);
  return response.data;
};

export const semanticSearch = async (query) => {
  const response = await api.get("/search", { params: { q: query } });
  return response.data;
};
