import pool, { query } from "../config/db.js";

export const getAllCustomers = () =>
  query("SELECT * FROM customers ORDER BY registration_date DESC");

export const searchCustomers = (term) =>
  query(
    `SELECT *
     FROM customers
     WHERE full_name LIKE ? OR phone_number LIKE ? OR email LIKE ?
     ORDER BY registration_date DESC`,
    [`%${term}%`, `%${term}%`, `%${term}%`]
  );

export const createCustomer = (payload) =>
  query(
    `INSERT INTO customers (full_name, phone_number, email, address, registration_date)
     VALUES (?, ?, ?, ?, NOW())`,
    [payload.fullName, payload.phoneNumber, payload.email, payload.address]
  );

export const updateCustomer = (id, payload) =>
  query(
    `UPDATE customers
     SET full_name = ?, phone_number = ?, email = ?, address = ?
     WHERE customer_id = ?`,
    [payload.fullName, payload.phoneNumber, payload.email, payload.address, id]
  );

export const deleteCustomer = async (id) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute("DELETE FROM sales WHERE customer_id = ?", [id]);
    await connection.execute("DELETE FROM customers WHERE customer_id = ?", [id]);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
