require("dotenv").config();
const mongoose = require("mongoose");
const { getEnv } = require("./config/env");
const ensureSeedData = require("./ensureSeedData");

async function main() {
  const { mongoUri } = getEnv();
  await mongoose.connect(mongoUri);
  await ensureSeedData();
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
