import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Employee from "../models/Employee.js";
import { nextId } from "../utils/ids.js";

const strip = (doc) => { const { _id, __v, password, ...rest } = doc; return rest; };

export const create = async (req, res) => {
  try {
    const { userName, password, employeeId } = req.body;
    if (!userName) return res.status(400).json({ message: "Username is required." });
    if (!password) return res.status(400).json({ message: "Password is required." });
    if (!employeeId) return res.status(400).json({ message: "Select an employee for this account." });
    if (!(await Employee.findOne({ employee_id: Number(employeeId) }))) return res.status(400).json({ message: "Selected employee does not exist." });
    if (await User.findOne({ employee_id: Number(employeeId) })) return res.status(409).json({ message: "This employee already has a user account." });
    if (await User.findOne({ user_name: userName.trim() })) return res.status(409).json({ message: "Username already exists." });
    const user_id = await nextId("user_id");
    await User.create({ user_id, user_name: userName.trim(), password: await bcrypt.hash(password, 10), employee_id: Number(employeeId) });
    return res.status(201).json({ message: "User account created successfully." });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "Username already exists." });
    return res.status(500).json({ message: "Failed to create user account." });
  }
};

export const getAll = async (_req, res) => {
  try {
    const users = await User.find().sort({ user_id: -1 }).lean();
    const empMap = Object.fromEntries((await Employee.find().lean()).map((e) => [e.employee_id, e]));
    return res.json(users.map((u) => { const row = strip(u); const emp = empMap[u.employee_id]; if (emp) { row.emp_first_name = emp.emp_first_name; row.emp_last_name = emp.emp_last_name; row.emp_email = emp.emp_email; } return row; }));
  } catch {
    return res.status(500).json({ message: "Failed to fetch user records." });
  }
};
