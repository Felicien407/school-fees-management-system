import pool, { query } from "../config/db.js";

export const getAllProducts = () =>
  query("SELECT * FROM products ORDER BY created_at DESC");

export const createProduct = (payload) =>
  query(
    `INSERT INTO products (product_name, category, quantity, price, created_at)
     VALUES (?, ?, ?, ?, NOW())`,
    [payload.productName, payload.category, payload.quantity, payload.price]
  );

export const updateProduct = (id, payload) =>
  query(
    `UPDATE products
     SET product_name = ?, category = ?, quantity = ?, price = ?
     WHERE product_id = ?`,
    [payload.productName, payload.category, payload.quantity, payload.price, id]
  );

export const deleteProduct = async (id) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute("DELETE FROM sales WHERE product_id = ?", [id]);
    await connection.execute("DELETE FROM products WHERE product_id = ?", [id]);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const getProductById = (id) =>
  query("SELECT * FROM products WHERE product_id = ?", [id]);
