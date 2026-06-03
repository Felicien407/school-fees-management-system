import mongoose from "mongoose";

const schema = new mongoose.Schema({
  user_id: { type: Number, required: true, unique: true },
  user_name: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  employee_id: { type: Number, default: null, unique: true, sparse: true },
}, { collection: "users" });

export default mongoose.model("User", schema);
