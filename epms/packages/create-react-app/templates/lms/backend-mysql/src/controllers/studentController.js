const { query } = require("../config/db");
const { mapStudent } = require("../utils/mappers");

const listStudents = async (req, res) => {
  try {
    const q = String(req.query.name || "").trim();
    const rows = q
      ? await query("SELECT * FROM students WHERE full_name LIKE ? ORDER BY full_name", [`%${q}%`])
      : await query("SELECT * FROM students ORDER BY full_name");
    return res.json(rows.map(mapStudent));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getStudent = async (req, res) => {
  try {
    const rows = await query("SELECT * FROM students WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: "Student not found" });
    return res.json(mapStudent(rows[0]));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createStudent = async (req, res) => {
  try {
    const { fullName, gender, className, phone, email } = req.body;
    if (!fullName || !gender || !className || !phone || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!["Male", "Female", "Other"].includes(gender)) {
      return res.status(400).json({ message: "Invalid gender" });
    }
    const result = await query(
      "INSERT INTO students (full_name, gender, class_name, phone, email) VALUES (?, ?, ?, ?, ?)",
      [String(fullName).trim(), gender, String(className).trim(), String(phone).trim(), String(email).trim().toLowerCase()]
    );
    const rows = await query("SELECT * FROM students WHERE id = ?", [result.insertId]);
    return res.status(201).json(mapStudent(rows[0]));
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Duplicate email" });
    }
    return res.status(500).json({ message: error.message });
  }
};

const updateStudent = async (req, res) => {
  try {
    const rows = await query("SELECT * FROM students WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: "Student not found" });

    const { fullName, gender, className, phone, email } = req.body;
    const current = rows[0];
    if (gender !== undefined && !["Male", "Female", "Other"].includes(gender)) {
      return res.status(400).json({ message: "Invalid gender" });
    }

    await query(
      "UPDATE students SET full_name = ?, gender = ?, class_name = ?, phone = ?, email = ? WHERE id = ?",
      [
        fullName !== undefined ? String(fullName).trim() : current.full_name,
        gender !== undefined ? gender : current.gender,
        className !== undefined ? String(className).trim() : current.class_name,
        phone !== undefined ? String(phone).trim() : current.phone,
        email !== undefined ? String(email).trim().toLowerCase() : current.email,
        req.params.id,
      ]
    );
    const updated = await query("SELECT * FROM students WHERE id = ?", [req.params.id]);
    return res.json(mapStudent(updated[0]));
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Duplicate email" });
    }
    return res.status(500).json({ message: error.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const active = await query("SELECT id FROM borrows WHERE student_id = ? AND returned_at IS NULL LIMIT 1", [req.params.id]);
    if (active.length) {
      return res.status(409).json({ message: "Student has active borrows; return books first" });
    }
    const result = await query("DELETE FROM students WHERE id = ?", [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: "Student not found" });
    return res.json({ message: "Deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { listStudents, getStudent, createStudent, updateStudent, deleteStudent };
