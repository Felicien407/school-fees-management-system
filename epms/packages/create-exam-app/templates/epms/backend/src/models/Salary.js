const mongoose = require("mongoose");

const salarySchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    grossSalary: { type: Number, required: true, min: 0 },
    totalDeduction: { type: Number, required: true, min: 0 },
    netSalary: { type: Number, required: true, min: 0 },
    month: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Salary", salarySchema);
