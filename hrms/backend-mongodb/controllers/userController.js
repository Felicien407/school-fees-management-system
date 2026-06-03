import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Employee from "../models/Employee.js";
import { nextId } from "../utils/ids.js";

const strip = (doc) => {
  const { _id, __v, password, ...rest } = doc;
  return rest;
};

const enrich = async (users) => {
  const empMap = Object.fromEntries(
    (await Employee.find().lean()).map((e) => [e.employee_id, e])
  );
  return users.map((u) => {
    const e = u.employee_id ? empMap[u.employee_id] : null;
    return {
      ...strip(u),
      emp_first_name: e?.emp_first_name,
      emp_last_name: e?.emp_last_name,
      emp_email: e?.emp_email,
    };
  });
};

export const create = async (req, res) => {
  try {
    const { userName, password, employeeId } = req.body;
    if (!userName) return res.status(400).json({ message: "Username is required." });
    if (!password) return res.status(400).json({ message: "Password is required." });
    if (!employeeId) return res.status(400).json({ message: "Select an employee for this account." });
    const emp = await Employee.findOne({ employee_id: Number(employeeId) });
    if (!emp) return res.status(400).json({ message: "Selected employee does not exist." });
    if (await User.findOne({ employee_id: Number(employeeId) })) {
      return res.status(409).json({ message: "This employee already has a user account." });
    }
    if (await User.findOne({ user_name: userName.trim() })) {
      return res.status(409).json({ message: "Username already exists." });
    }
    const user_id = await nextId("user_id");
    const hash = await bcrypt.hash(password, 10);
    await User.create({
      user_id,
      user_name: userName.trim(),
      password: hash,
      employee_id: Number(employeeId),
    });
    return res.status(201).json({ message: "User account created successfully." });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "Username already exists." });
    return res.status(500).json({ message: "Failed to create user account." });
  }
};

export const getAll = async (_req, res) => {
  try {
    return res.json(await enrich((await User.find().sort({ user_id: -1 }).lean())));
  } catch {
    return res.status(500).json({ message: "Failed to fetch user records." });
  }
};

export const search = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return getAll(req, res);
    const re = new RegExp(q, "i");
    const users = await User.find({ user_name: re }).sort({ user_id: -1 }).lean();
    const all = await enrich(users);
    const employees = await Employee.find({
      $or: [{ emp_first_name: re }, { emp_last_name: re }, { emp_email: re }],
    }).lean();
    const empIds = new Set(employees.map((e) => e.employee_id));
    const byEmp = await enrich(
      (await User.find({ employee_id: { $in: [...empIds] } }).sort({ user_id: -1 }).lean())
    );
    const seen = new Set();
    return res.json(
      [...all, ...byEmp].filter((u) => {
        if (seen.has(u.user_id)) return false;
        seen.add(u.user_id);
        return true;
      })
    );
  } catch {
    return res.status(500).json({ message: "Failed to search users." });
  }
};

export const getById = async (req, res) => {
  try {
    const doc = await User.findOne({ user_id: Number(req.params.id) }).lean();
    if (!doc) return res.status(404).json({ message: "User not found." });
    return res.json((await enrich([doc]))[0]);
  } catch {
    return res.status(500).json({ message: "Failed to fetch user." });
  }
};

export const update = async (req, res) => {
  try {
    const { userName, password } = req.body;
    const doc = await User.findOne({ user_id: Number(req.params.id) });
    if (!doc) return res.status(404).json({ message: "User not found." });
    if (userName?.trim()) {
      if (await User.findOne({ user_name: userName.trim(), user_id: { $ne: doc.user_id } })) {
        return res.status(409).json({ message: "Username already exists." });
      }
      doc.user_name = userName.trim();
    }
    if (password) doc.password = await bcrypt.hash(password, 10);
    if (!userName?.trim() && !password) {
      return res.status(400).json({ message: "Provide username and/or password to update." });
    }
    await doc.save();
    return res.json({ message: "User account updated successfully." });
  } catch {
    return res.status(500).json({ message: "Failed to update user account." });
  }
};

export const remove = async (req, res) => {
  try {
    const doc = await User.findOne({ user_id: Number(req.params.id) });
    if (!doc) return res.status(404).json({ message: "User not found." });
    if (!doc.employee_id) {
      return res.status(403).json({ message: "Cannot delete the system administrator account." });
    }
    await User.deleteOne({ user_id: doc.user_id });
    return res.json({ message: "User account deleted successfully." });
  } catch {
    return res.status(500).json({ message: "Failed to delete user account." });
  }
};
