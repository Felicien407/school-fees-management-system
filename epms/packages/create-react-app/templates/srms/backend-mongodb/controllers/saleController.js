import Customer from "../models/Customer.js";
import Product from "../models/Product.js";
import Sale from "../models/Sale.js";

export const create = async (req, res) => {
  try {
    if (req.body.invoiceNumber === undefined || req.body.invoiceNumber === "") return res.status(400).json({ message: "Invoice Number is required." });
    if (req.body.salesDate === undefined || req.body.salesDate === "") return res.status(400).json({ message: "Sales Date is required." });
    if (req.body.paymentMethod === undefined || req.body.paymentMethod === "") return res.status(400).json({ message: "Payment Method is required." });
    if (req.body.totalAmountPaid === undefined || req.body.totalAmountPaid === "") return res.status(400).json({ message: "Total Amount is required." });
    if (req.body.customerNumber === undefined || req.body.customerNumber === "") return res.status(400).json({ message: "Customer Number is required." });
    if (req.body.productCode === undefined || req.body.productCode === "") return res.status(400).json({ message: "Product Code is required." });
    const customer = await Customer.findOne({ customer_number: req.body.customerNumber });
    if (!customer) return res.status(400).json({ message: "Selected customer does not exist." });
    const product = await Product.findOne({ product_code: req.body.productCode });
    if (!product) return res.status(400).json({ message: "Selected product does not exist." });
    await Sale.create({ invoice_number: req.body.invoiceNumber, sales_date: req.body.salesDate, payment_method: req.body.paymentMethod, total_amount_paid: req.body.totalAmountPaid, customer_number: req.body.customerNumber, product_code: req.body.productCode });
    return res.status(201).json({ message: "Sale added successfully." });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Sale already exists." });
    }
    return res.status(500).json({ message: "Failed to add sale." });
  }
};

export const getAll = async (_req, res) => {
  try {
    const rows = await Sale.find().sort({ invoice_number: -1 }).lean();
    return res.json(rows.map((r) => { const { _id, __v, ...rest } = r; return rest; }));
  } catch {
    return res.status(500).json({ message: "Failed to fetch sale records." });
  }
};

export const update = async (req, res) => {
  try {
    if (req.body.invoiceNumber === undefined || req.body.invoiceNumber === "") return res.status(400).json({ message: "Invoice Number is required." });
    if (req.body.salesDate === undefined || req.body.salesDate === "") return res.status(400).json({ message: "Sales Date is required." });
    if (req.body.paymentMethod === undefined || req.body.paymentMethod === "") return res.status(400).json({ message: "Payment Method is required." });
    if (req.body.totalAmountPaid === undefined || req.body.totalAmountPaid === "") return res.status(400).json({ message: "Total Amount is required." });
    if (req.body.customerNumber === undefined || req.body.customerNumber === "") return res.status(400).json({ message: "Customer Number is required." });
    if (req.body.productCode === undefined || req.body.productCode === "") return res.status(400).json({ message: "Product Code is required." });
    const customer = await Customer.findOne({ customer_number: req.body.customerNumber });
    if (!customer) return res.status(400).json({ message: "Selected customer does not exist." });
    const product = await Product.findOne({ product_code: req.body.productCode });
    if (!product) return res.status(400).json({ message: "Selected product does not exist." });
    const updated = await Sale.findOneAndUpdate(
      { invoice_number: req.params.id },
      { invoice_number: req.body.invoiceNumber, sales_date: req.body.salesDate, payment_method: req.body.paymentMethod, total_amount_paid: req.body.totalAmountPaid, customer_number: req.body.customerNumber, product_code: req.body.productCode },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Sale not found." });
    }
    return res.json({ message: "Sale updated successfully." });
  } catch {
    return res.status(500).json({ message: "Failed to update sale." });
  }
};

export const remove = async (req, res) => {
  try {
    const deleted = await Sale.findOneAndDelete({ invoice_number: req.params.id });
    if (!deleted) {
      return res.status(404).json({ message: "Sale not found." });
    }
    return res.json({ message: "Sale deleted successfully." });
  } catch {
    return res.status(500).json({ message: "Failed to delete sale." });
  }
};
