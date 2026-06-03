import mongoose from "mongoose";


const schema = new mongoose.Schema({
  shipment_number: { type: String, required: true, unique: true },
  shipment_date: { type: Date, required: true },
  shipment_status: { type: String, required: true },
  destination: { type: String, required: true },
  supplier_code: { type: String, required: true }
}, { collection: "shipments" });



export default mongoose.model("Shipment", schema);
