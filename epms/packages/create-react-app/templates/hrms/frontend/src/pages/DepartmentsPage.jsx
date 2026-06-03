import { useEffect, useState } from "react";
import api, { getApiError } from "../api/client.js";
import { PageHeader, Card, CardHeader, Button, Field, Input, DataTable, FormActions, Message } from "../components/ui.jsx";

export default function DepartmentsPage() {
  const [name, setName] = useState("");
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data } = await api.get("/departments");
    setRows(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    load().catch((err) => setError(getApiError(err)));
  }, []);

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
      await api.post("/departments", { departName: name.trim() });
      setMessage("Department added.");
      setName("");
      setFieldError("");
      await load();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Departments" subtitle="Each employee belongs to one department" />

      <Card className="mb-4 p-4">
        <form onSubmit={submit}>
          <Field label="Department name" error={fieldError}>
            <Input value={name} onChange={(e) => { setName(e.target.value); setFieldError(""); }} error={fieldError} />
          </Field>
          <FormActions>
            <Button type="submit" variant="primary" disabled={loading}>{loading ? "Saving…" : "Add department"}</Button>
            <Message type="success">{message}</Message>
            <Message type="error">{error}</Message>
          </FormActions>
        </form>
      </Card>

      <Card>
        <CardHeader title="Department list" />
        <DataTable
          columns={[
            { key: "id", label: "ID", render: (r) => r.department_id },
            { key: "name", label: "Name", render: (r) => r.depart_name },
          ]}
          rows={rows}
          rowKey={(r) => r.department_id}
          emptyMessage="No departments yet."
        />
      </Card>
    </div>
  );
}
