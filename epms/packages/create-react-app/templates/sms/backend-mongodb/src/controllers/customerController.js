import Customer from "../models/Customer.js";
import Sale from "../models/Sale.js";
import { mapCustomer } from "../utils/mappers.js";

export const getCustomers = async (req, res) => {
  const { q } = req.query;
  const filter = q
    ? {
        $or: [
          { fullName: { $regex: q, $options: "i" } },
          { phoneNumber: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } },
        ],
      }
    : {};
  const customers = await Customer.find(filter).sort({ registrationDate: -1 });
  res.json(customers.map(mapCustomer));
};

export const addCustomer = async (req, res) => {
  const customer = await Customer.create(req.body);
  res.status(201).json({ message: "Customer created.", customerId: customer._id });
};

export const editCustomer = async (req, res) => {
  await Customer.findByIdAndUpdate(req.params.id, {
    fullName: req.body.fullName,
    phoneNumber: req.body.phoneNumber,
    email: req.body.email,
    address: req.body.address,
  });
  res.json({ message: "Customer updated." });
};

export const removeCustomer = async (req, res) => {
  await Sale.deleteMany({ customer: req.params.id });
  await Customer.findByIdAndDelete(req.params.id);
  res.json({ message: "Customer deleted." });
};
