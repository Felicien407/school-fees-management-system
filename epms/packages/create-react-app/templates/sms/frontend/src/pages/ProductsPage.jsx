import { useEffect, useState } from "react";
import FormCard from "../components/FormCard";
import api from "../services/api";

const empty = { productName: "", category: "", quantity: "", price: "" };

const validateProduct = (form) => {
  const errors = {};
  if (!form.productName.trim()) errors.productName = "Product name is required.";
  if (!form.category.trim()) errors.category = "Category is required.";
  if (form.quantity === "" || Number.isNaN(Number(form.quantity)) || Number(form.quantity) < 0) {
    errors.quantity = "Quantity must be 0 or greater.";
  }
  if (!form.price || Number(form.price) <= 0) {
    errors.price = "Price must be greater than 0.";
  }
  return errors;
};

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formMessage, setFormMessage] = useState("");

  const loadProducts = () => api.get("/products").then((res) => setProducts(res.data));

  useEffect(() => {
    loadProducts();
  }, []);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const inputClass = (key) =>
    `w-full border bg-white p-2.5 text-brand-900 ${fieldErrors[key] ? "border-red-500" : "border-brand-100"}`;

  const submit = async (e) => {
    e.preventDefault();
    setFormMessage("");
    const errors = validateProduct(form);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    try {
      if (editId) await api.put(`/products/${editId}`, form);
      else await api.post("/products", form);
      setFormMessage(editId ? "Product updated successfully." : "Product saved successfully.");
      setForm(empty);
      setEditId(null);
      setFieldErrors({});
      loadProducts();
    } catch (error) {
      setFormMessage(error.response?.data?.message || "Unable to save product.");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <FormCard title={editId ? "Edit Product" : "Add Product"}>
        <form onSubmit={submit} className="space-y-2">
          <input
            placeholder="Product Name"
            value={form.productName}
            onChange={(e) => setField("productName", e.target.value)}
            className={inputClass("productName")}
          />
          {fieldErrors.productName && <p className="text-sm text-red-600">{fieldErrors.productName}</p>}
          <input
            placeholder="Category"
            value={form.category}
            onChange={(e) => setField("category", e.target.value)}
            className={inputClass("category")}
          />
          {fieldErrors.category && <p className="text-sm text-red-600">{fieldErrors.category}</p>}
          <input
            type="number"
            placeholder="Quantity"
            value={form.quantity}
            onChange={(e) => setField("quantity", e.target.value)}
            className={inputClass("quantity")}
          />
          {fieldErrors.quantity && <p className="text-sm text-red-600">{fieldErrors.quantity}</p>}
          <input
            type="number"
            placeholder="Price (RWF)"
            value={form.price}
            onChange={(e) => setField("price", e.target.value)}
            className={inputClass("price")}
          />
          {fieldErrors.price && <p className="text-sm text-red-600">{fieldErrors.price}</p>}
          {formMessage && <p className="text-sm text-brand-800">{formMessage}</p>}
          <button className="w-full border border-brand-700 bg-brand-800 p-2.5 font-semibold text-white">
            {editId ? "Update" : "Save"} Product
          </button>
        </form>
      </FormCard>

      <section className="border border-brand-100 bg-white p-5 shadow-sm lg:col-span-2 md:p-6">
        <h2 className="mb-4 border-l-4 border-accent-500 pl-3 text-lg font-semibold text-brand-900">
          All Products
        </h2>
        <div className="overflow-auto">
          <table className="w-full text-sm text-brand-900">
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
                <tr key={p.product_id} className="border-t border-brand-100">
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
                        setFieldErrors({});
                      }}
                      className="border border-brand-700 px-2 py-1 text-brand-900"
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

export default ProductsPage;
