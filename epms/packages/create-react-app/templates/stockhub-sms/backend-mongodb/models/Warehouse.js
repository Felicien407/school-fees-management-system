import mongoose from "mongoose";


const schema = new mongoose.Schema({
  warehouse_code: { type: String, required: true, unique: true },
  warehouse_name: { type: String, required: true },
  warehouse_location: { type: String, required: true }
}, { collection: "warehouses" });



export default mongoose.model("Warehouse", schema);
