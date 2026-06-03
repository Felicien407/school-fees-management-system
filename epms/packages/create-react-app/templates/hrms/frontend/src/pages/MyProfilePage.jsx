import { useEffect, useState } from "react";
import api, { getApiError } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { PageHeader, Card, Button, Field, Input, StatusBadge, Alert, Message } from "../components/ui.jsx";

const fmt = (d) => (d ? String(d).slice(0, 10) : "—");

export default function MyProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ empTelephone: "", empAddress: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.get("/employees/me");
      setProfile(data);
      setForm({ empTelephone: data.emp_telephone || "", empAddress: data.emp_address || "" });
    } catch (err) {
      setError(getApiError(err, "Failed to load your profile."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    try {
      await api.put("/employees/me", form);
      setMessage("Your profile was updated.");
      await load();
    } catch (err) {
      setError(getApiError(err, "Update failed."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-muted text-sm">Loading your profile…</p>;

  return (
    <div>
      <PageHeader
        title="My Profile"
        subtitle={`Logged in as ${user?.username} — employee account`}
      />

      {error && !profile && <Alert type="error" className="mb-4">{error}</Alert>}

      {profile && (
        <>
          <Card className="mb-4 p-4">
            <h3 className="font-semibold text-primary mb-3">Your details (read-only)</h3>
            <dl className="grid gap-2 sm:grid-cols-2 text-sm">
              <div><dt className="text-muted">Name</dt><dd>{profile.emp_first_name} {profile.emp_last_name}</dd></div>
              <div><dt className="text-muted">Email</dt><dd>{profile.emp_email}</dd></div>
              <div><dt className="text-muted">Gender</dt><dd>{profile.emp_gender}</dd></div>
              <div><dt className="text-muted">Date of birth</dt><dd>{fmt(profile.emp_date_of_birth)}</dd></div>
              <div><dt className="text-muted">Department</dt><dd>{profile.depart_name || "—"}</dd></div>
              <div><dt className="text-muted">Position</dt><dd>{profile.pos_name || "—"}</dd></div>
              <div><dt className="text-muted">Hire date</dt><dd>{fmt(profile.emp_hire_date)}</dd></div>
              <div><dt className="text-muted">Status</dt><dd><StatusBadge status={profile.emp_status} /></dd></div>
            </dl>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold text-primary mb-3">Update contact info</h3>
            <form onSubmit={save} className="grid gap-3 sm:grid-cols-2 max-w-xl">
              <Field label="Telephone">
                <Input value={form.empTelephone} onChange={(e) => setForm({ ...form, empTelephone: e.target.value })} />
              </Field>
              <Field label="Address" className="sm:col-span-2">
                <Input value={form.empAddress} onChange={(e) => setForm({ ...form, empAddress: e.target.value })} />
              </Field>
              <div className="sm:col-span-2 flex flex-wrap gap-2 items-center">
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </Button>
                <Message type="success">{message}</Message>
                <Message type="error">{error}</Message>
              </div>
            </form>
          </Card>
        </>
      )}
    </div>
  );
}
