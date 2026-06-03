import { useEffect, useState } from "react";
import FormCard from "../components/FormCard";
import api from "../services/api";

const validateSale = (form, products) => {
  const errors = {};
  if (!form.customerId) errors.customerId = "Please select a customer.";
  if (!form.productId) errors.productId = "Please select a product.";
  if (!form.quantity || Number(form.quantity) <= 0) {
    errors.quantity = "Quantity must be greater than 0.";
  }
  const selectedProduct = products.find((p) => p.product_id === Number(form.productId));
  if (selectedProduct && Number(form.quantity) > Number(selectedProduct.quantity)) {
    errors.quantity = "Quantity exceeds available stock.";
  }
  return errors;
};

function SalesPage() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [form, setForm] = useState({ customerId: "", productId: "", quantity: 1 });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formMessage, setFormMessage] = useState("");

  const load = async () => {
    const [c, p, s] = await Promise.all([
      api.get("/customers"),
      api.get("/products"),
      api.get("/sales"),
    ]);
    setCustomers(c.data);
    setProducts(p.data);
    setSales(s.data);
  };

  useEffect(() => {
    load();
  }, []);

  const selectedProduct = products.find((p) => p.product_id === Number(form.productId));
  const total = selectedProduct ? Number(selectedProduct.price) * Number(form.quantity || 0) : 0;

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const inputClass = (key) =>
    `w-full border bg-white p-2.5 text-brand-900 ${fieldErrors[key] ? "border-red-500" : "border-brand-100"}`;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <FormCard title="Record Sale">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setFormMessage("");
            const errors = validateSale(form, products);
            if (Object.keys(errors).length) {
              setFieldErrors(errors);
              return;
            }
            try {
              await api.post("/sales", form);
              setFormMessage("Sale recorded successfully.");
              setForm({ customerId: "", productId: "", quantity: 1 });
              setFieldErrors({});
              load();
            } catch (error) {
              setFormMessage(error.response?.data?.message || "Unable to record sale.");
            }
          }}
          className="space-y-2"
        >
          <select
            value={form.customerId}
            onChange={(e) => setField("customerId", e.target.value)}
            className={inputClass("customerId")}
          >
            <option value="">Select Customer</option>
            {customers.map((c) => (
              <option key={c.customer_id} value={c.customer_id}>
                {c.full_name}
              </option>
            ))}
          </select>
          {fieldErrors.customerId && <p className="text-sm text-red-600">{fieldErrors.customerId}</p>}
          <select
            value={form.productId}
            onChange={(e) => setField("productId", e.target.value)}
            className={inputClass("productId")}
          >
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p.product_id} value={p.product_id}>
                {p.product_name}
              </option>
            ))}
          </select>
          {fieldErrors.productId && <p className="text-sm text-red-600">{fieldErrors.productId}</p>}
          <input
            type="number"
            min="1"
            value={form.quantity}
            onChange={(e) => setField("quantity", e.target.value)}
            className={inputClass("quantity")}
          />
          {fieldErrors.quantity && <p className="text-sm text-red-600">{fieldErrors.quantity}</p>}
          <p className="text-sm text-brand-800">Auto Total: RWF {total.toFixed(2)}</p>
          {formMessage && <p className="text-sm text-brand-800">{formMessage}</p>}
          <button className="w-full border border-brand-700 bg-brand-800 p-2.5 font-semibold text-white">
            Save Sale
          </button>
        </form>
      </FormCard>
      <section className="border border-brand-100 bg-white p-5 shadow-sm lg:col-span-2 md:p-6">
        <h2 className="mb-4 border-l-4 border-accent-500 pl-3 text-lg font-semibold text-brand-900">
          Sales List
        </h2>
        <div className="overflow-auto">
          <table className="w-full text-sm text-brand-900">
            <thead>
              <tr className="text-left">
                <th>Customer</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.sale_id} className="border-t border-brand-100">
                  <td>{s.customer_name}</td>
                  <td>{s.product_name}</td>
                  <td>{s.quantity}</td>
                  <td>RWF {s.unit_price}</td>
                  <td>RWF {s.total_price}</td>
                  <td>{new Date(s.sale_date).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default SalesPage;
