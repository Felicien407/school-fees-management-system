import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5555/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hrms_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function getApiError(err, fallback = "Request failed.") {
  if (!err?.response) {
    return "Cannot reach the API server. Start the backend: cd hrms/backend-mysql && npm run dev (port 5555).";
  }
  const data = err.response.data;
  if (typeof data?.message === "string") return data.message;
  if (typeof data?.error === "string") return data.error;
  return fallback;
}

export default api;
