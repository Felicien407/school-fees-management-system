import { query } from "../config/db.js";

export const create = async (req, res) => {
  try {
    if (!req.body.posName) return res.status(400).json({ message: "Position name is required." });
    if (!req.body.requiredQualification) return res.status(400).json({ message: "Required qualification is required." });
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
