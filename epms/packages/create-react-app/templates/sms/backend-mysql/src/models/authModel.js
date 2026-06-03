import { query } from "../config/db.js";

export const findUserByUsername = (username) =>
  query(
    "SELECT user_id, username, email, password, role FROM users WHERE username = ?",
    [username]
  );

export const findUserByEmail = (email) =>
  query(
    "SELECT user_id, username, email, password, role FROM users WHERE email = ?",
    [email]
  );

export const createUser = ({ username, email, password, role = "student" }) =>
  query("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)", [
    username,
    email,
    password,
    role,
  ]);

export const updatePasswordByEmail = (email, password) =>
  query("UPDATE users SET password = ? WHERE email = ?", [password, email]);
