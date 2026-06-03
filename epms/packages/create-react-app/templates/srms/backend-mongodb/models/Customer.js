import mongoose from "mongoose";


const schema = new mongoose.Schema({
  customer_number: { type: String, required: true, unique: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  telephone: { type: String, required: true },
  address: { type: String, required: true }
}, { collection: "customers" });



export default mongoose.model("Customer", schema);
