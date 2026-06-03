import Product from "../models/Product.js";

export const create = async (req, res) => {
  try {
    if (req.body.productCode === undefined || req.body.productCode === "") return res.status(400).json({ message: "Product Code is required." });
    if (req.body.productName === undefined || req.body.productName === "") return res.status(400).json({ message: "Product Name is required." });
    if (req.body.category === undefined || req.body.category === "") return res.status(400).json({ message: "Category is required." });
    if (req.body.quantityInStock === undefined || req.body.quantityInStock === "") return res.status(400).json({ message: "Quantity In Stock is required." });
    if (req.body.unitPrice === undefined || req.body.unitPrice === "") return res.status(400).json({ message: "Unit Price is required." });
    if (req.body.supplierName === undefined || req.body.supplierName === "") return res.status(400).json({ message: "Supplier Name is required." });
    if (req.body.dateReceived === undefined || req.body.dateReceived === "") return res.status(400).json({ message: "Date Received is required." });
    await Product.create({ product_code: req.body.productCode, product_name: req.body.productName, category: req.body.category, quantity_in_stock: req.body.quantityInStock, unit_price: req.body.unitPrice, supplier_name: req.body.supplierName, date_received: req.body.dateReceived });
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