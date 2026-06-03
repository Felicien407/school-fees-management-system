import api from "./client";

export const listBorrows = (params) => api.get("/borrows", { params });
export const createBorrow = (body) => api.post("/borrows", body);
export const returnBorrow = (id) => api.patch(`/borrows/${id}/return`);
