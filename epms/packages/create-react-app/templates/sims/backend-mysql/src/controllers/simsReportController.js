const { query } = require("../config/db");

const dailyStockStatus = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "date query (YYYY-MM-DD) is required" });
    const rows = await query(
      `SELECT sp.name AS spareName,
              sp.category,
              sp.quantity AS storedQuantity,
              COALESCE(si.total_in, 0) AS stockInQuantity,
              COALESCE(so.total_out, 0) AS stockOutQuantity,
              sp.quantity AS remainingQuantity
       FROM spare_parts sp
       LEFT JOIN (
         SELECT spare_part_id, SUM(stock_in_quantity) AS total_in
         FROM stock_in
         WHERE stock_in_date = ?
         GROUP BY spare_part_id
       ) si ON si.spare_part_id = sp.id
       LEFT JOIN (
         SELECT spare_part_id, SUM(stock_out_quantity) AS total_out
         FROM stock_out
         WHERE stock_out_date = ?
         GROUP BY spare_part_id
       ) so ON so.spare_part_id = sp.id
       ORDER BY sp.name ASC`,
      [date, date]
    );
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const dailyStockOut = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "date query (YYYY-MM-DD) is required" });

    const rows = await query(
      `SELECT so.id,
              sp.name AS spareName,
              sp.category,
              so.stock_out_quantity AS stockOutQuantity,
              so.stock_out_unit_price AS stockOutUnitPrice,
              so.stock_out_total_price AS stockOutTotalPrice,
              so.stock_out_date AS stockOutDate
       FROM stock_out so
       JOIN spare_parts sp ON sp.id = so.spare_part_id
       WHERE so.stock_out_date = ?
       ORDER BY so.stock_out_date ASC, so.id ASC`,
      [date]
    );
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { dailyStockStatus, dailyStockOut };
