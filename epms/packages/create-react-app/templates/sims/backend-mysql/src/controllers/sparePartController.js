const { query } = require("../config/db");

const create = async (req, res) => {
  try {
    const { name, category, quantity, unitPrice } = req.body;
    if (!name || !category || quantity === undefined || unitPrice === undefined) {
      return res.status(400).json({ message: "Name, category, quantity, and unit price are required" });
    }
    const q = Number(quantity);
    const u = Number(unitPrice);
    if (Number.isNaN(q) || q < 0 || Number.isNaN(u) || u < 0) {
      return res.status(400).json({ message: "Invalid quantity or unit price" });
    }

    const total = q * u;
    const result = await query(
      "INSERT INTO spare_parts (name, category, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)",
      [String(name).trim(), String(category).trim(), q, u, total]
    );
    const rows = await query(
      "SELECT id AS _id, name, category, quantity, unit_price AS unitPrice, total_price AS totalPrice FROM spare_parts WHERE id = ?",
      [result.insertId]
    );
    return res.status(201).json(rows[0]);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "A spare part with this name and category already exists" });
    }
    return res.status(500).json({ message: error.message });
  }
};

const list = async (_req, res) => {
  try {
    const items = await query(
      "SELECT id AS _id, name, category, quantity, unit_price AS unitPrice, total_price AS totalPrice FROM spare_parts ORDER BY name ASC"
    );
    return res.json(items);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { create, list };
