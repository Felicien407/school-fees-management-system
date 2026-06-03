import bcrypt from "bcryptjs";
import { query } from "../config/db.js";

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
    await query("INSERT INTO users (user_name, password, employee_id) VALUES (?, ?, ?)", [userName.trim(), hash, employeeId]);
    return res.status(201).json({ message: "User account created successfully." });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "Username already exists." });
    return res.status(500).json({ message: "Failed to create user account." });
  }
};

export const getAll = async (_req, res) => {
  try {
    return res.json(await query(`SELECT u.user_id, u.user_name, u.employee_id, e.emp_first_name, e.emp_last_name, e.emp_email FROM users u LEFT JOIN employees e ON u.employee_id = e.employee_id ORDER BY u.user_id DESC`));
  } catch {
    return res.status(500).json({ message: "Failed to fetch user records." });
  }
};
