import api from "./client";

export const loginUser = (body) => api.post("/auth/login", body);
export const fetchMe = () => api.get("/auth/me");
export const logoutUser = () => api.post("/auth/logout");
