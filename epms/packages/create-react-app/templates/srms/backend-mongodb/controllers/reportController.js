import Customer from "../models/Customer.js";
import Product from "../models/Product.js";
import Sale from "../models/Sale.js";

const clean = (rows) => rows.map((r) => { const { _id, __v, ...rest } = r; return rest; });

const monthBounds = (month) => {
  const start = new Date(`${month}-01T00:00:00`);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

export const getReports = async (req, res) => {
  try {
    const period = req.query.period || "daily";
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const month = req.query.month || date.slice(0, 7);

    let sales;
    if (period === "daily") {
      const start = new Date(`${date}T00:00:00`);
      const end = new Date(`${date}T23:59:59`);
      sales = clean(await Sale.find({ sales_date: { $gte: start, $lte: end } }).lean());
    } else if (period === "weekly") {
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required for weekly reports." });
      }
      const start = new Date(`${startDate}T00:00:00`);
      const end = new Date(`${endDate}T23:59:59`);
      sales = clean(await Sale.find({ sales_date: { $gte: start, $lte: end } }).lean());
    } else {
      const { start, end } = monthBounds(month);
      sales = clean(await Sale.find({ sales_date: { $gte: start, $lte: end } }).lean());
    }

    const customers = clean(await Customer.find().lean());
    const products = clean(await Product.find().lean());
    return res.json({ period, reports: { customers, products, sales } });
  } catch {
    return res.status(500).json({ message: "Failed to generate reports." });
  }
};
