const Book = require("../models/Book");

const listBooks = async (req, res) => {
  try {
    const q = String(req.query.title || "").trim();
    const filter = q ? { title: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") } : {};
    const books = await Book.find(filter).sort({ title: 1 });
    return res.json(books);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    return res.json(book);
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
    const book = await Book.create({
      title: String(title).trim(),
      author: String(author).trim(),
      category: String(category).trim(),
      quantity: qty,
      publishedYear: year,
    });
    return res.status(201).json(book);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateBook = async (req, res) => {
  try {
    const { title, author, category, quantity, publishedYear } = req.body;
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    if (title !== undefined) book.title = String(title).trim();
    if (author !== undefined) book.author = String(author).trim();
    if (category !== undefined) book.category = String(category).trim();
    if (quantity !== undefined) {
      const qty = Number(quantity);
      if (!Number.isFinite(qty) || qty < 0) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
      book.quantity = qty;
    }
    if (publishedYear !== undefined) {
      const year = Number(publishedYear);
      if (!Number.isFinite(year) || year < 1000 || year > 9999) {
        return res.status(400).json({ message: "Invalid published year" });
      }
      book.publishedYear = year;
    }
    await book.save();
    return res.json(book);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteBook = async (req, res) => {
  try {
    const Borrow = require("../models/Borrow");
    const active = await Borrow.exists({ book: req.params.id, returnedAt: null });
    if (active) {
      return res.status(409).json({ message: "Book has active borrows" });
    }
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    return res.json({ message: "Deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  listBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
};
