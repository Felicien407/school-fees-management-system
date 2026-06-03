import mongoose from "mongoose";

const schema = new mongoose.Schema({
  employee_id: { type: Number, required: true, unique: true },
  emp_first_name: { type: String, required: true },
  emp_last_name: { type: String, required: true },
  emp_gender: { type: String, required: true, enum: ["Male", "Female"] },
  emp_date_of_birth: { type: Date, required: true },
  emp_email: { type: String, required: true, unique: true, lowercase: true },
  emp_telephone: { type: String, required: true },
  emp_address: { type: String, required: true },
  emp_hire_date: { type: Date, required: true },
  emp_status: { type: String, required: true, enum: ["On Leave", "Left", "Blacklisted", "Deceased", "On Mission"] },
  department_id: { type: Number, required: true },
  position_id: { type: Number, required: true },
}, { collection: "employees" });

export default mongoose.model("Employee", schema);
