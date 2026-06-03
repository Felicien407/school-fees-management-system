import StockTransaction from "../models/StockTransaction.js";
import Product from "../models/Product.js";
import Warehouse from "../models/Warehouse.js";

const validateRefs = async (productCode, warehouseCode) => {
  const product = await Product.findOne({ product_code: productCode });
  if (!product) return "Selected product does not exist.";
  const warehouse = await Warehouse.findOne({ warehouse_code: warehouseCode });
  if (!warehouse) return "Selected warehouse does not exist.";
  return null;
};

export const create = async (req, res) => {
  try {
    if (req.body.transactionDate === undefined || req.body.transactionDate === "") return res.status(400).json({ message: "Transaction Date is required." });
    if (req.body.quantityMoved === undefined || req.body.quantityMoved === "") return res.status(400).json({ message: "Quantity Moved is required." });
    if (req.body.transactionType === undefined || req.body.transactionType === "") return res.status(400).json({ message: "Type (IN/OUT) is required." });
    if (req.body.productCode === undefined || req.body.productCode === "") return res.status(400).json({ message: "Product Code is required." });
    if (req.body.warehouseCode === undefined || req.body.warehouseCode === "") return res.status(400).json({ message: "Warehouse Code is required." });
    const refError = await validateRefs(req.body.productCode, req.body.warehouseCode);
    if (refError) return res.status(400).json({ message: refError });
    await StockTransaction.create({ transaction_date: req.body.transactionDate, quantity_moved: req.body.quantityMoved, transaction_type: req.body.transactionType, product_code: req.body.productCode, warehouse_code: req.body.warehouseCode });
    return res.status(201).json({ message: "Transaction added successfully." });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Transaction already exists." });
    }
    return res.status(500).json({ message: "Failed to add transaction." });
  }
};

export const getAll = async (_req, res) => {
  try {
    const rows = await StockTransaction.find().sort({ transaction_id: -1 }).lean();
    return res.json(rows.map((r) => { const { _id, __v, ...rest } = r; return rest; }));
  } catch {
    return res.status(500).json({ message: "Failed to fetch transaction records." });
  }
};

export const update = async (req, res) => {
  try {
    if (req.body.transactionDate === undefined || req.body.transactionDate === "") return res.status(400).json({ message: "Transaction Date is required." });
    if (req.body.quantityMoved === undefined || req.body.quantityMoved === "") return res.status(400).json({ message: "Quantity Moved is required." });
    if (req.body.transactionType === undefined || req.body.transactionType === "") return res.status(400).json({ message: "Type (IN/OUT) is required." });
    if (req.body.productCode === undefined || req.body.productCode === "") return res.status(400).json({ message: "Product Code is required." });
    if (req.body.warehouseCode === undefined || req.body.warehouseCode === "") return res.status(400).json({ message: "Warehouse Code is required." });
    const refError = await validateRefs(req.body.productCode, req.body.warehouseCode);
    if (refError) return res.status(400).json({ message: refError });
    const updated = await StockTransaction.findOneAndUpdate(
      { transaction_id: req.params.id },
      { transaction_date: req.body.transactionDate, quantity_moved: req.body.quantityMoved, transaction_type: req.body.transactionType, product_code: req.body.productCode, warehouse_code: req.body.warehouseCode },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Transaction not found." });
    }
    return res.json({ message: "Transaction updated successfully." });
  } catch {
    return res.status(500).json({ message: "Failed to update transaction." });
  }
};

export const remove = async (req, res) => {
  try {
    const deleted = await StockTransaction.findOneAndDelete({ transaction_id: req.params.id });
    if (!deleted) {
      return res.status(404).json({ message: "Transaction not found." });
    }
    return res.json({ message: "Transaction deleted successfully." });
  } catch {
    return res.status(500).json({ message: "Failed to delete transaction." });
  }
};
