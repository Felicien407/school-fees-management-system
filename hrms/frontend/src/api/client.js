import axios from "axios";

/** Session-based API client (exam requirement: session login via cookie) */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5555/api",
  withCredentials: true,
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
