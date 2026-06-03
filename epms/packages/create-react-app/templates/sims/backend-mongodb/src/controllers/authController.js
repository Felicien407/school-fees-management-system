const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { strongPasswordError } = require("../utils/passwordPolicy");

const normalize = (value) => String(value || "").trim();
const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const register = async (req, res) => {
  try {
    const username = normalize(req.body.username);
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email and password are required" });
    }
    if (username.length < 3) {
      return res.status(400).json({ message: "Username must be at least 3 characters" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }
    const pwdErr = strongPasswordError(password);
    if (pwdErr) {
      return res.status(400).json({ message: pwdErr });
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ message: "Email already registered" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ username, email, passwordHash });
    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const username = normalize(req.body.username);
    const password = String(req.body.password || "");
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    req.session.userId = user._id;
    req.session.username = user.username;
    return res.json({ message: "Login successful", username: user.username });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const currentUser = (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  return res.json({ username: req.session.username });
};

const logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out" });
  });
};

const forgotPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const newPassword = String(req.body.newPassword || "");
    const confirmPassword = String(req.body.confirmPassword || "");
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
    const pwdErr = strongPasswordError(newPassword);
    if (pwdErr) {
      return res.status(400).json({ success: false, message: pwdErr });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    return res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, currentUser, logout, forgotPassword };
