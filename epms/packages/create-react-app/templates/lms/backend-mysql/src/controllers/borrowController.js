const { query, pool } = require("../config/db");
const { mapBorrowRow, borrowSelect } = require("../utils/mappers");

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const listBorrows = async (req, res) => {
  try {
    const status = String(req.query.status || "all").toLowerCase();
    const dateFrom = req.query.dateFrom ? startOfDay(req.query.dateFrom) : null;
    const dateTo = req.query.dateTo ? startOfDay(req.query.dateTo) : null;
    if (dateTo) dateTo.setHours(23, 59, 59, 999);

    const clauses = [];
    const params = [];
    if (status === "active") clauses.push("b.returned_at IS NULL");
    else if (status === "returned") clauses.push("b.returned_at IS NOT NULL");
    if (dateFrom) {
      clauses.push("b.borrow_date >= ?");
      params.push(dateFrom);
    }
    if (dateTo) {
      clauses.push("b.borrow_date <= ?");
      params.push(dateTo);
    }
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const rows = await query(`${borrowSelect} ${where} ORDER BY b.borrow_date DESC`, params);
    return res.json(rows.map(mapBorrowRow));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createBorrow = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { studentId, bookId, borrowDate, returnDueDate } = req.body;
    if (!studentId || !bookId || !borrowDate || !returnDueDate) {
      return res.status(400).json({ message: "Student, book, borrow date and return date are required" });
    }
    const bd = new Date(borrowDate);
    const rd = new Date(returnDueDate);
    if (Number.isNaN(bd.getTime()) || Number.isNaN(rd.getTime())) {
      return res.status(400).json({ message: "Invalid dates" });
    }
    if (rd < bd) {
      return res.status(400).json({ message: "Return date must be on or after borrow date" });
    }

    const students = await query("SELECT id FROM students WHERE id = ?", [studentId]);
    if (!students.length) return res.status(404).json({ message: "Student not found" });

    await conn.beginTransaction();
    const [books] = await conn.execute("SELECT id, quantity FROM books WHERE id = ? FOR UPDATE", [bookId]);
    if (!books.length) {
      await conn.rollback();
      return res.status(404).json({ message: "Book not found" });
    }
    if (books[0].quantity < 1) {
      await conn.rollback();
      return res.status(409).json({ message: "No copies available to borrow" });
    }

    await conn.execute("UPDATE books SET quantity = quantity - 1 WHERE id = ?", [bookId]);
    const [insert] = await conn.execute(
      "INSERT INTO borrows (student_id, book_id, borrow_date, return_due_date, returned_at) VALUES (?, ?, ?, ?, NULL)",
      [studentId, bookId, bd, rd]
    );
    await conn.commit();

    const rows = await query(`${borrowSelect} WHERE b.id = ?`, [insert.insertId]);
    return res.status(201).json(mapBorrowRow(rows[0]));
  } catch (error) {
    await conn.rollback();
    return res.status(500).json({ message: error.message });
  } finally {
    conn.release();
  }
};

const returnBorrow = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [borrows] = await conn.execute("SELECT * FROM borrows WHERE id = ? FOR UPDATE", [req.params.id]);
    const borrow = borrows[0];
    if (!borrow) {
      await conn.rollback();
      return res.status(404).json({ message: "Borrow record not found" });
    }
    if (borrow.returned_at) {
      await conn.rollback();
      return res.status(409).json({ message: "Already returned" });
    }

    await conn.execute("UPDATE borrows SET returned_at = NOW() WHERE id = ?", [req.params.id]);
    await conn.execute("UPDATE books SET quantity = quantity + 1 WHERE id = ?", [borrow.book_id]);
    await conn.commit();

    const rows = await query(`${borrowSelect} WHERE b.id = ?`, [req.params.id]);
    return res.json(mapBorrowRow(rows[0]));
  } catch (error) {
    await conn.rollback();
    return res.status(500).json({ message: error.message });
  } finally {
    conn.release();
  }
};

module.exports = { listBorrows, createBorrow, returnBorrow };
