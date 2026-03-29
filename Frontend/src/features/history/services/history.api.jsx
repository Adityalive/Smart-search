import axios from "axios";

const api = axios.create({
  baseURL: "/api/history",
  withCredentials: true,
});

export const createHistory = async (query, type = "search") => {
  const response = await api.post("/", { query, type });
  return response.data;
};

export const getHistory = async () => {
  const response = await api.get("/");
  return response.data;
};

export const clearHistory = async () => {
  const response = await api.delete("/");
  return response.data;
};
