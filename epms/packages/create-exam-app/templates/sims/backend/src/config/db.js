const mongoose = require("mongoose");

const connectDatabase = async () => {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sims";
  await mongoose.connect(mongoUri);
  console.log("MongoDB connected (SIMS database)");
};

module.exports = connectDatabase;
