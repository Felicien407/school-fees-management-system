const Student = require("../models/Student");
const Book = require("../models/Book");
const Borrow = require("../models/Borrow");

const allStudents = async (_req, res) => {
  try {
    const rows = await Student.find().sort({ fullName: 1 });
    return res.json({ generatedAt: new Date().toISOString(), rows });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const allBooks = async (_req, res) => {
  try {
    const rows = await Book.find().sort({ title: 1 });
    return res.json({ generatedAt: new Date().toISOString(), rows });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const borrowedReport = async (_req, res) => {
  try {
    const rows = await Borrow.find({ returnedAt: null })
      .populate("student", "fullName className email phone gender")
      .populate("book", "title author category publishedYear")
      .sort({ borrowDate: -1 });
    return res.json({ generatedAt: new Date().toISOString(), rows });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const returnedReport = async (_req, res) => {
  try {
    const rows = await Borrow.find({ returnedAt: { $ne: null } })
      .populate("student", "fullName className email phone gender")
      .populate("book", "title author category publishedYear")
      .sort({ returnedAt: -1 });
    return res.json({ generatedAt: new Date().toISOString(), rows });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { allStudents, allBooks, borrowedReport, returnedReport };
