import Position from "../models/Position.js";
import { nextId } from "../utils/ids.js";

const strip = (doc) => { const { _id, __v, ...rest } = doc; return rest; };

export const create = async (req, res) => {
  try {
    if (!req.body.posName) return res.status(400).json({ message: "Position name is required." });
    if (!req.body.requiredQualification) return res.status(400).json({ message: "Required qualification is required." });
    const position_id = await nextId("position_id");
    await Position.create({ position_id, pos_name: req.body.posName.trim(), required_qualification: req.body.requiredQualification.trim() });
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
