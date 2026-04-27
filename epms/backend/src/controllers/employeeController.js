const Employee = require("../models/Employee");
const Department = require("../models/Department");

const NAME_REGEX = /^[A-Za-z ]{2,50}$/;
const PHONE_REGEX = /^[0-9+\- ]{7,20}$/;

const createEmployee = async (req, res) => {
  try {
    const {
      employeeNumber,
      firstName,
      lastName,
      position,
      address,
      telephone,
      gender,
      hiredDate,
      departmentId,
    } = req.body;

    if (
      !employeeNumber ||
      !firstName ||
      !lastName ||
      !position ||
      !address ||
      !telephone ||
      !gender ||
      !hiredDate ||
      !departmentId
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!NAME_REGEX.test(firstName) || !NAME_REGEX.test(lastName)) {
      return res
        .status(400)
        .json({ message: "First name and last name should contain only letters (2-50 chars)" });
    }
    if (!PHONE_REGEX.test(telephone)) {
      return res.status(400).json({ message: "Telephone should contain valid digits (7-20 chars)" });
    }
    if (!["Male", "Female", "Other"].includes(gender)) {
      return res.status(400).json({ message: "Invalid gender value" });
    }
    if (Number.isNaN(new Date(hiredDate).getTime())) {
      return res.status(400).json({ message: "Invalid hired date" });
    }
    if (new Date(hiredDate) > new Date()) {
      return res.status(400).json({ message: "Hired date cannot be in the future" });
    }

    const existing = await Employee.findOne({ employeeNumber });
    if (existing) {
      return res.status(409).json({ message: "Employee number already exists" });
    }

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const employee = await Employee.create({
      employeeNumber,
      firstName,
      lastName,
      position,
      address,
      telephone,
      gender,
      hiredDate,
      department: departmentId,
    });

    return res.status(201).json(employee);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const listEmployees = async (_req, res) => {
  try {
    const employees = await Employee.find()
      .populate("department", "departmentCode departmentName")
      .sort({ createdAt: -1 });
    return res.json(employees);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEmployee,
  listEmployees,
};
