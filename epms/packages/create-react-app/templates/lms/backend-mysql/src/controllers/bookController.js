const { query } = require("../config/db");
const { mapBook } = require("../utils/mappers");

const listBooks = async (req, res) => {
  try {
    const q = String(req.query.title || "").trim();
    const rows = q
      ? await query("SELECT * FROM books WHERE title LIKE ? ORDER BY title", [`%${q}%`])
      : await query("SELECT * FROM books ORDER BY title");
    return res.json(rows.map(mapBook));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getBook = async (req, res) => {
  try {
    const rows = await query("SELECT * FROM books WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: "Book not found" });
    return res.json(mapBook(rows[0]));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createBook = async (req, res) => {
  try {
    const { title, author, category, quantity, publishedYear } = req.body;
    if (!title || !author || !category || quantity === undefined || !publishedYear) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty < 0) {
      return res.status(400).json({ message: "Quantity must be a non-negative number" });
    }
    const year = Number(publishedYear);
    if (!Number.isFinite(year) || year < 1000 || year > 9999) {
      return res.status(400).json({ message: "Invalid published year" });
    }
    const result = await query(
      "INSERT INTO books (title, author, category, quantity, published_year) VALUES (?, ?, ?, ?, ?)",
      [String(title).trim(), String(author).trim(), String(category).trim(), qty, year]
    );
    const rows = await query("SELECT * FROM books WHERE id = ?", [result.insertId]);
    return res.status(201).json(mapBook(rows[0]));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateBook = async (req, res) => {
  try {
    const rows = await query("SELECT * FROM books WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: "Book not found" });

    const { title, author, category, quantity, publishedYear } = req.body;
    const current = rows[0];
    let qty = current.quantity;
    let year = current.published_year;

    if (quantity !== undefined) {
      qty = Number(quantity);
      if (!Number.isFinite(qty) || qty < 0) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
    }
    if (publishedYear !== undefined) {
      year = Number(publishedYear);
      if (!Number.isFinite(year) || year < 1000 || year > 9999) {
        return res.status(400).json({ message: "Invalid published year" });
      }
    }

    await query(
      "UPDATE books SET title = ?, author = ?, category = ?, quantity = ?, published_year = ? WHERE id = ?",
      [
        title !== undefined ? String(title).trim() : current.title,
        author !== undefined ? String(author).trim() : current.author,
        category !== undefined ? String(category).trim() : current.category,
        qty,
        year,
        req.params.id,
      ]
    );
    const updated = await query("SELECT * FROM books WHERE id = ?", [req.params.id]);
    return res.json(mapBook(updated[0]));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteBook = async (req, res) => {
  try {
    const active = await query("SELECT id FROM borrows WHERE book_id = ? AND returned_at IS NULL LIMIT 1", [req.params.id]);
    if (active.length) {
      return res.status(409).json({ message: "Book has active borrows" });
    }
    const result = await query("DELETE FROM books WHERE id = ?", [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: "Book not found" });
    return res.json({ message: "Deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { listBooks, getBook, createBook, updateBook, deleteBook };
