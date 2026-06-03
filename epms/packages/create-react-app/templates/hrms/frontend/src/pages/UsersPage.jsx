import { useEffect, useState } from "react";
import api, { getApiError } from "../api/client.js";
import { PageHeader, Card, CardHeader, Alert, Button, Field, Input, Select, DataTable, FormActions, Message } from "../components/ui.jsx";

const emptyForm = { userName: "", password: "", employeeId: "" };

export default function UsersPage() {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [available, setAvailable] = useState([]);
  const [rows, setRows] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async (q = searchQuery) => {
    const [usersRes, availRes] = await Promise.all([
      api.get(q.trim() ? `/users/search?q=${encodeURIComponent(q.trim())}` : "/users"),
      api.get("/employees/available-for-user"),
    ]);
    setRows(Array.isArray(usersRes.data) ? usersRes.data : []);
    setAvailable(Array.isArray(availRes.data) ? availRes.data : []);
  };

  useEffect(() => {
    load().catch((err) => setError(getApiError(err)));
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFieldErrors({});
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const errors = {};
    if (!form.userName.trim()) errors.userName = "Username is required.";
    if (!editingId && !form.password) errors.password = "Password is required.";
    if (!editingId && !form.employeeId) errors.employeeId = "Select an employee.";
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setLoading(true);
    try {
      if (editingId) {
        const body = { userName: form.userName.trim() };
        if (form.password) body.password = form.password;
        await api.put(`/users/${editingId}`, body);
        setMessage("User account updated.");
      } else {
        await api.post("/users", form);
        setMessage("User account created.");
      }
      resetForm();
      await load();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (row) => {
    setEditingId(row.user_id);
    setForm({ userName: row.user_name, password: "", employeeId: "" });
    setFieldErrors({});
    setMessage("");
  };

  const remove = async (row) => {
    if (!row.employee_id) {
      setError("Cannot delete the system administrator account.");
      return;
    }
    if (!window.confirm(`Delete user "${row.user_name}"?`)) return;
    setError("");
    try {
      await api.delete(`/users/${row.user_id}`);
      setMessage("User account deleted.");
      if (editingId === row.user_id) resetForm();
      await load();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const runSearch = (e) => {
    e.preventDefault();
    load(searchQuery).catch((err) => setError(getApiError(err)));
  };

  return (
    <div>
      <PageHeader title="User Accounts" subtitle="Create, read, update, delete and search user records (linked to employees)" />

      {!editingId && available.length === 0 && (
        <Alert type="warning" className="mb-4">
          No employees available for new accounts.
        </Alert>
      )}

      <Card className="mb-4 p-4">
        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-3">
          <Field label="Username" error={fieldErrors.userName}>
            <Input value={form.userName} onChange={(e) => setForm({ ...form, userName: e.target.value })} error={fieldErrors.userName} />
          </Field>
          <Field label={editingId ? "New password (optional)" : "Password"} error={fieldErrors.password}>
            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={fieldErrors.password} />
          </Field>
          {!editingId && (
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
          )}
          <div className="sm:col-span-3">
            <FormActions>
              <Button type="submit" variant="primary" disabled={loading || (!editingId && !available.length)}>
                {loading ? "Saving…" : editingId ? "Update account" : "Create account"}
              </Button>
              {editingId && <Button type="button" variant="secondary" onClick={resetForm}>Cancel edit</Button>}
              <Message type="success">{message}</Message>
              <Message type="error">{error}</Message>
            </FormActions>
          </div>
        </form>
      </Card>

      <Card className="mb-4 p-4">
        <form onSubmit={runSearch} className="flex flex-wrap gap-2 items-end">
          <Field label="Search" className="flex-1 min-w-[200px]">
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Username or employee name" />
          </Field>
          <Button type="submit" variant="primary">Search</Button>
          <Button type="button" variant="secondary" onClick={() => { setSearchQuery(""); load(""); }}>Clear</Button>
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
            {
              key: "actions",
              label: "Actions",
              render: (r) => (
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={() => startEdit(r)}>Edit</Button>
                  {r.employee_id && (
                    <Button type="button" variant="secondary" onClick={() => remove(r)}>Delete</Button>
                  )}
                </div>
              ),
            },
          ]}
          rows={rows}
          rowKey={(r) => r.user_id}
          emptyMessage="No user accounts."
        />
      </Card>
    </div>
  );
}
