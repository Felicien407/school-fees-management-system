import Product from "../models/Product.js";
import Sale from "../models/Sale.js";
import { mapProduct } from "../utils/mappers.js";

export const getProducts = async (_req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products.map(mapProduct));
};

export const addProduct = async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ message: "Product created.", productId: product._id });
};

export const editProduct = async (req, res) => {
  await Product.findByIdAndUpdate(req.params.id, {
    productName: req.body.productName,
    category: req.body.category,
    quantity: req.body.quantity,
    price: req.body.price,
  });
  res.json({ message: "Product updated." });
};

export const removeProduct = async (req, res) => {
  await Sale.deleteMany({ product: req.params.id });
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product deleted." });
};
