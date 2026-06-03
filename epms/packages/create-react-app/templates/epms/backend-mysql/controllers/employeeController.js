import { query } from "../config/db.js";

const ALLOWED_GENDERS = ["Male", "Female"];

export const create = async (req, res) => {
  try {
    if (!req.body.employeeNumber) return res.status(400).json({ message: "Employee Number is required." });
    if (!req.body.firstName) return res.status(400).json({ message: "First Name is required." });
    if (!req.body.lastName) return res.status(400).json({ message: "Last Name is required." });
    if (!req.body.address) return res.status(400).json({ message: "Address is required." });
    if (!req.body.position) return res.status(400).json({ message: "Position is required." });
    if (!req.body.telephone) return res.status(400).json({ message: "Telephone is required." });
    if (!req.body.gender) return res.status(400).json({ message: "Gender is required." });
    if (!ALLOWED_GENDERS.includes(req.body.gender)) {
      return res.status(400).json({ message: "Select a valid gender (Male or Female)." });
    }
    if (!req.body.hiredDate) return res.status(400).json({ message: "Hired Date is required." });
    if (!req.body.departmentCode) return res.status(400).json({ message: "Select a department from the list." });
    const dept = await query("SELECT department_code FROM departments WHERE department_code = ?", [req.body.departmentCode]);
    if (!dept.length) return res.status(400).json({ message: "Selected department does not exist." });
    const values = [req.body.employeeNumber, req.body.firstName, req.body.lastName, req.body.address, req.body.position, req.body.telephone, req.body.gender, req.body.hiredDate, req.body.departmentCode];
    await query("INSERT INTO employees (employee_number, first_name, last_name, address, position, telephone, gender, hired_date, department_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", values);
    return res.status(201).json({ message: "Employee added successfully." });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Employee already exists." });
    }
    return res.status(500).json({ message: "Failed to add employee." });
  }
};

export const getAll = async (_req, res) => {
  try {
    const rows = await query("SELECT * FROM employees ORDER BY employee_number DESC");
    return res.json(rows);
  } catch {
    return res.status(500).json({ message: "Failed to fetch employee records." });
  }
};