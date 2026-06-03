import mongoose from "mongoose";
import Counter from "./Counter.js";

const schema = new mongoose.Schema({
  transaction_id: { type: Number, unique: true },
  transaction_date: { type: Date, required: true },
  quantity_moved: { type: Number, required: true },
  transaction_type: { type: String, required: true },
  product_code: { type: String, required: true },
  warehouse_code: { type: String, required: true }
}, { collection: "stock_transactions" });

schema.pre("save", async function () {
  if (this.isNew && (this.transaction_id === undefined || this.transaction_id === null)) {
    this.transaction_id = await Counter.getNext("transaction_id");
  }
});

export default mongoose.model("StockTransaction", schema);
