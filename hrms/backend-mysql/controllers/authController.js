import bcrypt from "bcryptjs";
import { query } from "../config/db.js";
import { toAuthUser } from "../utils/userRole.js";

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }
    const rows = await query("SELECT * FROM users WHERE user_name = ?", [username.trim()]);
    if (!rows.length) return res.status(401).json({ message: "Invalid credentials." });
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials." });

    const profile = toAuthUser(user);
    req.session.user = profile;

    return res.json({
      message: "Login successful.",
      user: profile,
      auth: { session: true },
    });
  } catch {
    return res.status(500).json({ message: "Server error during login." });
  }
};

export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: "Could not end session." });
    res.clearCookie("hrms.sid");
    return res.json({ message: "Logged out successfully." });
  });
};

export const me = (req, res) => {
  const raw = req.session?.user || req.user;
  if (!raw) return res.status(401).json({ message: "Not authenticated." });
  const user = raw.role
    ? raw
    : { ...raw, role: raw.employeeId ? "employee" : "admin" };
  return res.json({ user });
};

export const forgotPassword = async (req, res) => {
  try {
    const { username, newPassword, confirmPassword } = req.body;
    if (!username) return res.status(400).json({ success: false, message: "Username is required." });
    if (!newPassword) return res.status(400).json({ success: false, message: "New password is required." });
    if (!confirmPassword) return res.status(400).json({ success: false, message: "Confirm password is required." });
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "New password and confirm password must match." });
    }
    const rows = await query("SELECT user_id FROM users WHERE user_name = ?", [username.trim()]);
    if (!rows.length) return res.status(404).json({ success: false, message: "User not found." });
    const hash = await bcrypt.hash(newPassword, 10);
    await query("UPDATE users SET password = ? WHERE user_name = ?", [hash, username.trim()]);
    return res.json({ success: true, message: "Password reset successfully." });
  } catch {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
