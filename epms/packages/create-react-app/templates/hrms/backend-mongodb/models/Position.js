import mongoose from "mongoose";

const schema = new mongoose.Schema({
  position_id: { type: Number, required: true, unique: true },
  pos_name: { type: String, required: true, unique: true },
  required_qualification: { type: String, required: true },
}, { collection: "positions" });

export default mongoose.model("Position", schema);
