import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/items",
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
