import mongoose from "mongoose";


const schema = new mongoose.Schema({
  product_code: { type: String, required: true, unique: true },
  product_name: { type: String, required: true },
  quantity_sold: { type: Number, required: true },
  unit_price: { type: Number, required: true }
}, { collection: "products" });



export default mongoose.model("Product", schema);
