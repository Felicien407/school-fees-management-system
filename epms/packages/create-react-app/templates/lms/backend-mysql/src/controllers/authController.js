const bcrypt = require("bcryptjs");
const { query } = require("../config/db");

const normalize = (value) => String(value || "").trim().toLowerCase();
const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const login = async (req, res) => {
  try {
    const username = normalize(req.body.username);
    const password = String(req.body.password || "");
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const rows = await query("SELECT * FROM users WHERE username = ?", [username]);
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    req.session.userId = String(user.id);
    req.session.username = user.username;
    req.session.role = user.role;
    return res.json({
      message: "Login successful",
      username: user.username,
      role: user.role,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
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
    const rows = await query("SELECT id FROM users WHERE email = ?", [emailNorm]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const hash = await bcrypt.hash(newPassword, 10);
    await query("UPDATE users SET password_hash = ? WHERE email = ?", [hash, emailNorm]);
    return res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const me = (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  return res.json({
    username: req.session.username,
    role: req.session.role,
  });
};

const logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out" });
  });
};

module.exports = { login, forgotPassword, me, logout };
