const mongoose = require("mongoose");

const stockOutSchema = new mongoose.Schema(
  {
    sparePart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SparePart",
      required: true,
    },
    stockOutQuantity: { type: Number, required: true, min: 1 },
    stockOutUnitPrice: { type: Number, required: true, min: 0 },
    stockOutTotalPrice: { type: Number, required: true, min: 0 },
    stockOutDate: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StockOut", stockOutSchema);
