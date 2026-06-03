import { useEffect, useState } from "react";
import api, { getApiError } from "../api/client.js";
import { PageHeader, Card, CardHeader, Button, Field, Input, DataTable, FormActions, Message } from "../components/ui.jsx";

const emptyForm = { posName: "", requiredQualification: "" };

export default function PositionsPage() {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [rows, setRows] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async (q = searchQuery) => {
    const url = q.trim() ? `/positions/search?q=${encodeURIComponent(q.trim())}` : "/positions";
    const { data } = await api.get(url);
    setRows(Array.isArray(data) ? data : []);
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
    if (!form.posName.trim()) errors.posName = "Position name is required.";
    if (!form.requiredQualification.trim()) errors.requiredQualification = "Qualification is required.";
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setLoading(true);
    try {
      const body = { posName: form.posName.trim(), requiredQualification: form.requiredQualification.trim() };
      if (editingId) {
        await api.put(`/positions/${editingId}`, body);
        setMessage("Position updated.");
      } else {
        await api.post("/positions", body);
        setMessage("Position added.");
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
    setEditingId(row.position_id);
    setForm({ posName: row.pos_name, requiredQualification: row.required_qualification });
    setFieldErrors({});
    setMessage("");
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this position?")) return;
    setError("");
    try {
      await api.delete(`/positions/${id}`);
      setMessage("Position deleted.");
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
      <PageHeader title="Positions" subtitle="Create, read, update, delete and search position records" />

      <Card className="mb-4 p-4">
        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          <Field label="Position name" error={fieldErrors.posName}>
            <Input value={form.posName} onChange={(e) => setForm({ ...form, posName: e.target.value })} error={fieldErrors.posName} />
          </Field>
          <Field label="Required qualification" error={fieldErrors.requiredQualification}>
            <Input value={form.requiredQualification} onChange={(e) => setForm({ ...form, requiredQualification: e.target.value })} error={fieldErrors.requiredQualification} />
          </Field>
          <div className="sm:col-span-2">
            <FormActions>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? "Saving…" : editingId ? "Update position" : "Add position"}
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
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Name or qualification" />
          </Field>
          <Button type="submit" variant="primary">Search</Button>
          <Button type="button" variant="secondary" onClick={() => { setSearchQuery(""); load(""); }}>Clear</Button>
        </form>
      </Card>

      <Card>
        <CardHeader title="Position list" />
        <DataTable
          columns={[
            { key: "id", label: "ID", render: (r) => r.position_id },
            { key: "name", label: "Name", render: (r) => r.pos_name },
            { key: "qual", label: "Qualification", render: (r) => r.required_qualification },
            {
              key: "actions",
              label: "Actions",
              render: (r) => (
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={() => startEdit(r)}>Edit</Button>
                  <Button type="button" variant="secondary" onClick={() => remove(r.position_id)}>Delete</Button>
                </div>
              ),
            },
          ]}
          rows={rows}
          rowKey={(r) => r.position_id}
          emptyMessage="No positions yet."
        />
      </Card>
    </div>
  );
}
