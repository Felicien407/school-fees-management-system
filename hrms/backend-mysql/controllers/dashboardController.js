import { query } from "../config/db.js";

export const getStats = async (_req, res) => {
  try {
    const [empCount] = await query("SELECT COUNT(*) AS count FROM employees");
    const [deptCount] = await query("SELECT COUNT(*) AS count FROM departments");
    const [posCount] = await query("SELECT COUNT(*) AS count FROM positions");
    const [userCount] = await query("SELECT COUNT(*) AS count FROM users");
    const [activeCount] = await query("SELECT COUNT(*) AS count FROM employees WHERE emp_status = 'Active'");
    return res.json({ employees: empCount.count, departments: deptCount.count, positions: posCount.count, users: userCount.count, activeEmployees: activeCount.count });
  } catch {
    return res.status(500).json({ message: "Failed to load dashboard stats." });
  }
};
