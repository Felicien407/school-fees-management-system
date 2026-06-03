import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, default: 0, min: 0 },
  price: { type: Number, required: true, min: 0 },
}, { timestamps: { createdAt: "createdAt", updatedAt: false } });

export default mongoose.model("Product", productSchema);
