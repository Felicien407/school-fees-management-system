import * as productModel from "../models/productModel.js";

export const getProducts = async (_req, res) => {
  const products = await productModel.getAllProducts();
  res.json(products);
};

export const addProduct = async (req, res) => {
  const result = await productModel.createProduct(req.body);
  res.status(201).json({ message: "Product created.", productId: result.insertId });
};

export const editProduct = async (req, res) => {
  await productModel.updateProduct(req.params.id, req.body);
  res.json({ message: "Product updated." });
};

export const removeProduct = async (req, res) => {
  await productModel.deleteProduct(req.params.id);
  res.json({ message: "Product deleted." });
};
