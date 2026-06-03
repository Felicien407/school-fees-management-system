import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const ADMIN_HASH = "$2b$10$aULsUjp9bb9lf5CZZyY.7./KhwsocVO0duyPlqu0Qnte75xHBdG5C";

export const connectDatabase = async () => {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/smartshop_db");
  const count = await User.countDocuments();
  if (count === 0) {
    await User.create({
      username: "admin",
      email: "admin@exam.local",
      password: ADMIN_HASH,
      role: "admin",
    });
  }
};

export default mongoose;
