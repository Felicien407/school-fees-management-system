const Salary = require("../models/Salary");
const Employee = require("../models/Employee");
const Department = require("../models/Department");

const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

const createSalary = async (req, res) => {
  try {
    const { employeeId, departmentId } = req.body;
    const month = String(req.body.month || "").trim();
    const grossSalary = Number(req.body.grossSalary);
    const totalDeduction = Number(req.body.totalDeduction);
    if (!employeeId || !departmentId || grossSalary === undefined || totalDeduction === undefined || !month) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!MONTH_REGEX.test(month)) {
      return res.status(400).json({ message: "Month must use YYYY-MM format" });
    }
    if (Number.isNaN(grossSalary) || grossSalary < 0) {
      return res.status(400).json({ message: "Gross salary must be a positive number" });
    }
    if (Number.isNaN(totalDeduction) || totalDeduction < 0) {
      return res.status(400).json({ message: "Total deduction must be a positive number" });
    }
    if (totalDeduction > grossSalary) {
      return res.status(400).json({ message: "Total deduction cannot exceed gross salary" });
    }

    const employee = await Employee.findById(employeeId);
    const department = await Department.findById(departmentId);
    if (!employee || !department) {
      return res.status(404).json({ message: "Employee or Department not found" });
    }

    const netSalary = Number(grossSalary) - Number(totalDeduction);

    const salary = await Salary.create({
      employee: employeeId,
      department: departmentId,
      grossSalary,
      totalDeduction,
      netSalary,
      month,
    });

    return res.status(201).json(salary);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const listSalaries = async (_req, res) => {
  try {
    const salaries = await Salary.find()
      .populate("employee", "firstName lastName position")
      .populate("department", "departmentName departmentCode")
      .sort({ createdAt: -1 });
    return res.json(salaries);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateSalary = async (req, res) => {
  try {
    const month = String(req.body.month || "").trim();
    const grossSalary = Number(req.body.grossSalary);
    const totalDeduction = Number(req.body.totalDeduction);
    if (!month || Number.isNaN(grossSalary) || Number.isNaN(totalDeduction)) {
      return res.status(400).json({ message: "Gross salary, total deduction and month are required" });
    }
    if (!MONTH_REGEX.test(month)) {
      return res.status(400).json({ message: "Month must use YYYY-MM format" });
    }
    if (grossSalary < 0 || totalDeduction < 0) {
      return res.status(400).json({ message: "Salary values cannot be negative" });
    }
    if (totalDeduction > grossSalary) {
      return res.status(400).json({ message: "Total deduction cannot exceed gross salary" });
    }
    const netSalary = Number(grossSalary) - Number(totalDeduction);

    const updated = await Salary.findByIdAndUpdate(
      req.params.id,
      { grossSalary, totalDeduction, netSalary, month },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Salary record not found" });
    }

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteSalary = async (req, res) => {
  try {
    const deleted = await Salary.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Salary record not found" });
    }
    return res.json({ message: "Salary deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createSalary,
  listSalaries,
  updateSalary,
  deleteSalary,
};
