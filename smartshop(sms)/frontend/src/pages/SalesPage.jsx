import { useEffect, useState } from "react";
import FormCard from "../components/FormCard";
import api from "../services/api";

function SalesPage() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [form, setForm] = useState({ customerId: "", productId: "", quantity: 1 });

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

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <FormCard title="Record Sale">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await api.post("/sales", form);
            setForm({ customerId: "", productId: "", quantity: 1 });
            load();
          }}
          className="space-y-2"
        >
          <select
            value={form.customerId}
            onChange={(e) => setForm({ ...form, customerId: e.target.value })}
            className="w-full rounded border border-brand-600 bg-brand-900 p-2"
          >
            <option value="">Select Customer</option>
            {customers.map((c) => (
              <option key={c.customer_id} value={c.customer_id}>
                {c.full_name}
              </option>
            ))}
          </select>
          <select
            value={form.productId}
            onChange={(e) => setForm({ ...form, productId: e.target.value })}
            className="w-full rounded border border-brand-600 bg-brand-900 p-2"
          >
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p.product_id} value={p.product_id}>
                {p.product_name}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            className="w-full rounded border border-brand-600 bg-brand-900 p-2"
          />
          <p className="text-sm text-brand-100">Auto Total: RWF {total.toFixed(2)}</p>
          <button className="w-full rounded bg-white p-2 font-semibold text-brand-900">
            Save Sale
          </button>
        </form>
      </FormCard>
      <section className="rounded-lg border border-brand-700 bg-brand-800 p-4 lg:col-span-2">
        <h2 className="mb-3 text-lg font-semibold">Sales List</h2>
        <div className="overflow-auto">
          <table className="w-full text-sm">
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
                <tr key={s.sale_id} className="border-t border-brand-700">
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
