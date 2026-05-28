import * as saleModel from "../models/saleModel.js";

export const getSales = async (_req, res) => {
  const sales = await saleModel.getSales();
  res.json(sales);
};

export const recordSale = async (req, res) => {
  const saleId = await saleModel.createSale(req.body);
  res.status(201).json({ message: "Sale recorded.", saleId });
};
