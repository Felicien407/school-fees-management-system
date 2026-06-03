import Warehouse from "../models/Warehouse.js";

export const create = async (req, res) => {
  try {
    if (req.body.warehouseCode === undefined || req.body.warehouseCode === "") return res.status(400).json({ message: "Warehouse Code is required." });
    if (req.body.warehouseName === undefined || req.body.warehouseName === "") return res.status(400).json({ message: "Warehouse Name is required." });
    if (req.body.warehouseLocation === undefined || req.body.warehouseLocation === "") return res.status(400).json({ message: "Location is required." });
    await Warehouse.create({ warehouse_code: req.body.warehouseCode, warehouse_name: req.body.warehouseName, warehouse_location: req.body.warehouseLocation });
    return res.status(201).json({ message: "Warehouse added successfully." });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Warehouse already exists." });
    }
    return res.status(500).json({ message: "Failed to add warehouse." });
  }
};

export const getAll = async (_req, res) => {
  try {
    const rows = await Warehouse.find().sort({ warehouse_code: -1 }).lean();
    return res.json(rows.map((r) => { const { _id, __v, ...rest } = r; return rest; }));
  } catch {
    return res.status(500).json({ message: "Failed to fetch warehouse records." });
  }
};