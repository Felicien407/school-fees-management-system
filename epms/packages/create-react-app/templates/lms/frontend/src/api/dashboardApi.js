import api from "./client";

export const fetchStats = () => api.get("/dashboard/stats");
