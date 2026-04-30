import { useState } from "react";
import { reportBooks, reportBorrowed, reportReturned, reportStudents } from "../api/reportsApi";

function formatPrintDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function ReportsPage() {
  const [tab, setTab] = useState("students");
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  const load = async (t) => {
    setTab(t);
    setErr("");
    setData(null);
    try {
      let res;
      if (t === "students") res = await reportStudents();
      else if (t === "books") res = await reportBooks();
      else if (t === "borrowed") res = await reportBorrowed();
      else res = await reportReturned();
      setData(res.data);
    } catch (e) {
      setErr(e.response?.data?.message || "Failed");
    }
  };

  const printNow = () => window.print();

  const nowLabel = new Date().toLocaleString();

  return (
    <div>
      <div className="no-print mb-4 flex flex-wrap items-center gap-2">
        <h1 className="mr-4 text-xl font-bold text-lms-paper">Reports</h1>
        <button
          type="button"
          className={`border px-3 py-1 text-sm ${tab === "students" ? "border-lms-accent bg-lms-accent text-lms-paper" : "border-lms-panel text-lms-paper"}`}
          onClick={() => load("students")}
        >
          All students
        </button>
        <button
          type="button"
          className={`border px-3 py-1 text-sm ${tab === "books" ? "border-lms-accent bg-lms-accent text-lms-paper" : "border-lms-panel text-lms-paper"}`}
          onClick={() => load("books")}
        >
          All books
        </button>
        <button
          type="button"
          className={`border px-3 py-1 text-sm ${tab === "borrowed" ? "border-lms-accent bg-lms-accent text-lms-paper" : "border-lms-panel text-lms-paper"}`}
          onClick={() => load("borrowed")}
        >
          Borrowed
        </button>
        <button
          type="button"
          className={`border px-3 py-1 text-sm ${tab === "returned" ? "border-lms-accent bg-lms-accent text-lms-paper" : "border-lms-panel text-lms-paper"}`}
          onClick={() => load("returned")}
        >
          Returned
        </button>
        <button
          type="button"
          className="ml-auto border border-lms-paper px-4 py-2 text-sm text-lms-paper"
          onClick={printNow}
        >
          Print
        </button>
      </div>

      {err && <p className="text-lms-accent">{err}</p>}

      <div id="lms-report-print" className="border border-lms-panel bg-lms-panel p-4 text-lms-paper print:border-black print:bg-white print:text-black">
        <header className="mb-4 border-b border-lms-dark pb-2 print:border-black">
          <h2 className="text-lg font-bold text-lms-accent print:text-black">
            LMS —{" "}
            {tab === "students" && "All students"}
            {tab === "books" && "All books"}
            {tab === "borrowed" && "Borrowed books"}
            {tab === "returned" && "Returned books"}
          </h2>
          <p className="text-sm text-lms-paper/80 print:text-black">Printed: {nowLabel}</p>
          {data?.generatedAt && (
            <p className="text-xs text-lms-paper/60 print:text-black">
              Data snapshot: {formatPrintDate(data.generatedAt)}
            </p>
          )}
        </header>

        {!data && !err && <p className="text-lms-paper/70">Pick a report above.</p>}

        {data?.rows && tab === "students" && (
          <table className="w-full text-left text-sm print:text-black">
            <thead>
              <tr className="border-b border-lms-dark print:border-black">
                <th className="p-2">Name</th>
                <th className="p-2">Gender</th>
                <th className="p-2">Class</th>
                <th className="p-2">Phone</th>
                <th className="p-2">Email</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r) => (
                <tr key={r._id} className="border-b border-lms-dark/50 print:border-gray-300">
                  <td className="p-2">{r.fullName}</td>
                  <td className="p-2">{r.gender}</td>
                  <td className="p-2">{r.className}</td>
                  <td className="p-2">{r.phone}</td>
                  <td className="p-2">{r.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {data?.rows && tab === "books" && (
          <table className="w-full text-left text-sm print:text-black">
            <thead>
              <tr className="border-b border-lms-dark print:border-black">
                <th className="p-2">Title</th>
                <th className="p-2">Author</th>
                <th className="p-2">Category</th>
                <th className="p-2">Qty</th>
                <th className="p-2">Year</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r) => (
                <tr key={r._id} className="border-b border-lms-dark/50 print:border-gray-300">
                  <td className="p-2">{r.title}</td>
                  <td className="p-2">{r.author}</td>
                  <td className="p-2">{r.category}</td>
                  <td className="p-2">{r.quantity}</td>
                  <td className="p-2">{r.publishedYear}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {data?.rows && (tab === "borrowed" || tab === "returned") && (
          <table className="w-full text-left text-sm print:text-black">
            <thead>
              <tr className="border-b border-lms-dark print:border-black">
                <th className="p-2">Student</th>
                <th className="p-2">Book</th>
                <th className="p-2">Borrowed</th>
                <th className="p-2">Due</th>
                <th className="p-2">Returned</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r) => (
                <tr key={r._id} className="border-b border-lms-dark/50 print:border-gray-300">
                  <td className="p-2">{r.student?.fullName}</td>
                  <td className="p-2">{r.book?.title}</td>
                  <td className="p-2">{new Date(r.borrowDate).toLocaleDateString()}</td>
                  <td className="p-2">{new Date(r.returnDueDate).toLocaleDateString()}</td>
                  <td className="p-2">{r.returnedAt ? new Date(r.returnedAt).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
