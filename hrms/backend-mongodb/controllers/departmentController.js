import Department from "../models/Department.js";
import { nextId } from "../utils/ids.js";

const strip = (doc) => { const { _id, __v, ...rest } = doc; return rest; };

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
