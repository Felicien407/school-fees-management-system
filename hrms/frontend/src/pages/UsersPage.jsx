import { useEffect, useState } from "react";
import api, { getApiError } from "../api/client.js";
import { PageHeader, Card, CardHeader, Alert, Button, Field, Input, Select, DataTable, FormActions, Message } from "../components/ui.jsx";

export default function UsersPage() {
  const [form, setForm] = useState({ userName: "", password: "", employeeId: "" });
  const [available, setAvailable] = useState([]);
  const [rows, setRows] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const [usersRes, availRes] = await Promise.all([
      api.get("/users"),
      api.get("/employees/available-for-user"),
    ]);
    setRows(Array.isArray(usersRes.data) ? usersRes.data : []);
    setAvailable(Array.isArray(availRes.data) ? availRes.data : []);
  };

  useEffect(() => {
    load().catch((err) => setError(getApiError(err)));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const errors = {};
    if (!form.userName.trim()) errors.userName = "Username is required.";
    if (!form.password) errors.password = "Password is required.";
    if (!form.employeeId) errors.employeeId = "Select an employee.";
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setLoading(true);
    try {
      await api.post("/users", form);
      setMessage("User account created.");
      setForm({ userName: "", password: "", employeeId: "" });
      setFieldErrors({});
      await load();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="User Accounts" subtitle="One login account per employee" />

      {available.length === 0 && (
        <Alert type="warning" className="mb-4">
          No employees available for new accounts.
        </Alert>
      )}

      <Card className="mb-4 p-4">
        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-3">
          <Field label="Username" error={fieldErrors.userName}>
            <Input value={form.userName} onChange={(e) => setForm({ ...form, userName: e.target.value })} error={fieldErrors.userName} />
          </Field>
          <Field label="Password" error={fieldErrors.password}>
            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={fieldErrors.password} />
          </Field>
          <Field label="Employee" error={fieldErrors.employeeId}>
            <Select value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} disabled={!available.length} error={fieldErrors.employeeId}>
              <option value="">Select</option>
              {available.map((e) => (
                <option key={e.employee_id} value={e.employee_id}>
                  {e.emp_first_name} {e.emp_last_name}
                </option>
              ))}
            </Select>
          </Field>
          <div className="sm:col-span-3">
            <FormActions>
              <Button type="submit" variant="primary" disabled={loading || !available.length}>
                {loading ? "Saving…" : "Create account"}
              </Button>
              <Message type="success">{message}</Message>
              <Message type="error">{error}</Message>
            </FormActions>
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader title="User list" />
        <DataTable
          columns={[
            { key: "user", label: "Username", render: (r) => r.user_name },
            {
              key: "emp",
              label: "Employee",
              render: (r) => r.emp_first_name ? `${r.emp_first_name} ${r.emp_last_name}` : "System admin",
            },
            { key: "email", label: "Email", render: (r) => r.emp_email || "—" },
          ]}
          rows={rows}
          rowKey={(r) => r.user_id}
          emptyMessage="No user accounts."
        />
      </Card>
    </div>
  );
}
