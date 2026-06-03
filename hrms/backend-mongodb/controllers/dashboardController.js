import Employee from "../models/Employee.js";
import Department from "../models/Department.js";
import Position from "../models/Position.js";
import User from "../models/User.js";

export const getStats = async (_req, res) => {
  try {
    const [employees, departments, positions, users, activeEmployees] = await Promise.all([
      Employee.countDocuments(), Department.countDocuments(), Position.countDocuments(), User.countDocuments(), Employee.countDocuments({ emp_status: "Active" }),
    ]);
    return res.json({ employees, departments, positions, users, activeEmployees });
  } catch {
    return res.status(500).json({ message: "Failed to load dashboard stats." });
  }
};
