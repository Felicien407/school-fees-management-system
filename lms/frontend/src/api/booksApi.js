import api from "./client";

export const listBooks = (params) => api.get("/books", { params });
export const createBook = (body) => api.post("/books", body);
export const updateBook = (id, body) => api.put(`/books/${id}`, body);
export const deleteBook = (id) => api.delete(`/books/${id}`);
