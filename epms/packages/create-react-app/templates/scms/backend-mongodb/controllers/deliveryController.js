import Delivery from "../models/Delivery.js";
import Shipment from "../models/Shipment.js";

export const create = async (req, res) => {
  try {
    if (req.body.deliveryCode === undefined || req.body.deliveryCode === "") return res.status(400).json({ message: "Delivery Code is required." });
    if (req.body.deliveryDate === undefined || req.body.deliveryDate === "") return res.status(400).json({ message: "Delivery Date is required." });
    if (req.body.quantityDelivered === undefined || req.body.quantityDelivered === "") return res.status(400).json({ message: "Quantity Delivered is required." });
    if (req.body.deliveryStatus === undefined || req.body.deliveryStatus === "") return res.status(400).json({ message: "Delivery Status is required." });
    if (req.body.shipmentNumber === undefined || req.body.shipmentNumber === "") return res.status(400).json({ message: "Shipment Number is required." });
    const shipment = await Shipment.findOne({ shipment_number: req.body.shipmentNumber });
    if (!shipment) return res.status(400).json({ message: "Selected shipment does not exist." });
    await Delivery.create({ delivery_code: req.body.deliveryCode, delivery_date: req.body.deliveryDate, quantity_delivered: req.body.quantityDelivered, delivery_status: req.body.deliveryStatus, shipment_number: req.body.shipmentNumber });
    return res.status(201).json({ message: "Delivery added successfully." });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Delivery already exists." });
    }
    return res.status(500).json({ message: "Failed to add delivery." });
  }
};

export const getAll = async (_req, res) => {
  try {
    const rows = await Delivery.find().sort({ delivery_code: -1 }).lean();
    return res.json(rows.map((r) => { const { _id, __v, ...rest } = r; return rest; }));
  } catch {
    return res.status(500).json({ message: "Failed to fetch delivery records." });
  }
};

export const update = async (req, res) => {
  try {
    if (req.body.deliveryCode === undefined || req.body.deliveryCode === "") return res.status(400).json({ message: "Delivery Code is required." });
    if (req.body.deliveryDate === undefined || req.body.deliveryDate === "") return res.status(400).json({ message: "Delivery Date is required." });
    if (req.body.quantityDelivered === undefined || req.body.quantityDelivered === "") return res.status(400).json({ message: "Quantity Delivered is required." });
    if (req.body.deliveryStatus === undefined || req.body.deliveryStatus === "") return res.status(400).json({ message: "Delivery Status is required." });
    if (req.body.shipmentNumber === undefined || req.body.shipmentNumber === "") return res.status(400).json({ message: "Shipment Number is required." });
    const shipment = await Shipment.findOne({ shipment_number: req.body.shipmentNumber });
    if (!shipment) return res.status(400).json({ message: "Selected shipment does not exist." });
    const updated = await Delivery.findOneAndUpdate(
      { delivery_code: req.params.id },
      { delivery_code: req.body.deliveryCode, delivery_date: req.body.deliveryDate, quantity_delivered: req.body.quantityDelivered, delivery_status: req.body.deliveryStatus, shipment_number: req.body.shipmentNumber },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Delivery not found." });
    }
    return res.json({ message: "Delivery updated successfully." });
  } catch {
    return res.status(500).json({ message: "Failed to update delivery." });
  }
};

export const remove = async (req, res) => {
  try {
    const deleted = await Delivery.findOneAndDelete({ delivery_code: req.params.id });
    if (!deleted) {
      return res.status(404).json({ message: "Delivery not found." });
    }
    return res.json({ message: "Delivery deleted successfully." });
  } catch {
    return res.status(500).json({ message: "Failed to delete delivery." });
  }
};