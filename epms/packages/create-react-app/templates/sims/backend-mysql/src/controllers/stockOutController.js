const { pool, query } = require("../config/db");

const create = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { sparePartId, stockOutQuantity, stockOutUnitPrice, stockOutDate } = req.body;
    if (!sparePartId || stockOutQuantity === undefined || stockOutUnitPrice === undefined || !stockOutDate) {
      return res.status(400).json({ message: "Spare part, quantity, unit price, and date are required" });
    }
    const qty = Number(stockOutQuantity);
    const unit = Number(stockOutUnitPrice);
    if (Number.isNaN(qty) || qty < 1) return res.status(400).json({ message: "Invalid stock-out quantity" });
    if (Number.isNaN(unit) || unit < 0) return res.status(400).json({ message: "Invalid unit price" });

    await conn.beginTransaction();
    const [parts] = await conn.execute("SELECT id, quantity, unit_price FROM spare_parts WHERE id = ? FOR UPDATE", [sparePartId]);
    const part = parts[0];
    if (!part) {
      await conn.rollback();
      return res.status(404).json({ message: "Spare part not found" });
    }
    if (part.quantity < qty) {
      await conn.rollback();
      return res.status(400).json({ message: "Not enough quantity in stock" });
    }

    const total = qty * unit;
    await conn.execute("UPDATE spare_parts SET quantity = ?, total_price = ? WHERE id = ?", [part.quantity - qty, (part.quantity - qty) * part.unit_price, sparePartId]);
    const [result] = await conn.execute(
      "INSERT INTO stock_out (spare_part_id, stock_out_quantity, stock_out_unit_price, stock_out_total_price, stock_out_date) VALUES (?, ?, ?, ?, ?)",
      [sparePartId, qty, unit, total, stockOutDate]
    );
    await conn.commit();
    return res.status(201).json({ _id: result.insertId, sparePart: sparePartId, stockOutQuantity: qty, stockOutUnitPrice: unit, stockOutTotalPrice: total, stockOutDate });
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
      `SELECT so.id AS _id, so.stock_out_quantity AS stockOutQuantity, so.stock_out_unit_price AS stockOutUnitPrice,
              so.stock_out_total_price AS stockOutTotalPrice, so.stock_out_date AS stockOutDate,
              JSON_OBJECT('_id', sp.id, 'name', sp.name, 'category', sp.category) AS sparePart
       FROM stock_out so
       JOIN spare_parts sp ON sp.id = so.spare_part_id
       ORDER BY so.stock_out_date DESC, so.id DESC`
    );
    const normalized = rows.map((r) => ({ ...r, sparePart: JSON.parse(r.sparePart) }));
    return res.json(normalized);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const update = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const qty = Number(req.body.stockOutQuantity);
    const unit = Number(req.body.stockOutUnitPrice);
    if (Number.isNaN(qty) || qty < 1) return res.status(400).json({ message: "Invalid stock-out quantity" });
    if (Number.isNaN(unit) || unit < 0) return res.status(400).json({ message: "Invalid unit price" });

    await conn.beginTransaction();
    const [outs] = await conn.execute("SELECT * FROM stock_out WHERE id = ? FOR UPDATE", [req.params.id]);
    const current = outs[0];
    if (!current) {
      await conn.rollback();
      return res.status(404).json({ message: "Stock out not found" });
    }
    const [parts] = await conn.execute("SELECT * FROM spare_parts WHERE id = ? FOR UPDATE", [current.spare_part_id]);
    const part = parts[0];
    if (!part) {
      await conn.rollback();
      return res.status(404).json({ message: "Spare part not found" });
    }

    const restoredQty = part.quantity + current.stock_out_quantity;
    if (restoredQty < qty) {
      await conn.rollback();
      return res.status(400).json({ message: "Not enough quantity in stock" });
    }
    const finalQty = restoredQty - qty;
    await conn.execute("UPDATE spare_parts SET quantity = ?, total_price = ? WHERE id = ?", [finalQty, finalQty * part.unit_price, part.id]);
    const date = req.body.stockOutDate || current.stock_out_date;
    await conn.execute(
      "UPDATE stock_out SET stock_out_quantity = ?, stock_out_unit_price = ?, stock_out_total_price = ?, stock_out_date = ? WHERE id = ?",
      [qty, unit, qty * unit, date, req.params.id]
    );
    await conn.commit();
    return res.json({ ...current, stockOutQuantity: qty, stockOutUnitPrice: unit, stockOutTotalPrice: qty * unit, stockOutDate: date });
  } catch (error) {
    await conn.rollback();
    return res.status(500).json({ message: error.message });
  } finally {
    conn.release();
  }
};

const remove = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [outs] = await conn.execute("SELECT * FROM stock_out WHERE id = ? FOR UPDATE", [req.params.id]);
    const current = outs[0];
    if (!current) {
      await conn.rollback();
      return res.status(404).json({ message: "Stock out not found" });
    }
    const [parts] = await conn.execute("SELECT * FROM spare_parts WHERE id = ? FOR UPDATE", [current.spare_part_id]);
    const part = parts[0];
    if (part) {
      const finalQty = part.quantity + current.stock_out_quantity;
      await conn.execute("UPDATE spare_parts SET quantity = ?, total_price = ? WHERE id = ?", [finalQty, finalQty * part.unit_price, part.id]);
    }
    await conn.execute("DELETE FROM stock_out WHERE id = ?", [req.params.id]);
    await conn.commit();
    return res.json({ message: "Stock out removed" });
  } catch (error) {
    await conn.rollback();
    return res.status(500).json({ message: error.message });
  } finally {
    conn.release();
  }
};

module.exports = { create, list, update, remove };
