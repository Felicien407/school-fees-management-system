import Shipment from "../models/Shipment.js";
import Supplier from "../models/Supplier.js";

export const create = async (req, res) => {
  try {
    if (req.body.shipmentNumber === undefined || req.body.shipmentNumber === "") return res.status(400).json({ message: "Shipment Number is required." });
    if (req.body.shipmentDate === undefined || req.body.shipmentDate === "") return res.status(400).json({ message: "Shipment Date is required." });
    if (req.body.shipmentStatus === undefined || req.body.shipmentStatus === "") return res.status(400).json({ message: "Status is required." });
    if (req.body.destination === undefined || req.body.destination === "") return res.status(400).json({ message: "Destination is required." });
    if (req.body.supplierCode === undefined || req.body.supplierCode === "") return res.status(400).json({ message: "Supplier Code is required." });
    const supplier = await Supplier.findOne({ supplier_code: req.body.supplierCode });
    if (!supplier) return res.status(400).json({ message: "Selected supplier does not exist." });
    await Shipment.create({ shipment_number: req.body.shipmentNumber, shipment_date: req.body.shipmentDate, shipment_status: req.body.shipmentStatus, destination: req.body.destination, supplier_code: req.body.supplierCode });
    return res.status(201).json({ message: "Shipment added successfully." });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Shipment already exists." });
    }
    return res.status(500).json({ message: "Failed to add shipment." });
  }
};

export const getAll = async (_req, res) => {
  try {
    const rows = await Shipment.find().sort({ shipment_number: -1 }).lean();
    return res.json(rows.map((r) => { const { _id, __v, ...rest } = r; return rest; }));
  } catch {
    return res.status(500).json({ message: "Failed to fetch shipment records." });
  }
};

export const update = async (req, res) => {
  try {
    if (req.body.shipmentNumber === undefined || req.body.shipmentNumber === "") return res.status(400).json({ message: "Shipment Number is required." });
    if (req.body.shipmentDate === undefined || req.body.shipmentDate === "") return res.status(400).json({ message: "Shipment Date is required." });
    if (req.body.shipmentStatus === undefined || req.body.shipmentStatus === "") return res.status(400).json({ message: "Status is required." });
    if (req.body.destination === undefined || req.body.destination === "") return res.status(400).json({ message: "Destination is required." });
    if (req.body.supplierCode === undefined || req.body.supplierCode === "") return res.status(400).json({ message: "Supplier Code is required." });
    const supplier = await Supplier.findOne({ supplier_code: req.body.supplierCode });
    if (!supplier) return res.status(400).json({ message: "Selected supplier does not exist." });
    const updated = await Shipment.findOneAndUpdate(
      { shipment_number: req.params.id },
      { shipment_number: req.body.shipmentNumber, shipment_date: req.body.shipmentDate, shipment_status: req.body.shipmentStatus, destination: req.body.destination, supplier_code: req.body.supplierCode },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Shipment not found." });
    }
    return res.json({ message: "Shipment updated successfully." });
  } catch {
    return res.status(500).json({ message: "Failed to update shipment." });
  }
};

export const remove = async (req, res) => {
  try {
    const deleted = await Shipment.findOneAndDelete({ shipment_number: req.params.id });
    if (!deleted) {
      return res.status(404).json({ message: "Shipment not found." });
    }
    return res.json({ message: "Shipment deleted successfully." });
  } catch {
    return res.status(500).json({ message: "Failed to delete shipment." });
  }
};