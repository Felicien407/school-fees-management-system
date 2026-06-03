import { useEffect, useState } from "react";
import api, { getApiError } from "../api/client.js";
import { EMPLOYEE_STATUSES, GENDERS } from "../constants/employeeStatuses.js";
import {
  PageHeader, Card, CardHeader, Alert, Button, Field, Input, Select,
  StatusBadge, DataTable, FormActions, Message,
} from "../components/ui.jsx";

const emptyForm = {
  empFirstName: "",
  empLastName: "",
  empGender: "",
  empDateOfBirth: "",
  empEmail: "",
  empTelephone: "",
  empAddress: "",
  empHireDate: "",
  empStatus: "",
  departmentId: "",
  positionId: "",
};

const validateEmployee = (form, departments, positions) => {
  const errors = {};
  if (!form.empFirstName.trim()) errors.empFirstName = "First name is required.";
  if (!form.empLastName.trim()) errors.empLastName = "Last name is required.";
  if (!form.empGender) errors.empGender = "Select gender.";
  if (!form.empDateOfBirth) errors.empDateOfBirth = "Date of birth is required.";
  if (!form.empEmail.trim()) errors.empEmail = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.empEmail.trim())) errors.empEmail = "Enter a valid email.";
  if (!form.empTelephone.trim()) errors.empTelephone = "Telephone is required.";
  if (!form.empAddress.trim()) errors.empAddress = "Address is required.";
  if (!form.empHireDate) errors.empHireDate = "Hire date is required.";
  if (!form.empStatus) errors.empStatus = "Select employment status.";
  if (!form.departmentId) errors.departmentId = "Select a department.";
  else if (!departments.some((d) => String(d.department_id) === String(form.departmentId))) {
    errors.departmentId = "Selected department is not valid.";
  }
  if (!form.positionId) errors.positionId = "Select a position.";
  else if (!positions.some((p) => String(p.position_id) === String(form.positionId))) {
    errors.positionId = "Selected position is not valid.";
  }
  return errors;
};

const rowToForm = (row) => ({
  empFirstName: row.emp_first_name || "",
  empLastName: row.emp_last_name || "",
  empGender: row.emp_gender || "",
  empDateOfBirth: row.emp_date_of_birth ? String(row.emp_date_of_birth).slice(0, 10) : "",
  empEmail: row.emp_email || "",
  empTelephone: row.emp_telephone || "",
  empAddress: row.emp_address || "",
  empHireDate: row.emp_hire_date ? String(row.emp_hire_date).slice(0, 10) : "",
  empStatus: row.emp_status || "",
  departmentId: String(row.department_id || ""),
  positionId: String(row.position_id || ""),
});

