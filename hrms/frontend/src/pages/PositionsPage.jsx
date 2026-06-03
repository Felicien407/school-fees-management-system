import { useEffect, useState } from "react";
import api, { getApiError } from "../api/client.js";
import { PageHeader, Card, CardHeader, Button, Field, Input, DataTable, FormActions, Message } from "../components/ui.jsx";

export default function PositionsPage() {
  const [form, setForm] = useState({ posName: "", requiredQualification: "" });
  const [rows, setRows] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data } = await api.get("/positions");
    setRows(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    load().catch((err) => setError(getApiError(err)));
  }, []);

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
      await api.post("/positions", { posName: form.posName.trim(), requiredQualification: form.requiredQualification.trim() });
      setMessage("Position added.");
      setForm({ posName: "", requiredQualification: "" });
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
      <PageHeader title="Positions" subtitle="Each employee holds one position" />

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
              <Button type="submit" variant="primary" disabled={loading}>{loading ? "Saving…" : "Add position"}</Button>
              <Message type="success">{message}</Message>
              <Message type="error">{error}</Message>
            </FormActions>
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader title="Position list" />
        <DataTable
          columns={[
            { key: "id", label: "ID", render: (r) => r.position_id },
            { key: "name", label: "Name", render: (r) => r.pos_name },
            { key: "qual", label: "Qualification", render: (r) => r.required_qualification },
          ]}
          rows={rows}
          rowKey={(r) => r.position_id}
          emptyMessage="No positions yet."
        />
      </Card>
    </div>
  );
}
