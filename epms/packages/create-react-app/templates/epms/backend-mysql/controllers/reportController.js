import { query } from "../config/db.js";

export const getReports = async (req, res) => {
  try {
    const period = req.query.period || "daily";
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const month = req.query.month || date.slice(0, 7);

    let employees;
    let salaries;

    if (period === "daily") {
      employees = await query("SELECT * FROM employees WHERE DATE(hired_date) = ?", [date]);
      salaries = await query("SELECT * FROM salaries WHERE month_of_payment = ?", [month]);
    } else if (period === "weekly") {
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required for weekly reports." });
      }
      employees = await query("SELECT * FROM employees WHERE hired_date BETWEEN ? AND ?", [startDate, endDate]);
      const startMonth = startDate.slice(0, 7);
      const endMonth = endDate.slice(0, 7);
      salaries = await query(
        "SELECT * FROM salaries WHERE month_of_payment >= ? AND month_of_payment <= ?",
        [startMonth, endMonth]
      );
    } else {
      employees = await query(
        "SELECT * FROM employees WHERE DATE_FORMAT(hired_date, '%Y-%m') = ?",
        [month]
      );
      salaries = await query("SELECT * FROM salaries WHERE month_of_payment = ?", [month]);
    }

    const departments = await query("SELECT * FROM departments");
    return res.json({ period, reports: { employees, departments, salaries } });
  } catch {
    return res.status(500).json({ message: "Failed to generate reports." });
  }
};
