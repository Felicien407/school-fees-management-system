import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const createAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET || "smartshop_student_project_secret", { expiresIn: "8h" });

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
  if (await User.findOne({ username: username.trim() })) {
    return res.status(409).json({ message: "Username already exists." });
  }
  if (await User.findOne({ email: emailNorm })) {
    return res.status(409).json({ message: "Email already registered." });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ username: username.trim(), email: emailNorm, password: hashedPassword });
  return res.status(201).json({ message: "Registration successful.", userId: user._id });
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }
  const user = await User.findOne({ username: username.trim() });
  if (!user) return res.status(401).json({ message: "Invalid credentials." });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: "Invalid credentials." });
  const token = createAccessToken({ userId: user._id, username: user.username, role: user.role });
  return res.json({
    message: "Login successful.",
    token,
    user: { user_id: user._id, username: user.username, role: user.role },
  });
};

export const forgotPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required." });
    if (!newPassword) return res.status(400).json({ success: false, message: "New password is required." });
    if (!confirmPassword) return res.status(400).json({ success: false, message: "Confirm password is required." });
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "New password and confirm password must match." });
    }
    const user = await User.findOne({ email: normalizeEmail(email) });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return res.json({ success: true, message: "Password reset successfully" });
  } catch {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
