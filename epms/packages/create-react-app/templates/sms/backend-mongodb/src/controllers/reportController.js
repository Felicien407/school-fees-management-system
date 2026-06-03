import Product from "../models/Product.js";
import Customer from "../models/Customer.js";
import Sale from "../models/Sale.js";
import { mapSale } from "../utils/mappers.js";

const dayRange = (dateStr) => {
  const start = new Date(String(dateStr));
  if (Number.isNaN(start.getTime())) return null;
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

export const dashboardSummary = async (_req, res) => {
  const [totalProducts, totalCustomers, totalSales, revenueAgg] = await Promise.all([
    Product.countDocuments(),
    Customer.countDocuments(),
    Sale.countDocuments(),
    Sale.aggregate([{ $group: { _id: null, total: { $sum: "$totalPrice" } } }]),
  ]);
  res.json({
    total_products: totalProducts,
    total_customers: totalCustomers,
    total_sales: totalSales,
    total_revenue: revenueAgg[0]?.total || 0,
  });
};

export const dailySales = async (req, res) => {
  const { date } = req.query;
  const range = dayRange(date);
  if (!range) return res.status(400).json({ message: "Invalid date" });
  const sales = await Sale.find({ saleDate: { $gte: range.start, $lt: range.end } })
    .populate("customer")
    .populate("product")
    .sort({ saleDate: -1 });
  res.json(sales.map(mapSale));
};

export const monthlySales = async (req, res) => {
  const { startDate, endDate } = req.query;
  const start = dayRange(startDate)?.start;
  const end = dayRange(endDate)?.end;
  if (!start || !end) return res.status(400).json({ message: "Invalid date range" });
  const sales = await Sale.find({ saleDate: { $gte: start, $lt: end } })
    .populate("customer")
    .populate("product")
    .sort({ saleDate: -1 });
  res.json(sales.map(mapSale));
};

export const productStock = async (_req, res) => {
  const products = await Product.find().sort({ productName: 1 });
  const rows = await Promise.all(
    products.map(async (p) => {
      const soldAgg = await Sale.aggregate([
        { $match: { product: p._id } },
        { $group: { _id: null, sold: { $sum: "$quantity" } } },
      ]);
      return {
        product_id: p._id,
        product_name: p.productName,
        available_stock: p.quantity,
        sold_stock: soldAgg[0]?.sold || 0,
      };
    })
  );
  res.json(rows);
};

export const customerPurchases = async (req, res) => {
  const { customerName = "" } = req.query;
  const customers = await Customer.find({ fullName: { $regex: customerName, $options: "i" } });
  const customerIds = customers.map((c) => c._id);
  const sales = await Sale.find({ customer: { $in: customerIds } })
    .populate("customer")
    .populate("product")
    .sort({ saleDate: -1 });
  res.json(sales.map(mapSale));
};
