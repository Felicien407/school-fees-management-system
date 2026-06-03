import { useState } from "react";
import api, { getApiError } from "../api/client.js";
import {
  PageHeader, Card, CardHeader, Alert, Button, Field, Input,
  Tabs, DataTable, StatusBadge,
} from "../components/ui.jsx";

const today = () => new Date().toISOString().slice(0, 10);

const fmt = (d) => (d ? String(d).slice(0, 10) : "—");

export default function ReportsPage() {
  const [tab, setTab] = useState("date-range");
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState(today());
  const [rangeData, setRangeData] = useState(null);
  const [onLeaveData, setOnLeaveData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadOnLeave = async () => {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.get("/reports/on-leave");
      setOnLeaveData(data);
      setRangeData(null);
    } catch (err) {
      setError(getApiError(err));
      setOnLeaveData(null);
    } finally {
      setLoading(false);
    }
  };

  const loadDateRangeReport = async () => {
    setError("");
    if (!startDate || !endDate) {
      setError("Select start date and end date.");
      return;
    }
    if (startDate > endDate) {
      setError("Start date must be before or equal to end date.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get("/reports", { params: { startDate, endDate } });
      setRangeData(data);
      setOnLeaveData(null);
    } catch (err) {
      setError(getApiError(err));
      setRangeData(null);
    } finally {
      setLoading(false);
    }
  };

  const generate = () => (tab === "on-leave" ? loadOnLeave() : loadDateRangeReport());

  const employees = rangeData?.reports?.employees || [];

  return (
    <div>
      <PageHeader title="Reports" subtitle="On-leave status report and employee reports by date range" />

      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "date-range", label: "Date range report" },
          { id: "on-leave", label: "On leave by department" },
        ]}
      />

      <Card className="mt-4 p-4 space-y-3">
        {tab === "date-range" && (
          <div className="grid gap-3 sm:grid-cols-2 max-w-lg">
            <Field label="Start date">
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </Field>
            <Field label="End date">
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </Field>
          </div>
        )}
        {tab === "on-leave" && (
          <p className="text-sm text-muted">Employees with status &quot;On Leave&quot;, grouped by department.</p>
        )}
        <Button type="button" variant="primary" onClick={generate} disabled={loading}>
          {loading ? "Loading…" : "Generate report"}
        </Button>
      </Card>

      {error && <Alert type="error" className="mt-4">{error}</Alert>}

      {tab === "date-range" && rangeData && (
        <div className="mt-4 space-y-4">
          <p className="text-sm">
            <strong className="text-primary">Period:</strong> {fmt(rangeData.startDate)} to {fmt(rangeData.endDate)}
            {" · "}
            <strong className="text-primary">Employees hired:</strong> {rangeData.totalEmployees}
          </p>

          <Card>
            <CardHeader title="Employees hired in date range" />
            <DataTable
              columns={[
                { key: "name", label: "Name", render: (r) => `${r.emp_first_name} ${r.emp_last_name}` },
                { key: "email", label: "Email", render: (r) => r.emp_email },
                { key: "dept", label: "Department", render: (r) => r.depart_name || "—" },
                { key: "pos", label: "Position", render: (r) => r.pos_name || "—" },
                { key: "status", label: "Status", render: (r) => <StatusBadge status={r.emp_status} /> },
                { key: "hired", label: "Hire date", render: (r) => fmt(r.emp_hire_date) },
              ]}
              rows={employees}
              rowKey={(r) => r.employee_id}
              emptyMessage="No employees hired in this date range."
            />
          </Card>

          {(rangeData.reports?.departments || []).length > 0 && (
            <Card>
              <CardHeader title="By department" />
              <DataTable
                columns={[
                  { key: "name", label: "Department", render: (r) => r.depart_name },
                  { key: "count", label: "Employees hired", render: (r) => r.employee_count },
                ]}
                rows={rangeData.reports.departments}
                rowKey={(r) => r.department_id}
              />
            </Card>
          )}

          {(rangeData.reports?.positions || []).length > 0 && (
            <Card>
              <CardHeader title="By position" />
              <DataTable
                columns={[
                  { key: "name", label: "Position", render: (r) => r.pos_name },
                  { key: "qual", label: "Qualification", render: (r) => r.required_qualification },
                  { key: "count", label: "Employees hired", render: (r) => r.employee_count },
                ]}
                rows={rangeData.reports.positions}
                rowKey={(r) => r.position_id}
              />
            </Card>
          )}
        </div>
      )}

      {tab === "on-leave" && onLeaveData && (
        <div className="mt-4 space-y-4">
          <p className="text-sm">
            <strong className="text-primary">Total on leave:</strong> {onLeaveData.grandTotal}
          </p>
          {(onLeaveData.departments || []).length === 0 ? (
            <Card className="p-6 text-center text-muted">No employees on leave.</Card>
          ) : (
            onLeaveData.departments.map((dept) => (
              <Card key={dept.departmentId}>
                <CardHeader title={dept.departmentName} action={<span className="text-sm text-primary">{dept.totalOnLeave} on leave</span>} />
                <DataTable
                  columns={[
                    { key: "name", label: "Employee", render: (r) => r.employeeName },
                    { key: "dept", label: "Department", render: (r) => r.department },
                    { key: "pos", label: "Position", render: (r) => r.position },
                    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
                  ]}
                  rows={dept.employees}
                  rowKey={(r) => r.employeeId}
                />
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
