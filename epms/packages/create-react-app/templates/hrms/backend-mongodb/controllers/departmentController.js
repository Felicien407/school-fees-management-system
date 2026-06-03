import Department from "../models/Department.js";
import Employee from "../models/Employee.js";
import { nextId } from "../utils/ids.js";

const strip = (doc) => {
  const { _id, __v, ...rest } = doc;
  return rest;
};

export const create = async (req, res) => {
  try {
    if (!req.body.departName) return res.status(400).json({ message: "Department name is required." });
    const department_id = await nextId("department_id");
    await Department.create({ department_id, depart_name: req.body.departName.trim() });
    return res.status(201).json({ message: "Department added successfully." });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "Department already exists." });
    return res.status(500).json({ message: "Failed to add department." });
  }
};

export const getAll = async (_req, res) => {
  try {
    return res.json((await Department.find().sort({ department_id: -1 }).lean()).map(strip));
  } catch {
    return res.status(500).json({ message: "Failed to fetch department records." });
  }
};

export const search = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return getAll(req, res);
    const re = new RegExp(q, "i");
    return res.json(
      (await Department.find({ depart_name: re }).sort({ department_id: -1 }).lean()).map(strip)
    );
  } catch {
    return res.status(500).json({ message: "Failed to search departments." });
  }
};

export const getById = async (req, res) => {
  try {
    const doc = await Department.findOne({ department_id: Number(req.params.id) }).lean();
    if (!doc) return res.status(404).json({ message: "Department not found." });
    return res.json(strip(doc));
  } catch {
    return res.status(500).json({ message: "Failed to fetch department." });
  }
};

export const update = async (req, res) => {
  try {
    if (!req.body.departName?.trim()) return res.status(400).json({ message: "Department name is required." });
    const doc = await Department.findOneAndUpdate(
      { department_id: Number(req.params.id) },
      { depart_name: req.body.departName.trim() },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Department not found." });
    return res.json({ message: "Department updated successfully." });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "Department already exists." });
    return res.status(500).json({ message: "Failed to update department." });
  }
};

export const remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (await Employee.findOne({ department_id: id })) {
      return res.status(409).json({ message: "Cannot delete: employees are assigned to this department." });
    }
    const doc = await Department.findOneAndDelete({ department_id: id });
    if (!doc) return res.status(404).json({ message: "Department not found." });
    return res.json({ message: "Department deleted successfully." });
  } catch {
    return res.status(500).json({ message: "Failed to delete department." });
  }
};
