import { query } from "../config/db.js";

export const getOnLeaveReport = async (_req, res) => {
  try {
    const rows = await query(
      `SELECT d.department_id, d.depart_name, e.employee_id,
              CONCAT(e.emp_first_name, ' ', e.emp_last_name) AS employee_name,
              p.pos_name, e.emp_status
       FROM employees e
       JOIN departments d ON e.department_id = d.department_id
       JOIN positions p ON e.position_id = p.position_id
       WHERE e.emp_status = 'On Leave'
       ORDER BY d.depart_name, e.emp_last_name, e.emp_first_name`
    );

    const byDepartment = new Map();
    for (const row of rows) {
      const key = row.department_id;
      if (!byDepartment.has(key)) {
        byDepartment.set(key, {
          departmentId: row.department_id,
          departmentName: row.depart_name,
          totalOnLeave: 0,
          employees: [],
        });
      }
      const group = byDepartment.get(key);
      group.employees.push({
        employeeId: row.employee_id,
        employeeName: row.employee_name,
        department: row.depart_name,
        position: row.pos_name,
        status: row.emp_status,
      });
      group.totalOnLeave += 1;
    }

    return res.json({
      reportTitle: "Employee Status Report — On Leave",
      filterStatus: "On Leave",
      departments: [...byDepartment.values()],
      grandTotal: rows.length,
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

    const employees = await query(
      `SELECT e.*, d.depart_name, p.pos_name, p.required_qualification
       FROM employees e
       JOIN departments d ON e.department_id = d.department_id
       JOIN positions p ON e.position_id = p.position_id
       WHERE e.emp_hire_date BETWEEN ? AND ?
       ORDER BY e.emp_hire_date, e.emp_last_name`,
      [startDate, endDate]
    );

    const departments = await query(
      `SELECT d.department_id, d.depart_name, COUNT(e.employee_id) AS employee_count
       FROM departments d
       LEFT JOIN employees e ON d.department_id = e.department_id
         AND e.emp_hire_date BETWEEN ? AND ?
       GROUP BY d.department_id
       HAVING employee_count > 0
       ORDER BY d.depart_name`,
      [startDate, endDate]
    );

    const positions = await query(
      `SELECT p.position_id, p.pos_name, p.required_qualification, COUNT(e.employee_id) AS employee_count
       FROM positions p
       LEFT JOIN employees e ON p.position_id = e.position_id
         AND e.emp_hire_date BETWEEN ? AND ?
       GROUP BY p.position_id
       HAVING employee_count > 0
       ORDER BY p.pos_name`,
      [startDate, endDate]
    );

    const users = await query(
      `SELECT u.user_id, u.user_name, u.employee_id, e.emp_first_name, e.emp_last_name, e.emp_hire_date
       FROM users u
       LEFT JOIN employees e ON u.employee_id = e.employee_id
       WHERE e.emp_hire_date BETWEEN ? AND ?
       ORDER BY u.user_id`,
      [startDate, endDate]
    );

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
