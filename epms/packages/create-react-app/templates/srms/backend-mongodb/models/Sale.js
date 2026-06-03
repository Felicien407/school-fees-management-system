import mongoose from "mongoose";


const schema = new mongoose.Schema({
  invoice_number: { type: String, required: true, unique: true },
  sales_date: { type: Date, required: true },
  payment_method: { type: String, required: true },
  total_amount_paid: { type: Number, required: true },
  customer_number: { type: String, required: true },
  product_code: { type: String, required: true }
}, { collection: "sales" });



export default mongoose.model("Sale", schema);
