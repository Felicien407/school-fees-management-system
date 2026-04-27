const mongoose = require("mongoose");

const sparePartSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

// Helps satisfy “duplicate data entry is eliminated” (assessment checklist 2.12)
sparePartSchema.index({ name: 1, category: 1 }, { unique: true });

module.exports = mongoose.model("SparePart", sparePartSchema);
