import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createUser, findUserByUsername } from "../models/authModel.js";

const createAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET || "smartshop_student_project_secret", {
    expiresIn: "8h",
  });

export const register = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  const existing = await findUserByUsername(username);
  if (existing.length) {
    return res.status(409).json({ message: "Username already exists." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await createUser({ username, password: hashedPassword });
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

  const users = await findUserByUsername(username);
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
