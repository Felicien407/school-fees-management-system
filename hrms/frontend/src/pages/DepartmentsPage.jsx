import { useEffect, useState } from "react";
import api, { getApiError } from "../api/client.js";
import { PageHeader, Card, CardHeader, Button, Field, Input, DataTable, FormActions, Message } from "../components/ui.jsx";

export default function DepartmentsPage() {
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async (q = searchQuery) => {
    const url = q.trim() ? `/departments/search?q=${encodeURIComponent(q.trim())}` : "/departments";
    const { data } = await api.get(url);
    setRows(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    load().catch((err) => setError(getApiError(err)));
  }, []);

  const resetForm = () => {
    setName("");
    setEditingId(null);
    setFieldError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!name.trim()) {
      setFieldError("Department name is required.");
      return;
    }
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/departments/${editingId}`, { departName: name.trim() });
        setMessage("Department updated.");
      } else {
        await api.post("/departments", { departName: name.trim() });
        setMessage("Department added.");
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
    setEditingId(row.department_id);
    setName(row.depart_name);
    setFieldError("");
    setMessage("");
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this department?")) return;
    setError("");
    try {
      await api.delete(`/departments/${id}`);
      setMessage("Department deleted.");
      if (editingId === id) resetForm();
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
      <PageHeader title="Departments" subtitle="Create, read, update, delete and search department records" />

      <Card className="mb-4 p-4">
        <form onSubmit={submit}>
          <Field label="Department name" error={fieldError}>
            <Input value={name} onChange={(e) => { setName(e.target.value); setFieldError(""); }} error={fieldError} />
          </Field>
          <FormActions>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Saving…" : editingId ? "Update department" : "Add department"}
            </Button>
            {editingId && (
              <Button type="button" variant="secondary" onClick={resetForm}>Cancel edit</Button>
            )}
            <Message type="success">{message}</Message>
            <Message type="error">{error}</Message>
          </FormActions>
        </form>
      </Card>

      <Card className="mb-4 p-4">
        <form onSubmit={runSearch} className="flex flex-wrap gap-2 items-end">
          <Field label="Search" className="flex-1 min-w-[200px]">
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Department name" />
          </Field>
          <Button type="submit" variant="primary">Search</Button>
          <Button type="button" variant="secondary" onClick={() => { setSearchQuery(""); load(""); }}>Clear</Button>
        </form>
      </Card>

      <Card>
        <CardHeader title="Department list" />
        <DataTable
          columns={[
            { key: "id", label: "ID", render: (r) => r.department_id },
            { key: "name", label: "Name", render: (r) => r.depart_name },
            {
              key: "actions",
              label: "Actions",
              render: (r) => (
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={() => startEdit(r)}>Edit</Button>
                  <Button type="button" variant="secondary" onClick={() => remove(r.department_id)}>Delete</Button>
                </div>
              ),
            },
          ]}
          rows={rows}
          rowKey={(r) => r.department_id}
          emptyMessage="No departments yet."
        />
      </Card>
    </div>
  );
}
