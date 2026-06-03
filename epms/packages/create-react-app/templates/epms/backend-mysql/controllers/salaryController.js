import { query } from "../config/db.js";

const calcNet = (gross, deduction) => {
  const g = Number(gross);
  const d = Number(deduction);
  if (Number.isNaN(g) || Number.isNaN(d)) return null;
  return Math.round((g - d) * 100) / 100;
};

export const create = async (req, res) => {
  try {
    if (req.body.grossSalary === undefined || req.body.grossSalary === "") {
      return res.status(400).json({ message: "Gross Salary is required." });
    }
    if (req.body.totalDeduction === undefined || req.body.totalDeduction === "") {
      return res.status(400).json({ message: "Total Deduction is required." });
    }
    if (!req.body.monthOfPayment) {
      return res.status(400).json({ message: "Month of Payment is required." });
    }
    if (!req.body.employeeNumber) {
      return res.status(400).json({ message: "Employee is required." });
    }
    const netSalary = calcNet(req.body.grossSalary, req.body.totalDeduction);
    if (netSalary === null) {
      return res.status(400).json({ message: "Invalid salary amounts." });
    }
    const values = [req.body.grossSalary, req.body.totalDeduction, netSalary, req.body.monthOfPayment, req.body.employeeNumber];
    await query(
      "INSERT INTO salaries (gross_salary, total_deduction, net_salary, month_of_payment, employee_number) VALUES (?, ?, ?, ?, ?)",
      values
    );
    return res.status(201).json({ message: "Salary added successfully." });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Salary already exists." });
    }
    return res.status(500).json({ message: "Failed to add salary." });
  }
};

export const getAll = async (_req, res) => {
  try {
    const rows = await query("SELECT * FROM salaries ORDER BY salary_id DESC");
    return res.json(rows);
  } catch {
    return res.status(500).json({ message: "Failed to fetch salary records." });
  }
};

export const update = async (req, res) => {
  try {
    if (req.body.grossSalary === undefined || req.body.grossSalary === "") {
      return res.status(400).json({ message: "Gross Salary is required." });
    }
    if (req.body.totalDeduction === undefined || req.body.totalDeduction === "") {
      return res.status(400).json({ message: "Total Deduction is required." });
    }
    if (!req.body.monthOfPayment) {
      return res.status(400).json({ message: "Month of Payment is required." });
    }
    if (!req.body.employeeNumber) {
      return res.status(400).json({ message: "Employee is required." });
    }
    const netSalary = calcNet(req.body.grossSalary, req.body.totalDeduction);
    if (netSalary === null) {
      return res.status(400).json({ message: "Invalid salary amounts." });
    }
    const values = [req.body.grossSalary, req.body.totalDeduction, netSalary, req.body.monthOfPayment, req.body.employeeNumber, req.params.id];
    const result = await query(
      "UPDATE salaries SET gross_salary = ?, total_deduction = ?, net_salary = ?, month_of_payment = ?, employee_number = ? WHERE salary_id = ?",
      values
    );
    if (!result.affectedRows) {
      return res.status(404).json({ message: "Salary not found." });
    }
    return res.json({ message: "Salary updated successfully." });
  } catch {
    return res.status(500).json({ message: "Failed to update salary." });
  }
};

export const remove = async (req, res) => {
  try {
    const result = await query("DELETE FROM salaries WHERE salary_id = ?", [req.params.id]);
    if (!result.affectedRows) {
      return res.status(404).json({ message: "Salary not found." });
    }
    return res.json({ message: "Salary deleted successfully." });
  } catch {
    return res.status(500).json({ message: "Failed to delete salary." });
  }
};
