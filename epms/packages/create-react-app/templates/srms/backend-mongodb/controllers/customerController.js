import Customer from "../models/Customer.js";

export const create = async (req, res) => {
  try {
    if (req.body.customerNumber === undefined || req.body.customerNumber === "") return res.status(400).json({ message: "Customer Number is required." });
    if (req.body.firstName === undefined || req.body.firstName === "") return res.status(400).json({ message: "First Name is required." });
    if (req.body.lastName === undefined || req.body.lastName === "") return res.status(400).json({ message: "Last Name is required." });
    if (req.body.telephone === undefined || req.body.telephone === "") return res.status(400).json({ message: "Telephone is required." });
    if (req.body.address === undefined || req.body.address === "") return res.status(400).json({ message: "Address is required." });
    await Customer.create({ customer_number: req.body.customerNumber, first_name: req.body.firstName, last_name: req.body.lastName, telephone: req.body.telephone, address: req.body.address });
    return res.status(201).json({ message: "Customer added successfully." });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Customer already exists." });
    }
    return res.status(500).json({ message: "Failed to add customer." });
  }
};

export const getAll = async (_req, res) => {
  try {
    const rows = await Customer.find().sort({ customer_number: -1 }).lean();
    return res.json(rows.map((r) => { const { _id, __v, ...rest } = r; return rest; }));
  } catch {
    return res.status(500).json({ message: "Failed to fetch customer records." });
  }
};