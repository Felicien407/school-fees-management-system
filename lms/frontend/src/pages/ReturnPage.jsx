import { useEffect, useState } from "react";
import { listBorrows, returnBorrow } from "../api/borrowsApi";

export default function ReturnPage() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  const load = () =>
    listBorrows({ status: "active" })
      .then(({ data }) => setRows(data))
      .catch((e) => setErr(e.response?.data?.message || "Load failed"));

  useEffect(() => {
    load();
  }, []);

  const doReturn = async (id) => {
    setErr("");
    try {
      await returnBorrow(id);
      await load();
    } catch (e) {
      setErr(e.response?.data?.message || "Return failed");
    }
  };

  const fmt = (d) => (d ? new Date(d).toLocaleDateString() : "—");

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-lms-paper">Return books</h1>
      <p className="mb-3 text-sm text-lms-paper/70">Active borrowings. Returning restores one copy to inventory.</p>
      {err && <p className="mb-3 border border-lms-accent px-3 py-2 text-sm text-lms-accent">{err}</p>}
      <div className="overflow-x-auto border border-lms-panel">
        <table className="w-full text-left text-sm text-lms-paper">
          <thead className="bg-lms-panel text-lms-paper/70">
            <tr>
              <th className="p-2">Student</th>
              <th className="p-2">Book</th>
              <th className="p-2">Borrowed</th>
              <th className="p-2">Due</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._id} className="border-t border-lms-dark">
                <td className="p-2">{r.student?.fullName}</td>
                <td className="p-2">{r.book?.title}</td>
                <td className="p-2">{fmt(r.borrowDate)}</td>
                <td className="p-2">{fmt(r.returnDueDate)}</td>
                <td className="p-2">
                  <button
                    type="button"
                    className="border border-lms-accent bg-lms-dark px-3 py-1 text-lms-accent hover:bg-lms-accent hover:text-lms-paper"
                    onClick={() => doReturn(r._id)}
                  >
                    Return
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-lms-paper/60">
                  No active borrowings.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
