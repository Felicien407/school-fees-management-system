import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  phoneNumber: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  address: { type: String, required: true, trim: true },
  registrationDate: { type: Date, default: Date.now },
});

export default mongoose.model("Customer", customerSchema);
