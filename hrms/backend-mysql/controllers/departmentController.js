import { query } from "../config/db.js";

export const create = async (req, res) => {
  try {
    if (!req.body.departName) {
      return res.status(400).json({ message: "Department name is required." });
    }
    await query("INSERT INTO departments (depart_name) VALUES (?)", [req.body.departName.trim()]);
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
    const rows = await query("SELECT * FROM departments ORDER BY department_id DESC");
    return res.json(rows);
  } catch {
    return res.status(500).json({ message: "Failed to fetch department records." });
  }
};
