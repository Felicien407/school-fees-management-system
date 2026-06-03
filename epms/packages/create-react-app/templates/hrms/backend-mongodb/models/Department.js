import mongoose from "mongoose";

const schema = new mongoose.Schema({
  department_id: { type: Number, required: true, unique: true },
  depart_name: { type: String, required: true, unique: true },
}, { collection: "departments" });

export default mongoose.model("Department", schema);
