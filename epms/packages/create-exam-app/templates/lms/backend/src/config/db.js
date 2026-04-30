const mongoose = require("mongoose");
const { getEnv } = require("./env");

async function connectDatabase() {
  const { mongoUri } = getEnv();
  await mongoose.connect(mongoUri);
  console.log("MongoDB connected (LMS)");
}

module.exports = connectDatabase;
