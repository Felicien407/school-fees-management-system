const Borrow = require("../models/Borrow");
const Book = require("../models/Book");
const Student = require("../models/Student");

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

    const filter = {};
    if (status === "active") filter.returnedAt = null;
    else if (status === "returned") filter.returnedAt = { $ne: null };

    if (dateFrom || dateTo) {
      filter.borrowDate = {};
      if (dateFrom) filter.borrowDate.$gte = dateFrom;
      if (dateTo) filter.borrowDate.$lte = dateTo;
    }

    const rows = await Borrow.find(filter)
      .populate("student", "fullName className email phone")
      .populate("book", "title author category quantity publishedYear")
      .sort({ borrowDate: -1 });
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createBorrow = async (req, res) => {
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

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });
    if (book.quantity < 1) {
      return res.status(409).json({ message: "No copies available to borrow" });
    }

    book.quantity -= 1;
    await book.save();

    const borrow = await Borrow.create({
      student: studentId,
      book: bookId,
      borrowDate: bd,
      returnDueDate: rd,
      returnedAt: null,
    });
    const populated = await Borrow.findById(borrow._id)
      .populate("student", "fullName className email phone")
      .populate("book", "title author category quantity publishedYear");
    return res.status(201).json(populated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const returnBorrow = async (req, res) => {
  try {
    const borrow = await Borrow.findById(req.params.id);
    if (!borrow) return res.status(404).json({ message: "Borrow record not found" });
    if (borrow.returnedAt) {
      return res.status(409).json({ message: "Already returned" });
    }

    const book = await Book.findById(borrow.book);
    if (!book) return res.status(500).json({ message: "Book missing" });

    borrow.returnedAt = new Date();
    await borrow.save();
    book.quantity += 1;
    await book.save();

    const populated = await Borrow.findById(borrow._id)
      .populate("student", "fullName className email phone")
      .populate("book", "title author category quantity publishedYear");
    return res.json(populated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { listBorrows, createBorrow, returnBorrow };
