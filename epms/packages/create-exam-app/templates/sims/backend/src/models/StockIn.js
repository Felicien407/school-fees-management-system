const mongoose = require("mongoose");

const stockInSchema = new mongoose.Schema(
  {
    sparePart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SparePart",
      required: true,
    },
    stockInQuantity: { type: Number, required: true, min: 1 },
    stockInDate: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StockIn", stockInSchema);
