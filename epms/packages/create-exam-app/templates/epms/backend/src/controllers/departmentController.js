const Department = require("../models/Department");
const DEPARTMENT_CODE_REGEX = /^[A-Z0-9]{2,10}$/;

const starterDepartments = [
  { departmentCode: "CW", departmentName: "Carwash", grossSalary: 300000, totalDeduction: 20000 },
  { departmentCode: "ST", departmentName: "Stock", grossSalary: 200000, totalDeduction: 5000 },
  { departmentCode: "MC", departmentName: "Mechanic", grossSalary: 450000, totalDeduction: 40000 },
  { departmentCode: "ADMS", departmentName: "Administration Staff", grossSalary: 600000, totalDeduction: 70000 },
];

const createDepartment = async (req, res) => {
  try {
    const departmentCode = String(req.body.departmentCode || "").trim().toUpperCase();
    const departmentName = String(req.body.departmentName || "").trim();
    const grossSalary = Number(req.body.grossSalary);
    const totalDeduction = Number(req.body.totalDeduction);
    if (!departmentCode || !departmentName || grossSalary === undefined || totalDeduction === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!DEPARTMENT_CODE_REGEX.test(departmentCode)) {
      return res
        .status(400)
        .json({ message: "Department code must be 2-10 uppercase letters or numbers" });
    }
    if (departmentName.length < 2) {
      return res.status(400).json({ message: "Department name must be at least 2 characters" });
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

    const existing = await Department.findOne({ departmentCode });
    if (existing) {
      return res.status(409).json({ message: "Department code already exists" });
    }

    const department = await Department.create({
      departmentCode,
      departmentName,
      grossSalary,
      totalDeduction,
    });

    return res.status(201).json(department);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const listDepartments = async (_req, res) => {
  try {
    const departments = await Department.find().sort({ departmentName: 1 });
    return res.json(departments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const seedDepartments = async (_req, res) => {
  try {
    for (const item of starterDepartments) {
      await Department.updateOne(
        { departmentCode: item.departmentCode },
        { $setOnInsert: item },
        { upsert: true }
      );
    }
    return res.json({ message: "Starter departments ensured" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createDepartment,
  listDepartments,
  seedDepartments,
};
