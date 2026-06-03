const { query } = require("../config/db");

const create = async (req, res) => {
  const conn = await require("../config/db").pool.getConnection();
  try {
    const { sparePartId, stockInQuantity, stockInDate } = req.body;
    if (!sparePartId || stockInQuantity === undefined || !stockInDate) {
      return res.status(400).json({ message: "Spare part, stock-in quantity, and date are required" });
    }
    const qty = Number(stockInQuantity);
    if (Number.isNaN(qty) || qty < 1) {
      return res.status(400).json({ message: "Stock-in quantity must be at least 1" });
    }

    await conn.beginTransaction();
    const [parts] = await conn.execute("SELECT id, quantity, unit_price FROM spare_parts WHERE id = ? FOR UPDATE", [sparePartId]);
    const part = parts[0];
    if (!part) {
      await conn.rollback();
      return res.status(404).json({ message: "Spare part not found" });
    }
    const newQty = part.quantity + qty;
    await conn.execute("UPDATE spare_parts SET quantity = ?, total_price = quantity * unit_price WHERE id = ?", [newQty, sparePartId]);
    const [result] = await conn.execute(
      "INSERT INTO stock_in (spare_part_id, stock_in_quantity, stock_in_date) VALUES (?, ?, ?)",
      [sparePartId, qty, stockInDate]
    );
    await conn.commit();
    return res.status(201).json({ _id: result.insertId, sparePart: sparePartId, stockInQuantity: qty, stockInDate });
  } catch (error) {
    await conn.rollback();
    return res.status(500).json({ message: error.message });
  } finally {
    conn.release();
  }
};

const list = async (_req, res) => {
  try {
    const rows = await query(
      `SELECT si.id AS _id, si.stock_in_quantity AS stockInQuantity, si.stock_in_date AS stockInDate,
              JSON_OBJECT('_id', sp.id, 'name', sp.name, 'category', sp.category) AS sparePart
       FROM stock_in si
       JOIN spare_parts sp ON sp.id = si.spare_part_id
       ORDER BY si.stock_in_date DESC, si.id DESC`
    );
    const normalized = rows.map((r) => ({ ...r, sparePart: JSON.parse(r.sparePart) }));
    return res.json(normalized);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { create, list };
