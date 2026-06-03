import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createUser, findUserByUsername, findUserByEmail, updatePasswordByEmail } from "../models/authModel.js";

const createAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET || "smartshop_student_project_secret", {
    expiresIn: "8h",
  });

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

export const register = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: "Username, email and password are required." });
  }
  const emailNorm = normalizeEmail(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
    return res.status(400).json({ message: "Enter a valid email address." });
  }

  const existing = await findUserByUsername(username.trim());
  if (existing.length) {
    return res.status(409).json({ message: "Username already exists." });
  }
  const existingEmail = await findUserByEmail(emailNorm);
  if (existingEmail.length) {
    return res.status(409).json({ message: "Email already registered." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await createUser({ username: username.trim(), email: emailNorm, password: hashedPassword });
  return res.status(201).json({
    message: "Registration successful.",
    userId: result.insertId,
  });
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  const users = await findUserByUsername(username.trim());
  if (!users.length) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const user = users[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const token = createAccessToken({
    userId: user.user_id,
    username: user.username,
    role: user.role,
  });

  return res.json({
    message: "Login successful.",
    token,
    user: { user_id: user.user_id, username: user.username, role: user.role },
  });
};

export const forgotPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }
    if (!newPassword) {
      return res.status(400).json({ success: false, message: "New password is required." });
    }
    if (!confirmPassword) {
      return res.status(400).json({ success: false, message: "Confirm password is required." });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password must match.",
      });
    }
    const emailNorm = normalizeEmail(email);
    const rows = await findUserByEmail(emailNorm);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const hash = await bcrypt.hash(newPassword, 10);
    await updatePasswordByEmail(emailNorm, hash);
    return res.json({ success: true, message: "Password reset successfully" });
  } catch {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
