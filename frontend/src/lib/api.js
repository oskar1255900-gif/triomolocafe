import axios from "axios";

// Pobieramy bazowy URL backendu (usuwamy ewentualny "/api" z końca, jeśli został wpisany w zmiennej)
const BASE_URL = (process.env.REACT_APP_API_URL || "").replace(/\/api\/?$/, "");

const API = `${BASE_URL}/api`;

export const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("tm_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export { API };

export const mediaUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  return `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

export default api;
