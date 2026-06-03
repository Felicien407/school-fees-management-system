import * as customerModel from "../models/customerModel.js";

export const getCustomers = async (req, res) => {
  const { q } = req.query;
  const customers = q
    ? await customerModel.searchCustomers(q)
    : await customerModel.getAllCustomers();
  res.json(customers);
};

export const addCustomer = async (req, res) => {
  const result = await customerModel.createCustomer(req.body);
  res
    .status(201)
    .json({ message: "Customer created.", customerId: result.insertId });
};

export const editCustomer = async (req, res) => {
  await customerModel.updateCustomer(req.params.id, req.body);
  res.json({ message: "Customer updated." });
};

export const removeCustomer = async (req, res) => {
  await customerModel.deleteCustomer(req.params.id);
  res.json({ message: "Customer deleted." });
};
