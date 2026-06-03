import api from "./client";

export const listStudents = (params) => api.get("/students", { params });
export const createStudent = (body) => api.post("/students", body);
export const updateStudent = (id, body) => api.put(`/students/${id}`, body);
export const deleteStudent = (id) => api.delete(`/students/${id}`);