export default function EmployeesPage() {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [rows, setRows] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const loadMeta = async () => {
    const [deptRes, posRes] = await Promise.all([api.get("/departments"), api.get("/positions")]);
    setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
    setPositions(Array.isArray(posRes.data) ? posRes.data : []);
  };

  const loadEmployees = async (q = searchQuery) => {
    const url = q.trim() ? `/employees/search?q=${encodeURIComponent(q.trim())}` : "/employees";
    const { data } = await api.get(url);
    setRows(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadMeta().then(() => loadEmployees()).catch((err) => setError(getApiError(err, "Failed to load data.")));
  }, []);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFieldErrors({});
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const errors = validateEmployee(form, departments, positions);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/employees/${editingId}`, form);
        setMessage("Employee updated.");
      } else {
        await api.post("/employees", form);
        setMessage("Employee added.");
      }
      resetForm();
      await loadEmployees();
    } catch (err) {
      setError(getApiError(err, "Save failed."));
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (row) => {
    setEditingId(row.employee_id);
    setForm(rowToForm(row));
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeEmployee = async (id) => {
    if (!window.confirm("Delete this employee?")) return;
    try {
      await api.delete(`/employees/${id}`);
      setMessage("Employee deleted.");
      if (editingId === id) resetForm();
      await loadEmployees();
    } catch (err) {
      setError(getApiError(err, "Delete failed."));
    }
  };

  const runSearch = (e) => {
    e.preventDefault();
    loadEmployees(searchQuery).catch((err) => setError(getApiError(err)));
  };

  const ready = departments.length > 0 && positions.length > 0;
  const fmt = (d) => (d ? String(d).slice(0, 10) : "—");

  const columns = [
    { key: "name", label: "Name", render: (r) => `${r.emp_first_name} ${r.emp_last_name}` },
    { key: "email", label: "Email", render: (r) => r.emp_email },
    { key: "dept", label: "Department", render: (r) => r.depart_name || "—" },
    { key: "pos", label: "Position", render: (r) => r.pos_name || "—" },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.emp_status} /> },
    { key: "hired", label: "Hire Date", render: (r) => fmt(r.emp_hire_date) },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <span className="space-x-2">
          <button type="button" className="text-primary text-sm underline" onClick={() => startEdit(r)}>Edit</button>
          <button type="button" className="text-red-600 text-sm underline" onClick={() => removeEmployee(r.employee_id)}>Delete</button>
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Employees" subtitle="Add, edit, delete and search employee records" />

      {!ready && (
        <Alert type="warning" className="mb-4">
          Add a department and position first.
        </Alert>
      )}

      <Card className="mb-4 p-4">
        <form onSubmit={runSearch} className="flex flex-wrap gap-2 items-end">
          <Field label="Search" className="flex-1 min-w-[200px]">
            <Input
              placeholder="Name, email, department…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Field>
          <Button type="submit" variant="primary">Search</Button>
          <Button type="button" variant="secondary" onClick={() => { setSearchQuery(""); loadEmployees(""); }}>
            Clear
          </Button>
        </form>
      </Card>

      <Card className="mb-4">
        <CardHeader title={editingId ? `Edit employee #${editingId}` : "Add employee"} />
        <form onSubmit={submit} className="p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="First name" error={fieldErrors.empFirstName}>
            <Input value={form.empFirstName} onChange={(e) => setField("empFirstName", e.target.value)} error={fieldErrors.empFirstName} />
          </Field>
          <Field label="Last name" error={fieldErrors.empLastName}>
            <Input value={form.empLastName} onChange={(e) => setField("empLastName", e.target.value)} error={fieldErrors.empLastName} />
          </Field>
          <Field label="Gender" error={fieldErrors.empGender}>
            <Select value={form.empGender} onChange={(e) => setField("empGender", e.target.value)} error={fieldErrors.empGender}>
              <option value="">Select</option>
              {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
            </Select>
          </Field>
          <Field label="Date of birth" error={fieldErrors.empDateOfBirth}>
            <Input type="date" value={form.empDateOfBirth} onChange={(e) => setField("empDateOfBirth", e.target.value)} error={fieldErrors.empDateOfBirth} />
          </Field>
          <Field label="Email" error={fieldErrors.empEmail}>
            <Input type="email" value={form.empEmail} onChange={(e) => setField("empEmail", e.target.value)} error={fieldErrors.empEmail} />
          </Field>
          <Field label="Telephone" error={fieldErrors.empTelephone}>
            <Input value={form.empTelephone} onChange={(e) => setField("empTelephone", e.target.value)} error={fieldErrors.empTelephone} />
          </Field>
          <Field label="Address" error={fieldErrors.empAddress} className="sm:col-span-2 lg:col-span-3">
            <Input value={form.empAddress} onChange={(e) => setField("empAddress", e.target.value)} error={fieldErrors.empAddress} />
          </Field>
          <Field label="Hire date" error={fieldErrors.empHireDate}>
            <Input type="date" value={form.empHireDate} onChange={(e) => setField("empHireDate", e.target.value)} error={fieldErrors.empHireDate} />
          </Field>
          <Field label="Status" error={fieldErrors.empStatus}>
            <Select value={form.empStatus} onChange={(e) => setField("empStatus", e.target.value)} error={fieldErrors.empStatus}>
              <option value="">Select status</option>
              {EMPLOYEE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="Department" error={fieldErrors.departmentId}>
            <Select value={form.departmentId} onChange={(e) => setField("departmentId", e.target.value)} disabled={!departments.length} error={fieldErrors.departmentId}>
              <option value="">Select</option>
              {departments.map((d) => <option key={d.department_id} value={d.department_id}>{d.depart_name}</option>)}
            </Select>
          </Field>
          <Field label="Position" error={fieldErrors.positionId}>
            <Select value={form.positionId} onChange={(e) => setField("positionId", e.target.value)} disabled={!positions.length} error={fieldErrors.positionId}>
              <option value="">Select</option>
              {positions.map((p) => <option key={p.position_id} value={p.position_id}>{p.pos_name}</option>)}
            </Select>
          </Field>
          <div className="sm:col-span-2 lg:col-span-3">
            <FormActions>
              <Button type="submit" variant="primary" disabled={loading || !ready}>
                {loading ? "Saving…" : editingId ? "Update" : "Add employee"}
              </Button>
              {editingId && <Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button>}
              <Message type="success">{message}</Message>
              <Message type="error">{error}</Message>
            </FormActions>
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader title={`Employee list (${rows.length})`} />
        <DataTable columns={columns} rows={rows} rowKey={(r) => r.employee_id} emptyMessage="No employees found." />
      </Card>
    </div>
  );
}
