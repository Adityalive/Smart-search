import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/items",
  withCredentials: true,
});

export const getClusters = async () => {
  const response = await api.get("/clusters");
  return response.data;
};
