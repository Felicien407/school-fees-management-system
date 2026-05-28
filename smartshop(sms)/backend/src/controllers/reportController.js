import * as reportModel from "../models/reportModel.js";

export const dashboardSummary = async (_req, res) => {
  const [summary] = await reportModel.getDashboardSummary();
  res.json(summary);
};

export const dailySales = async (req, res) => {
  const { date } = req.query;
  const rows = await reportModel.getDailySalesReport(date);
  res.json(rows);
};

export const monthlySales = async (req, res) => {
  const { startDate, endDate } = req.query;
  const rows = await reportModel.getMonthlySalesReport(startDate, endDate);
  res.json(rows);
};

export const productStock = async (_req, res) => {
  const rows = await reportModel.getProductStockReport();
  res.json(rows);
};

export const customerPurchases = async (req, res) => {
  const { customerName = "" } = req.query;
  const rows = await reportModel.getCustomerPurchasesReport(customerName);
  res.json(rows);
};
