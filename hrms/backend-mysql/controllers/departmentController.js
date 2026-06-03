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

export const search = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return getAll(req, res);
    const rows = await query(
      "SELECT * FROM departments WHERE depart_name LIKE ? ORDER BY department_id DESC",
      [`%${q}%`]
    );
    return res.json(rows);
  } catch {
    return res.status(500).json({ message: "Failed to search departments." });
  }
};

export const getById = async (req, res) => {
  try {
    const rows = await query("SELECT * FROM departments WHERE department_id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: "Department not found." });
    return res.json(rows[0]);
  } catch {
    return res.status(500).json({ message: "Failed to fetch department." });
  }
};

export const update = async (req, res) => {
  try {
    if (!req.body.departName?.trim()) {
      return res.status(400).json({ message: "Department name is required." });
    }
    const result = await query("UPDATE departments SET depart_name = ? WHERE department_id = ?", [
      req.body.departName.trim(),
      req.params.id,
    ]);
    if (!result.affectedRows) return res.status(404).json({ message: "Department not found." });
    return res.json({ message: "Department updated successfully." });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "Department already exists." });
    return res.status(500).json({ message: "Failed to update department." });
  }
};

export const remove = async (req, res) => {
  try {
    const linked = await query("SELECT employee_id FROM employees WHERE department_id = ? LIMIT 1", [
      req.params.id,
    ]);
    if (linked.length) {
      return res.status(409).json({ message: "Cannot delete: employees are assigned to this department." });
    }
    const result = await query("DELETE FROM departments WHERE department_id = ?", [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: "Department not found." });
    return res.json({ message: "Department deleted successfully." });
  } catch {
    return res.status(500).json({ message: "Failed to delete department." });
  }
};
