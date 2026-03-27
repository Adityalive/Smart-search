import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000/api/auth",
    withCredentials: true,
});

export const register = async (name, email, password) => {
    const response = await api.post("/register", { name, email, password });
    return response.data;
};

export const login = async (email, password) => {
    const response = await api.post("/login", { email, password });
    return response.data;
};

export const logout = async () => {
    const response = await api.post("/logout");
    return response.data;
};

export const getme = async () => {
    const response = await api.get("/me");
    return response.data;
};
export default { register, login, logout, getme };