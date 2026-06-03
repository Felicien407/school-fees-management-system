import { query } from "../config/db.js";
import { EMPLOYEE_STATUSES } from "../constants/employeeStatuses.js";

const ALLOWED_GENDERS = ["Male", "Female"];
const ALLOWED_STATUSES = EMPLOYEE_STATUSES;

const employeeSelect = `
  SELECT e.*, d.depart_name, p.pos_name, p.required_qualification
  FROM employees e
  JOIN departments d ON e.department_id = d.department_id
  JOIN positions p ON e.position_id = p.position_id
`;

const validateBody = async (b, employeeId = null) => {
  if (!b.empFirstName) return "First name is required.";
  if (!b.empLastName) return "Last name is required.";
  if (!b.empGender) return "Gender is required.";
  if (!ALLOWED_GENDERS.includes(b.empGender)) return "Select a valid gender (Male or Female).";
  if (!b.empDateOfBirth) return "Date of birth is required.";
  if (!b.empEmail) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(b.empEmail).trim())) return "Enter a valid email address.";
  if (!b.empTelephone) return "Telephone is required.";
  if (!b.empAddress) return "Address is required.";
  if (!b.empHireDate) return "Hire date is required.";
  if (!b.empStatus) return "Employment status is required.";
  if (!ALLOWED_STATUSES.includes(b.empStatus)) return "Select a valid employment status.";
  if (!b.departmentId) return "Select a department from the list.";
  if (!b.positionId) return "Select a position from the list.";
  const dept = await query("SELECT department_id FROM departments WHERE department_id = ?", [b.departmentId]);
  if (!dept.length) return "Selected department does not exist.";
  const pos = await query("SELECT position_id FROM positions WHERE position_id = ?", [b.positionId]);
  if (!pos.length) return "Selected position does not exist.";
  if (employeeId) {
    const existing = await query("SELECT employee_id FROM employees WHERE employee_id = ?", [employeeId]);
    if (!existing.length) return "Employee not found.";
  }
  return null;
};

export const create = async (req, res) => {
  try {
    const err = await validateBody(req.body);
    if (err) return res.status(400).json({ message: err });
    const b = req.body;
    await query(
      `INSERT INTO employees (emp_first_name, emp_last_name, emp_gender, emp_date_of_birth, emp_email, emp_telephone, emp_address, emp_hire_date, emp_status, department_id, position_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [b.empFirstName.trim(), b.empLastName.trim(), b.empGender, b.empDateOfBirth, b.empEmail.trim().toLowerCase(), b.empTelephone.trim(), b.empAddress.trim(), b.empHireDate, b.empStatus, b.departmentId, b.positionId]
    );
    return res.status(201).json({ message: "Employee added successfully." });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "Employee email already exists." });
    return res.status(500).json({ message: "Failed to add employee." });
  }
};

export const getAll = async (_req, res) => {
  try {
    return res.json(await query(`${employeeSelect} ORDER BY e.employee_id DESC`));
  } catch {
    return res.status(500).json({ message: "Failed to fetch employee records." });
  }
};

export const getById = async (req, res) => {
  try {
    const rows = await query(`${employeeSelect} WHERE e.employee_id = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: "Employee not found." });
    return res.json(rows[0]);
  } catch {
    return res.status(500).json({ message: "Failed to fetch employee." });
  }
};

export const search = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return getAll(req, res);
    const like = `%${q}%`;
    const rows = await query(
      `${employeeSelect}
       WHERE e.emp_first_name LIKE ? OR e.emp_last_name LIKE ? OR e.emp_email LIKE ?
         OR d.depart_name LIKE ? OR p.pos_name LIKE ? OR e.emp_status LIKE ?
       ORDER BY e.emp_last_name, e.emp_first_name`,
      [like, like, like, like, like, like]
    );
    return res.json(rows);
  } catch {
    return res.status(500).json({ message: "Failed to search employees." });
  }
};

export const update = async (req, res) => {
  try {
    const err = await validateBody(req.body, req.params.id);
    if (err) return res.status(400).json({ message: err });
    const b = req.body;
    const result = await query(
      `UPDATE employees SET emp_first_name = ?, emp_last_name = ?, emp_gender = ?, emp_date_of_birth = ?,
        emp_email = ?, emp_telephone = ?, emp_address = ?, emp_hire_date = ?, emp_status = ?,
        department_id = ?, position_id = ? WHERE employee_id = ?`,
      [b.empFirstName.trim(), b.empLastName.trim(), b.empGender, b.empDateOfBirth, b.empEmail.trim().toLowerCase(), b.empTelephone.trim(), b.empAddress.trim(), b.empHireDate, b.empStatus, b.departmentId, b.positionId, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: "Employee not found." });
    return res.json({ message: "Employee updated successfully." });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "Employee email already exists." });
    return res.status(500).json({ message: "Failed to update employee." });
  }
};

export const remove = async (req, res) => {
  try {
    const linked = await query("SELECT user_id FROM users WHERE employee_id = ?", [req.params.id]);
    if (linked.length) {
      return res.status(400).json({ message: "Cannot delete employee linked to a user account. Remove the user first." });
    }
    const result = await query("DELETE FROM employees WHERE employee_id = ?", [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: "Employee not found." });
    return res.json({ message: "Employee deleted successfully." });
  } catch {
    return res.status(500).json({ message: "Failed to delete employee." });
  }
};

export const getAvailableForUser = async (_req, res) => {
  try {
    return res.json(await query(`SELECT e.employee_id, e.emp_first_name, e.emp_last_name, e.emp_email FROM employees e LEFT JOIN users u ON e.employee_id = u.employee_id WHERE u.employee_id IS NULL ORDER BY e.emp_last_name, e.emp_first_name`));
  } catch {
    return res.status(500).json({ message: "Failed to fetch available employees." });
  }
};

export const getMe = async (req, res) => {
  try {
    const employeeId = req.session?.user?.employeeId ?? req.user?.employeeId;
    if (!employeeId) {
      return res.status(403).json({ message: "This account is not linked to an employee record." });
    }
    const rows = await query(`${employeeSelect} WHERE e.employee_id = ?`, [employeeId]);
    if (!rows.length) return res.status(404).json({ message: "Your employee record was not found." });
    return res.json(rows[0]);
  } catch {
    return res.status(500).json({ message: "Failed to load your profile." });
  }
};

export const updateMe = async (req, res) => {
  try {
    const employeeId = req.session?.user?.employeeId ?? req.user?.employeeId;
    if (!employeeId) {
      return res.status(403).json({ message: "This account is not linked to an employee record." });
    }
    const { empTelephone, empAddress } = req.body;
    if (!empTelephone?.trim()) return res.status(400).json({ message: "Telephone is required." });
    if (!empAddress?.trim()) return res.status(400).json({ message: "Address is required." });
    const result = await query(
      "UPDATE employees SET emp_telephone = ?, emp_address = ? WHERE employee_id = ?",
      [empTelephone.trim(), empAddress.trim(), employeeId]
    );
    if (!result.affectedRows) return res.status(404).json({ message: "Your employee record was not found." });
    return res.json({ message: "Your profile was updated successfully." });
  } catch {
    return res.status(500).json({ message: "Failed to update your profile." });
  }
};
