const Salary = require("../models/Salary");
const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

const monthlyPayroll = async (req, res) => {
  try {
    const month = String(req.query.month || "").trim();
    if (month && !MONTH_REGEX.test(month)) {
      return res.status(400).json({ message: "Month must use YYYY-MM format" });
    }
    const filter = month ? { month } : {};

    const records = await Salary.find(filter)
      .populate("employee", "firstName lastName position")
      .populate("department", "departmentName")
      .sort({ month: -1, createdAt: -1 });

    const payroll = records.map((item) => ({
      id: item._id,
      month: item.month,
      firstName: item.employee?.firstName || "",
      lastName: item.employee?.lastName || "",
      position: item.employee?.position || "",
      department: item.department?.departmentName || "",
      netSalary: item.netSalary,
    }));

    return res.json(payroll);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  monthlyPayroll,
};
