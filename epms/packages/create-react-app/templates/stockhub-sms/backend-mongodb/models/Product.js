import mongoose from "mongoose";


const schema = new mongoose.Schema({
  product_code: { type: String, required: true, unique: true },
  product_name: { type: String, required: true },
  category: { type: String, required: true },
  quantity_in_stock: { type: Number, required: true },
  unit_price: { type: Number, required: true },
  supplier_name: { type: String, required: true },
  date_received: { type: Date, required: true }
}, { collection: "products" });



export default mongoose.model("Product", schema);
