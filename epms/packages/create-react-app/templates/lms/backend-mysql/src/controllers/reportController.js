const { query } = require("../config/db");
const { mapStudent, mapBook, mapBorrowRow, borrowSelect } = require("../utils/mappers");

const allStudents = async (_req, res) => {
  try {
    const rows = await query("SELECT * FROM students ORDER BY full_name");
    return res.json({ generatedAt: new Date().toISOString(), rows: rows.map(mapStudent) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const allBooks = async (_req, res) => {
  try {
    const rows = await query("SELECT * FROM books ORDER BY title");
    return res.json({ generatedAt: new Date().toISOString(), rows: rows.map(mapBook) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const borrowedReport = async (_req, res) => {
  try {
    const rows = await query(`${borrowSelect} WHERE b.returned_at IS NULL ORDER BY b.borrow_date DESC`);
    return res.json({ generatedAt: new Date().toISOString(), rows: rows.map(mapBorrowRow) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const returnedReport = async (_req, res) => {
  try {
    const rows = await query(`${borrowSelect} WHERE b.returned_at IS NOT NULL ORDER BY b.returned_at DESC`);
    return res.json({ generatedAt: new Date().toISOString(), rows: rows.map(mapBorrowRow) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { allStudents, allBooks, borrowedReport, returnedReport };
