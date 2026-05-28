import { query } from "../config/db.js";

export const findUserByUsername = (username) =>
  query(
    "SELECT user_id, username, password, role FROM users WHERE username = ?",
    [username]
  );

export const createUser = ({ username, password, role = "student" }) =>
  query("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [
    username,
    password,
    role,
  ]);
