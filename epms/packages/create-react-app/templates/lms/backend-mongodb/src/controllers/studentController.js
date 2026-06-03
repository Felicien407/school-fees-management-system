const Student = require("../models/Student");

const listStudents = async (req, res) => {
  try {
    const q = String(req.query.name || "").trim();
    const filter = q ? { fullName: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") } : {};
    const students = await Student.find(filter).sort({ fullName: 1 });
    return res.json(students);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    return res.json(student);
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
    const student = await Student.create({
      fullName: String(fullName).trim(),
      gender,
      className: String(className).trim(),
      phone: String(phone).trim(),
      email: String(email).trim().toLowerCase(),
    });
    return res.status(201).json(student);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Duplicate email" });
    }
    return res.status(500).json({ message: error.message });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { fullName, gender, className, phone, email } = req.body;
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    if (fullName !== undefined) student.fullName = String(fullName).trim();
    if (gender !== undefined) {
      if (!["Male", "Female", "Other"].includes(gender)) {
        return res.status(400).json({ message: "Invalid gender" });
      }
      student.gender = gender;
    }
    if (className !== undefined) student.className = String(className).trim();
    if (phone !== undefined) student.phone = String(phone).trim();
    if (email !== undefined) student.email = String(email).trim().toLowerCase();
    await student.save();
    return res.json(student);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const Borrow = require("../models/Borrow");
    const active = await Borrow.exists({ student: req.params.id, returnedAt: null });
    if (active) {
      return res.status(409).json({ message: "Student has active borrows; return books first" });
    }
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    return res.json({ message: "Deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  listStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
};
