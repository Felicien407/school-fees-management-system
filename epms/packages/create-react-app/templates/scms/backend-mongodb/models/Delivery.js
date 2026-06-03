import mongoose from "mongoose";


const schema = new mongoose.Schema({
  delivery_code: { type: String, required: true, unique: true },
  delivery_date: { type: Date, required: true },
  quantity_delivered: { type: Number, required: true },
  delivery_status: { type: String, required: true },
  shipment_number: { type: String, required: true }
}, { collection: "deliveries" });



export default mongoose.model("Delivery", schema);
