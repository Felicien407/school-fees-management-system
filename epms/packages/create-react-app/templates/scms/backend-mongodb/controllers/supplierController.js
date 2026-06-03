import Supplier from "../models/Supplier.js";

export const create = async (req, res) => {
  try {
    if (req.body.supplierCode === undefined || req.body.supplierCode === "") return res.status(400).json({ message: "Supplier Code is required." });
    if (req.body.supplierName === undefined || req.body.supplierName === "") return res.status(400).json({ message: "Supplier Name is required." });
    if (req.body.telephone === undefined || req.body.telephone === "") return res.status(400).json({ message: "Telephone is required." });
    if (req.body.address === undefined || req.body.address === "") return res.status(400).json({ message: "Address is required." });
    if (req.body.email === undefined || req.body.email === "") return res.status(400).json({ message: "Email is required." });
    await Supplier.create({ supplier_code: req.body.supplierCode, supplier_name: req.body.supplierName, telephone: req.body.telephone, address: req.body.address, email: req.body.email });
    return res.status(201).json({ message: "Supplier added successfully." });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Supplier already exists." });
    }
    return res.status(500).json({ message: "Failed to add supplier." });
  }
};

export const getAll = async (_req, res) => {
  try {
    const rows = await Supplier.find().sort({ supplier_code: -1 }).lean();
    return res.json(rows.map((r) => { const { _id, __v, ...rest } = r; return rest; }));
  } catch {
    return res.status(500).json({ message: "Failed to fetch supplier records." });
  }
};