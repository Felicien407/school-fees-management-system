import { useEffect, useState } from "react";
import FormCard from "../components/FormCard";
import api from "../services/api";

const empty = { fullName: "", phoneNumber: "", email: "", address: "" };

function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(empty);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);

  const loadCustomers = () =>
    api.get("/customers", { params: { q: search } }).then((res) => setCustomers(res.data));

  useEffect(() => {
    loadCustomers();
  }, [search]);

  const submit = async (e) => {
    e.preventDefault();
    if (editId) await api.put(`/customers/${editId}`, form);
    else await api.post("/customers", form);
    setForm(empty);
    setEditId(null);
    loadCustomers();
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <FormCard title={editId ? "Edit Customer" : "Add Customer"}>
        <form onSubmit={submit} className="space-y-2">
          {Object.keys(empty).map((key) => (
            <input
              key={key}
              placeholder={key}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="w-full rounded border border-brand-600 bg-brand-900 p-2 text-white"
            />
          ))}
          <button className="w-full rounded bg-white p-2 font-semibold text-brand-900">
            {editId ? "Update Customer" : "Save Customer"}
          </button>
        </form>
      </FormCard>

      <section className="rounded-lg border border-brand-700 bg-brand-800 p-4 lg:col-span-2">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Customers</h2>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer"
            className="rounded border border-brand-600 bg-brand-900 p-2 text-sm"
          />
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.customer_id} className="border-t border-brand-700">
                  <td>{c.full_name}</td>
                  <td>{c.phone_number}</td>
                  <td>{c.email}</td>
                  <td>{c.address}</td>
                  <td className="space-x-2 py-2">
                    <button
                      onClick={() => {
                        setEditId(c.customer_id);
                        setForm({
                          fullName: c.full_name,
                          phoneNumber: c.phone_number,
                          email: c.email,
                          address: c.address,
                        });
                      }}
                      className="rounded bg-white px-2 py-1 text-brand-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await api.delete(`/customers/${c.customer_id}`);
                          loadCustomers();
                        } catch (error) {
                          alert(error.response?.data?.message || "Delete failed.");
                        }
                      }}
                      className="rounded bg-red-500 px-2 py-1"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default CustomersPage;
