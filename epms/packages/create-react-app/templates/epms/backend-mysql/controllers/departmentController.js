import { query } from "../config/db.js";

export const create = async (req, res) => {
  try {
    if (!req.body.departmentCode) return res.status(400).json({ message: "Department Code is required." });
    if (!req.body.departmentName) return res.status(400).json({ message: "Department Name is required." });
    const values = [req.body.departmentCode, req.body.departmentName];
    await query("INSERT INTO departments (department_code, department_name) VALUES (?, ?)", values);
    return res.status(201).json({ message: "Department added successfully." });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Department already exists." });
    }
    return res.status(500).json({ message: "Failed to add department." });
  }
};

export const getAll = async (_req, res) => {
  try {
    const rows = await query("SELECT * FROM departments ORDER BY department_code DESC");
    return res.json(rows);
  } catch {
    return res.status(500).json({ message: "Failed to fetch department records." });
  }
};