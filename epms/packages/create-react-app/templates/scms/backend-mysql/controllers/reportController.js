import { query } from "../config/db.js";

export const getReports = async (req, res) => {
  try {
    const period = req.query.period || "daily";
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const month = req.query.month || date.slice(0, 7);

    const suppliers = await query("SELECT * FROM suppliers");
    let shipments;
    let deliveries;

    if (period === "daily") {
      shipments = await query("SELECT * FROM shipments WHERE DATE(shipment_date) = ?", [date]);
      deliveries = await query("SELECT * FROM deliveries WHERE DATE(delivery_date) = ?", [date]);
    } else if (period === "weekly") {
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required for weekly reports." });
      }
      shipments = await query("SELECT * FROM shipments WHERE DATE(shipment_date) BETWEEN ? AND ?", [startDate, endDate]);
      deliveries = await query("SELECT * FROM deliveries WHERE DATE(delivery_date) BETWEEN ? AND ?", [startDate, endDate]);
    } else {
      shipments = await query(
        "SELECT * FROM shipments WHERE DATE_FORMAT(shipment_date, '%Y-%m') = ?",
        [month]
      );
      deliveries = await query(
        "SELECT * FROM deliveries WHERE DATE_FORMAT(delivery_date, '%Y-%m') = ?",
        [month]
      );
    }

    return res.json({ period, reports: { suppliers, shipments, deliveries } });
  } catch {
    return res.status(500).json({ message: "Failed to generate reports." });
  }
};
