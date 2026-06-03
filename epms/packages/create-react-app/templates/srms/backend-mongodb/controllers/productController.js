import Product from "../models/Product.js";

export const create = async (req, res) => {
  try {
    if (req.body.productCode === undefined || req.body.productCode === "") return res.status(400).json({ message: "Product Code is required." });
    if (req.body.productName === undefined || req.body.productName === "") return res.status(400).json({ message: "Product Name is required." });
    if (req.body.quantitySold === undefined || req.body.quantitySold === "") return res.status(400).json({ message: "Quantity Sold is required." });
    if (req.body.unitPrice === undefined || req.body.unitPrice === "") return res.status(400).json({ message: "Unit Price is required." });
    await Product.create({ product_code: req.body.productCode, product_name: req.body.productName, quantity_sold: req.body.quantitySold, unit_price: req.body.unitPrice });
    return res.status(201).json({ message: "Product added successfully." });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Product already exists." });
    }
    return res.status(500).json({ message: "Failed to add product." });
  }
};

export const getAll = async (_req, res) => {
  try {
    const rows = await Product.find().sort({ product_code: -1 }).lean();
    return res.json(rows.map((r) => { const { _id, __v, ...rest } = r; return rest; }));
  } catch {
    return res.status(500).json({ message: "Failed to fetch product records." });
  }
};