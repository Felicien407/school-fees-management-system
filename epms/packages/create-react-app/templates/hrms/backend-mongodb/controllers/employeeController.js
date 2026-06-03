import Employee from "../models/Employee.js";
import Department from "../models/Department.js";
import Position from "../models/Position.js";
import User from "../models/User.js";
import { nextId } from "../utils/ids.js";
import { EMPLOYEE_STATUSES } from "../constants/employeeStatuses.js";

const ALLOWED_GENDERS = ["Male", "Female"];
const ALLOWED_STATUSES = EMPLOYEE_STATUSES;
const strip = (doc) => { const { _id, __v, ...rest } = doc; return rest; };

const enrich = async (employees) => {
  const deptMap = Object.fromEntries((await Department.find().lean()).map((d) => [d.department_id, d.depart_name]));
  const posMap = Object.fromEntries((await Position.find().lean()).map((p) => [p.position_id, p]));
  return employees.map((e) => ({
    ...strip(e),
    depart_name: deptMap[e.department_id] || "",
    pos_name: posMap[e.position_id]?.pos_name || "",
    required_qualification: posMap[e.position_id]?.required_qualification || "",
  }));
};

const validateBody = async (b, employeeId = null) => {
  if (!b.empFirstName) return "First name is required.";
  if (!b.empLastName) return "Last name is required.";
  if (!b.empGender || !ALLOWED_GENDERS.includes(b.empGender)) return "Select a valid gender (Male or Female).";
  if (!b.empDateOfBirth) return "Date of birth is required.";
  if (!b.empEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(b.empEmail).trim())) return "Enter a valid email address.";
  if (!b.empTelephone) return "Telephone is required.";
  if (!b.empAddress) return "Address is required.";
  if (!b.empHireDate) return "Hire date is required.";
  const status = b.empStatus || "Active";
  if (!ALLOWED_STATUSES.includes(status)) return "Select a valid employment status.";
  if (!b.departmentId) return "Select a department from the list.";
  if (!b.positionId) return "Select a position from the list.";
  if (!(await Department.findOne({ department_id: Number(b.departmentId) }))) return "Selected department does not exist.";
  if (!(await Position.findOne({ position_id: Number(b.positionId) }))) return "Selected position does not exist.";
  if (employeeId && !(await Employee.findOne({ employee_id: Number(employeeId) }))) return "Employee not found.";
  return null;
};

export const create = async (req, res) => {
  try {
    const err = await validateBody(req.body);
    if (err) return res.status(400).json({ message: err });
    const b = req.body;
    const employee_id = await nextId("employee_id");
    await Employee.create({
      employee_id,
      emp_first_name: b.empFirstName.trim(),
      emp_last_name: b.empLastName.trim(),
      emp_gender: b.empGender,
      emp_date_of_birth: b.empDateOfBirth,
      emp_email: b.empEmail.trim().toLowerCase(),
      emp_telephone: b.empTelephone.trim(),
      emp_address: b.empAddress.trim(),
      emp_hire_date: b.empHireDate,
      emp_status: b.empStatus || "Active",
      department_id: Number(b.departmentId),
      position_id: Number(b.positionId),
    });
    return res.status(201).json({ message: "Employee added successfully." });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "Employee email already exists." });
    return res.status(500).json({ message: "Failed to add employee." });
  }
};

export const getAll = async (_req, res) => {
  try {
    const employees = await Employee.find().sort({ employee_id: -1 }).lean();
    return res.json(await enrich(employees));
  } catch {
    return res.status(500).json({ message: "Failed to fetch employee records." });
  }
};

export const getById = async (req, res) => {
  try {
    const emp = await Employee.findOne({ employee_id: Number(req.params.id) }).lean();
    if (!emp) return res.status(404).json({ message: "Employee not found." });
    const [enriched] = await enrich([emp]);
    return res.json(enriched);
  } catch {
    return res.status(500).json({ message: "Failed to fetch employee." });
  }
};

export const search = async (req, res) => {
  try {
    const q = (req.query.q || "").trim().toLowerCase();
    if (!q) return getAll(req, res);
    const employees = await Employee.find().lean();
    const enriched = await enrich(employees);
    const filtered = enriched.filter(
      (e) =>
        `${e.emp_first_name} ${e.emp_last_name}`.toLowerCase().includes(q) ||
        (e.emp_email || "").toLowerCase().includes(q) ||
        (e.depart_name || "").toLowerCase().includes(q) ||
        (e.pos_name || "").toLowerCase().includes(q) ||
        (e.emp_status || "").toLowerCase().includes(q)
    );
    return res.json(filtered);
  } catch {
    return res.status(500).json({ message: "Failed to search employees." });
  }
};

export const update = async (req, res) => {
  try {
    const err = await validateBody(req.body, req.params.id);
    if (err) return res.status(400).json({ message: err });
    const b = req.body;
    const updated = await Employee.findOneAndUpdate(
      { employee_id: Number(req.params.id) },
      {
        emp_first_name: b.empFirstName.trim(),
        emp_last_name: b.empLastName.trim(),
        emp_gender: b.empGender,
        emp_date_of_birth: b.empDateOfBirth,
        emp_email: b.empEmail.trim().toLowerCase(),
        emp_telephone: b.empTelephone.trim(),
        emp_address: b.empAddress.trim(),
        emp_hire_date: b.empHireDate,
        emp_status: b.empStatus || "Active",
        department_id: Number(b.departmentId),
        position_id: Number(b.positionId),
      },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Employee not found." });
    return res.json({ message: "Employee updated successfully." });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "Employee email already exists." });
    return res.status(500).json({ message: "Failed to update employee." });
  }
};

export const remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const linked = await User.findOne({ employee_id: id });
    if (linked) return res.status(400).json({ message: "Cannot delete employee linked to a user account. Remove the user first." });
    const deleted = await Employee.findOneAndDelete({ employee_id: id });
    if (!deleted) return res.status(404).json({ message: "Employee not found." });
    return res.json({ message: "Employee deleted successfully." });
  } catch {
    return res.status(500).json({ message: "Failed to delete employee." });
  }
};

export const getAvailableForUser = async (_req, res) => {
  try {
    const linked = new Set((await User.find({ employee_id: { $ne: null } }).lean()).map((u) => u.employee_id));
    return res.json(
      (await Employee.find().sort({ emp_last_name: 1, emp_first_name: 1 }).lean())
        .filter((e) => !linked.has(e.employee_id))
        .map(strip)
    );
  } catch {
    return res.status(500).json({ message: "Failed to fetch available employees." });
  }
};
