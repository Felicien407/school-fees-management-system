import Product from "../models/Product.js";
import Sale from "../models/Sale.js";
import { mapSale } from "../utils/mappers.js";

export const getSales = async (_req, res) => {
  const sales = await Sale.find().populate("customer").populate("product").sort({ saleDate: -1 });
  res.json(sales.map(mapSale));
};

export const recordSale = async (req, res) => {
  const { customerId, productId, quantity } = req.body;
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: "Product not found." });
  if (Number(product.quantity) < Number(quantity)) {
    return res.status(400).json({ message: "Insufficient stock." });
  }
  const unitPrice = Number(product.price);
  const totalPrice = unitPrice * Number(quantity);
  product.quantity -= Number(quantity);
  await product.save();
  const sale = await Sale.create({ customer: customerId, product: productId, quantity, unitPrice, totalPrice });
  res.status(201).json({ message: "Sale recorded.", saleId: sale._id });
};
