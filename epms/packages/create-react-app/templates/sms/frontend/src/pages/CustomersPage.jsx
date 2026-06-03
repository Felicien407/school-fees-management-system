import { useEffect, useState } from "react";
import FormCard from "../components/FormCard";
import api from "../services/api";

const empty = { fullName: "", phoneNumber: "", email: "", address: "" };

const validateCustomer = (form) => {
  const errors = {};
  if (!form.fullName.trim()) errors.fullName = "Full name is required.";
  if (!form.phoneNumber.trim()) errors.phoneNumber = "Phone number is required.";
  else if (!/^[0-9+\-\s]{9,15}$/.test(form.phoneNumber.trim())) {
    errors.phoneNumber = "Enter a valid phone number (9–15 digits).";
  }
  if (!form.email.trim()) errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (!form.address.trim()) errors.address = "Address is required.";
  return errors;
};

function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(empty);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formMessage, setFormMessage] = useState("");

  const loadCustomers = () =>
    api.get("/customers", { params: { q: search } }).then((res) => setCustomers(res.data));

  useEffect(() => {
    loadCustomers();
  }, [search]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const inputClass = (key) =>
    `w-full border bg-white p-2.5 text-brand-900 ${fieldErrors[key] ? "border-red-500" : "border-brand-100"}`;

  const submit = async (e) => {
    e.preventDefault();
    setFormMessage("");
    const errors = validateCustomer(form);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    try {
      if (editId) await api.put(`/customers/${editId}`, form);
      else await api.post("/customers", form);
      setFormMessage(editId ? "Customer updated successfully." : "Customer saved successfully.");
      setForm(empty);
      setEditId(null);
      setFieldErrors({});
      loadCustomers();
    } catch (error) {
      setFormMessage(error.response?.data?.message || "Unable to save customer.");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <FormCard title={editId ? "Edit Customer" : "Add Customer"}>
        <form onSubmit={submit} className="space-y-2">
          <input
            placeholder="Full Name"
            value={form.fullName}
            onChange={(e) => setField("fullName", e.target.value)}
            className={inputClass("fullName")}
          />
          {fieldErrors.fullName && <p className="text-sm text-red-600">{fieldErrors.fullName}</p>}
          <input
            placeholder="Phone Number"
            value={form.phoneNumber}
            onChange={(e) => setField("phoneNumber", e.target.value)}
            className={inputClass("phoneNumber")}
          />
          {fieldErrors.phoneNumber && <p className="text-sm text-red-600">{fieldErrors.phoneNumber}</p>}
          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            className={inputClass("email")}
          />
          {fieldErrors.email && <p className="text-sm text-red-600">{fieldErrors.email}</p>}
          <input
            placeholder="Address"
            value={form.address}
            onChange={(e) => setField("address", e.target.value)}
            className={inputClass("address")}
          />
          {fieldErrors.address && <p className="text-sm text-red-600">{fieldErrors.address}</p>}
          {formMessage && <p className="text-sm text-brand-800">{formMessage}</p>}
          <button className="w-full border border-brand-700 bg-brand-800 p-2.5 font-semibold text-white">
            {editId ? "Update Customer" : "Save Customer"}
          </button>
        </form>
      </FormCard>

      <section className="border border-brand-100 bg-white p-5 shadow-sm lg:col-span-2 md:p-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="border-l-4 border-accent-500 pl-3 text-lg font-semibold text-brand-900">
            Customers
          </h2>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer"
            className="border border-brand-100 bg-white p-2 text-sm text-brand-900"
          />
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm text-brand-900">
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
                <tr key={c.customer_id} className="border-t border-brand-100">
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
                        setFieldErrors({});
                      }}
                      className="border border-brand-700 px-2 py-1 text-brand-900"
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
                      className="border border-red-500 bg-red-500 px-2 py-1 text-white"
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
