import { query } from "../config/db.js";

export const create = async (req, res) => {
  try {
    if (!req.body.posName) return res.status(400).json({ message: "Position name is required." });
    if (!req.body.requiredQualification) {
      return res.status(400).json({ message: "Required qualification is required." });
    }
    await query("INSERT INTO positions (pos_name, required_qualification) VALUES (?, ?)", [
      req.body.posName.trim(),
      req.body.requiredQualification.trim(),
    ]);
    return res.status(201).json({ message: "Position added successfully." });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "Position already exists." });
    return res.status(500).json({ message: "Failed to add position." });
  }
};

export const getAll = async (_req, res) => {
  try {
    return res.json(await query("SELECT * FROM positions ORDER BY position_id DESC"));
  } catch {
    return res.status(500).json({ message: "Failed to fetch position records." });
  }
};

export const search = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return getAll(req, res);
    const rows = await query(
      `SELECT * FROM positions
       WHERE pos_name LIKE ? OR required_qualification LIKE ?
       ORDER BY position_id DESC`,
      [`%${q}%`, `%${q}%`]
    );
    return res.json(rows);
  } catch {
    return res.status(500).json({ message: "Failed to search positions." });
  }
};

export const getById = async (req, res) => {
  try {
    const rows = await query("SELECT * FROM positions WHERE position_id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: "Position not found." });
    return res.json(rows[0]);
  } catch {
    return res.status(500).json({ message: "Failed to fetch position." });
  }
};

export const update = async (req, res) => {
  try {
    if (!req.body.posName?.trim()) return res.status(400).json({ message: "Position name is required." });
    if (!req.body.requiredQualification?.trim()) {
      return res.status(400).json({ message: "Required qualification is required." });
    }
    const result = await query(
      "UPDATE positions SET pos_name = ?, required_qualification = ? WHERE position_id = ?",
      [req.body.posName.trim(), req.body.requiredQualification.trim(), req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: "Position not found." });
    return res.json({ message: "Position updated successfully." });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "Position already exists." });
    return res.status(500).json({ message: "Failed to update position." });
  }
};

export const remove = async (req, res) => {
  try {
    const linked = await query("SELECT employee_id FROM employees WHERE position_id = ? LIMIT 1", [
      req.params.id,
    ]);
    if (linked.length) {
      return res.status(409).json({ message: "Cannot delete: employees hold this position." });
    }
    const result = await query("DELETE FROM positions WHERE position_id = ?", [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: "Position not found." });
    return res.json({ message: "Position deleted successfully." });
  } catch {
    return res.status(500).json({ message: "Failed to delete position." });
  }
};
