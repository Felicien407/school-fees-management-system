const mongoose = require("mongoose");

const borrowSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    borrowDate: { type: Date, required: true },
    returnDueDate: { type: Date, required: true },
    returnedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

borrowSchema.index({ student: 1, book: 1, returnedAt: 1 });

module.exports = mongoose.model("Borrow", borrowSchema);
