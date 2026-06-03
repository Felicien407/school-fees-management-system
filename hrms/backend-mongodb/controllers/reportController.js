import Employee from "../models/Employee.js";
import Department from "../models/Department.js";
import Position from "../models/Position.js";
import User from "../models/User.js";

const strip = (doc) => { const { _id, __v, password, ...rest } = doc; return rest; };

const inRange = (dateVal, start, end) => {
  const d = new Date(dateVal).toISOString().slice(0, 10);
  return d >= start && d <= end;
};

export const getOnLeaveReport = async (_req, res) => {
  try {
    const onLeave = await Employee.find({ emp_status: "On Leave" }).lean();
    const departments = await Department.find().lean();
    const positions = await Position.find().lean();
    const deptMap = Object.fromEntries(departments.map((d) => [d.department_id, d]));
    const posMap = Object.fromEntries(positions.map((p) => [p.position_id, p]));

    const byDepartment = new Map();
    for (const e of onLeave) {
      const dept = deptMap[e.department_id];
      const key = e.department_id;
      if (!byDepartment.has(key)) {
        byDepartment.set(key, {
          departmentId: key,
          departmentName: dept?.depart_name || "Unknown",
          totalOnLeave: 0,
          employees: [],
        });
      }
      const group = byDepartment.get(key);
      group.employees.push({
        employeeId: e.employee_id,
        employeeName: `${e.emp_first_name} ${e.emp_last_name}`,
        department: dept?.depart_name || "Unknown",
        position: posMap[e.position_id]?.pos_name || "—",
        status: e.emp_status,
      });
      group.totalOnLeave += 1;
    }

    return res.json({
      reportTitle: "Employee Status Report — On Leave",
      filterStatus: "On Leave",
      departments: [...byDepartment.values()],
      grandTotal: onLeave.length,
    });
  } catch {
    return res.status(500).json({ message: "Failed to generate on-leave report." });
  }
};

export const getReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start date and end date are required." });
    }
    if (startDate > endDate) {
      return res.status(400).json({ message: "Start date must be before or equal to end date." });
    }

    const allEmployees = await Employee.find().lean();
    const inRangeEmployees = allEmployees.filter((e) => inRange(e.emp_hire_date, startDate, endDate));
    const deptMap = Object.fromEntries((await Department.find().lean()).map((d) => [d.department_id, d.depart_name]));
    const posMap = Object.fromEntries((await Position.find().lean()).map((p) => [p.position_id, p]));

    const employees = inRangeEmployees.map((e) => ({
      ...strip(e),
      depart_name: deptMap[e.department_id] || "",
      pos_name: posMap[e.position_id]?.pos_name || "",
      required_qualification: posMap[e.position_id]?.required_qualification || "",
    }));

    const departments = (await Department.find().lean())
      .map((d) => ({
        ...strip(d),
        employee_count: inRangeEmployees.filter((e) => e.department_id === d.department_id).length,
      }))
      .filter((d) => d.employee_count > 0);

    const positions = (await Position.find().lean())
      .map((p) => ({
        ...strip(p),
        employee_count: inRangeEmployees.filter((e) => e.position_id === p.position_id).length,
      }))
      .filter((p) => p.employee_count > 0);

    const empMap = Object.fromEntries(allEmployees.map((e) => [e.employee_id, e]));
    const users = (await User.find().lean())
      .map((u) => {
        const row = strip(u);
        const emp = empMap[u.employee_id];
        if (emp) {
          row.emp_first_name = emp.emp_first_name;
          row.emp_last_name = emp.emp_last_name;
          row.emp_hire_date = emp.emp_hire_date;
        }
        return row;
      })
      .filter((u) => u.emp_hire_date && inRange(u.emp_hire_date, startDate, endDate));

    return res.json({
      startDate,
      endDate,
      totalEmployees: employees.length,
      reports: { employees, departments, positions, users },
    });
  } catch {
    return res.status(500).json({ message: "Failed to generate reports." });
  }
};
