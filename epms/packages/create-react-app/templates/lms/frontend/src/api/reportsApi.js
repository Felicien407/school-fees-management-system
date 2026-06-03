import api from "./client";

export const reportStudents = () => api.get("/reports/students");
export const reportBooks = () => api.get("/reports/books");
export const reportBorrowed = () => api.get("/reports/borrowed");
export const reportReturned = () => api.get("/reports/returned");
