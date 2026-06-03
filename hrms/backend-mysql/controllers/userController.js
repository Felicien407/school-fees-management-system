import bcrypt from "bcryptjs";
import { query } from "../config/db.js";

const userListSql = `SELECT u.user_id, u.user_name, u.employee_id,
  e.emp_first_name, e.emp_last_name, e.emp_email
  FROM users u
  LEFT JOIN employees e ON u.employee_id = e.employee_id
  ORDER BY u.user_id DESC`;

export const create = async (req, res) => {
  try {
    const { userName, password, employeeId } = req.body;
    if (!userName) return res.status(400).json({ message: "Username is required." });
    if (!password) return res.status(400).json({ message: "Password is required." });
    if (!employeeId) return res.status(400).json({ message: "Select an employee for this account." });
    const emp = await query("SELECT employee_id FROM employees WHERE employee_id = ?", [employeeId]);
    if (!emp.length) return res.status(400).json({ message: "Selected employee does not exist." });
    const linked = await query("SELECT user_id FROM users WHERE employee_id = ?", [employeeId]);
    if (linked.length) return res.status(409).json({ message: "This employee already has a user account." });
    const existing = await query("SELECT user_id FROM users WHERE user_name = ?", [userName.trim()]);
    if (existing.length) return res.status(409).json({ message: "Username already exists." });
    const hash = await bcrypt.hash(password, 10);
    await query("INSERT INTO users (user_name, password, employee_id) VALUES (?, ?, ?)", [
      userName.trim(),
      hash,
      employeeId,
    ]);
    return res.status(201).json({ message: "User account created successfully." });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "Username already exists." });
    return res.status(500).json({ message: "Failed to create user account." });
  }
};

export const getAll = async (_req, res) => {
  try {
    return res.json(await query(userListSql));
  } catch {
    return res.status(500).json({ message: "Failed to fetch user records." });
  }
};

export const search = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return getAll(req, res);
    const rows = await query(
      `SELECT u.user_id, u.user_name, u.employee_id,
              e.emp_first_name, e.emp_last_name, e.emp_email
       FROM users u
       LEFT JOIN employees e ON u.employee_id = e.employee_id
       WHERE u.user_name LIKE ?
          OR e.emp_first_name LIKE ?
          OR e.emp_last_name LIKE ?
          OR e.emp_email LIKE ?
       ORDER BY u.user_id DESC`,
      [`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`]
    );
    return res.json(rows);
  } catch {
    return res.status(500).json({ message: "Failed to search users." });
  }
};

export const getById = async (req, res) => {
  try {
    const rows = await query(
      `SELECT u.user_id, u.user_name, u.employee_id,
              e.emp_first_name, e.emp_last_name, e.emp_email
       FROM users u
       LEFT JOIN employees e ON u.employee_id = e.employee_id
       WHERE u.user_id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: "User not found." });
    return res.json(rows[0]);
  } catch {
    return res.status(500).json({ message: "Failed to fetch user." });
  }
};

export const update = async (req, res) => {
  try {
    const { userName, password } = req.body;
    const rows = await query("SELECT user_id, user_name FROM users WHERE user_id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: "User not found." });
    if (userName?.trim()) {
      const dup = await query("SELECT user_id FROM users WHERE user_name = ? AND user_id <> ?", [
        userName.trim(),
        req.params.id,
      ]);
      if (dup.length) return res.status(409).json({ message: "Username already exists." });
      await query("UPDATE users SET user_name = ? WHERE user_id = ?", [userName.trim(), req.params.id]);
    }
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      await query("UPDATE users SET password = ? WHERE user_id = ?", [hash, req.params.id]);
    }
    if (!userName?.trim() && !password) {
      return res.status(400).json({ message: "Provide username and/or password to update." });
    }
    return res.json({ message: "User account updated successfully." });
  } catch {
    return res.status(500).json({ message: "Failed to update user account." });
  }
};

export const remove = async (req, res) => {
  try {
    const rows = await query("SELECT user_id, employee_id FROM users WHERE user_id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: "User not found." });
    if (!rows[0].employee_id) {
      return res.status(403).json({ message: "Cannot delete the system administrator account." });
    }
    await query("DELETE FROM users WHERE user_id = ?", [req.params.id]);
    return res.json({ message: "User account deleted successfully." });
  } catch {
    return res.status(500).json({ message: "Failed to delete user account." });
  }
};
