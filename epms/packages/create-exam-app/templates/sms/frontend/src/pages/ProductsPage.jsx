import { useEffect, useState } from "react";
import FormCard from "../components/FormCard";
import api from "../services/api";

const empty = { productName: "", category: "", quantity: "", price: "" };

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);

  const loadProducts = () => api.get("/products").then((res) => setProducts(res.data));

  useEffect(() => {
    loadProducts();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (editId) await api.put(`/products/${editId}`, form);
    else await api.post("/products", form);
    setForm(empty);
    setEditId(null);
    loadProducts();
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <FormCard title={editId ? "Edit Product" : "Add Product"}>
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
            {editId ? "Update" : "Save"} Product
          </button>
        </form>
      </FormCard>

      <section className="rounded-lg border border-brand-700 bg-brand-800 p-4 lg:col-span-2">
        <h2 className="mb-3 text-lg font-semibold">All Products</h2>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th>Name</th>
                <th>Category</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.product_id} className="border-t border-brand-700">
                  <td>{p.product_name}</td>
                  <td>{p.category}</td>
                  <td>{p.quantity}</td>
                  <td>{p.price}</td>
                  <td className="space-x-2 py-2">
                    <button
                      onClick={() => {
                        setEditId(p.product_id);
                        setForm({
                          productName: p.product_name,
                          category: p.category,
                          quantity: p.quantity,
                          price: p.price,
                        });
                      }}
                      className="rounded bg-white px-2 py-1 text-brand-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await api.delete(`/products/${p.product_id}`);
                          loadProducts();
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

export default ProductsPage;
