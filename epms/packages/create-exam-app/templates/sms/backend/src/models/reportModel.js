import { query } from "../config/db.js";

export const getDailySalesReport = (date) =>
  query(
    `SELECT s.sale_id, c.full_name AS customer_name, p.product_name, s.quantity,
            s.unit_price, s.total_price, s.sale_date
     FROM sales s
     JOIN customers c ON c.customer_id = s.customer_id
     JOIN products p ON p.product_id = s.product_id
     WHERE DATE(s.sale_date) = ?
     ORDER BY s.sale_date DESC`,
    [date]
  );

export const getMonthlySalesReport = (startDate, endDate) =>
  query(
    `SELECT s.sale_id, c.full_name AS customer_name, p.product_name, s.quantity,
            s.unit_price, s.total_price, s.sale_date
     FROM sales s
     JOIN customers c ON c.customer_id = s.customer_id
     JOIN products p ON p.product_id = s.product_id
     WHERE DATE(s.sale_date) BETWEEN ? AND ?
     ORDER BY s.sale_date DESC`,
    [startDate, endDate]
  );

export const getProductStockReport = () =>
  query(
    `SELECT p.product_id, p.product_name, p.quantity AS available_stock,
            COALESCE(SUM(s.quantity), 0) AS sold_stock
     FROM products p
     LEFT JOIN sales s ON s.product_id = p.product_id
     GROUP BY p.product_id, p.product_name, p.quantity
     ORDER BY p.product_name`
  );

export const getCustomerPurchasesReport = (customerName) =>
  query(
    `SELECT s.sale_id, c.full_name AS customer_name, p.product_name, s.quantity,
            s.unit_price, s.total_price, s.sale_date
     FROM sales s
     JOIN customers c ON c.customer_id = s.customer_id
     JOIN products p ON p.product_id = s.product_id
     WHERE c.full_name LIKE ?
     ORDER BY s.sale_date DESC`,
    [`%${customerName}%`]
  );

export const getDashboardSummary = () =>
  query(
    `SELECT
        (SELECT COUNT(*) FROM products) AS total_products,
        (SELECT COUNT(*) FROM customers) AS total_customers,
        (SELECT COUNT(*) FROM sales) AS total_sales,
        (SELECT COALESCE(SUM(total_price), 0) FROM sales) AS total_revenue`
  );
