import Position from "../models/Position.js";
import Employee from "../models/Employee.js";
import { nextId } from "../utils/ids.js";

const strip = (doc) => {
  const { _id, __v, ...rest } = doc;
  return rest;
};

export const create = async (req, res) => {
  try {
    if (!req.body.posName) return res.status(400).json({ message: "Position name is required." });
    if (!req.body.requiredQualification) {
      return res.status(400).json({ message: "Required qualification is required." });
    }
    const position_id = await nextId("position_id");
    await Position.create({
      position_id,
      pos_name: req.body.posName.trim(),
      required_qualification: req.body.requiredQualification.trim(),
    });
    return res.status(201).json({ message: "Position added successfully." });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "Position already exists." });
    return res.status(500).json({ message: "Failed to add position." });
  }
};

export const getAll = async (_req, res) => {
  try {
    return res.json((await Position.find().sort({ position_id: -1 }).lean()).map(strip));
  } catch {
    return res.status(500).json({ message: "Failed to fetch position records." });
  }
};

export const search = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return getAll(req, res);
    const re = new RegExp(q, "i");
    return res.json(
      (
        await Position.find({
          $or: [{ pos_name: re }, { required_qualification: re }],
        })
          .sort({ position_id: -1 })
          .lean()
      ).map(strip)
    );
  } catch {
    return res.status(500).json({ message: "Failed to search positions." });
  }
};

export const getById = async (req, res) => {
  try {
    const doc = await Position.findOne({ position_id: Number(req.params.id) }).lean();
    if (!doc) return res.status(404).json({ message: "Position not found." });
    return res.json(strip(doc));
  } catch {
    return res.status(500).json({ message: "Failed to fetch position." });
  }
};

export const update = async (req, res) => {
  try {
    if (!req.body.posName?.trim()) return res.status(400).json({ message: "Position name is required." });
    if (!req.body.requiredQualification?.trim()) {
      return res.status(400).json({ message: "Required qualification is required." });
    }
    const doc = await Position.findOneAndUpdate(
      { position_id: Number(req.params.id) },
      { pos_name: req.body.posName.trim(), required_qualification: req.body.requiredQualification.trim() },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Position not found." });
    return res.json({ message: "Position updated successfully." });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "Position already exists." });
    return res.status(500).json({ message: "Failed to update position." });
  }
};

export const remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (await Employee.findOne({ position_id: id })) {
      return res.status(409).json({ message: "Cannot delete: employees hold this position." });
    }
    const doc = await Position.findOneAndDelete({ position_id: id });
    if (!doc) return res.status(404).json({ message: "Position not found." });
    return res.json({ message: "Position deleted successfully." });
  } catch {
    return res.status(500).json({ message: "Failed to delete position." });
  }
};
