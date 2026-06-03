import pool, { query } from "../config/db.js";

export const getSales = () =>
  query(
    `SELECT s.sale_id, s.quantity, s.unit_price, s.total_price, s.sale_date,
            c.customer_id, c.full_name AS customer_name,
            p.product_id, p.product_name
     FROM sales s
     JOIN customers c ON c.customer_id = s.customer_id
     JOIN products p ON p.product_id = s.product_id
     ORDER BY s.sale_date DESC`
  );

export const createSale = async ({ customerId, productId, quantity }) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [products] = await connection.execute(
      "SELECT product_id, product_name, price, quantity FROM products WHERE product_id = ? FOR UPDATE",
      [productId]
    );
    if (!products.length) {
      throw new Error("Product not found.");
    }

    const product = products[0];
    if (Number(product.quantity) < Number(quantity)) {
      throw new Error("Insufficient stock.");
    }

    const unitPrice = Number(product.price);
    const totalPrice = unitPrice * Number(quantity);

    const [result] = await connection.execute(
      `INSERT INTO sales (customer_id, product_id, quantity, unit_price, total_price, sale_date)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [customerId, productId, quantity, unitPrice, totalPrice]
    );

    await connection.execute(
      "UPDATE products SET quantity = quantity - ? WHERE product_id = ?",
      [quantity, productId]
    );

    await connection.commit();
    return result.insertId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
