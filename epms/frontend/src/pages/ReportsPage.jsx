import { useState } from "react";
import { getMonthlyPayrollReport } from "../api/reportApi";

function ReportsPage() {
  const [month, setMonth] = useState("");
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState("");

  const loadReport = async () => {
    setMessage("");
    const monthValue = month.trim();
    if (monthValue && !/^\d{4}-(0[1-9]|1[0-2])$/.test(monthValue)) {
      setMessage("Month must use YYYY-MM format");
      return;
    }
    try {
      const response = await getMonthlyPayrollReport(monthValue);
      setRows(response.data);
      if (!response.data.length) {
        setMessage("No payroll found for this month");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to generate report");
    }
  };

  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <h2 className="mb-3 text-lg font-semibold text-blue-900">Monthly Employee Payroll Report</h2>
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          type="month"
          className="rounded-md border px-3 py-2"
          value={month}
          onChange={(event) => setMonth(event.target.value)}
        />
        <button
          type="button"
          onClick={loadReport}
          className="rounded-md bg-blue-700 px-4 py-2 text-white hover:bg-blue-800"
        >
          Generate Report
        </button>
      </div>

      {message && <p className="mb-3 text-sm text-slate-600">{message}</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-100">
              <th className="p-2 text-left">Month</th>
              <th className="p-2 text-left">First Name</th>
              <th className="p-2 text-left">Last Name</th>
              <th className="p-2 text-left">Position</th>
              <th className="p-2 text-left">Department</th>
              <th className="p-2 text-right">Net Salary</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="p-2">{item.month}</td>
                <td className="p-2">{item.firstName}</td>
                <td className="p-2">{item.lastName}</td>
                <td className="p-2">{item.position}</td>
                <td className="p-2">{item.department}</td>
                <td className="p-2 text-right">{item.netSalary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReportsPage;
