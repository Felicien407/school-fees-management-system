import mongoose from "mongoose";


const schema = new mongoose.Schema({
  supplier_code: { type: String, required: true, unique: true },
  supplier_name: { type: String, required: true },
  telephone: { type: String, required: true },
  address: { type: String, required: true },
  email: { type: String, required: true }
}, { collection: "suppliers" });



export default mongoose.model("Supplier", schema);
