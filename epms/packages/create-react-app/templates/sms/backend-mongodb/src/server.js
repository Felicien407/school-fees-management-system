import dotenv from "dotenv";
import app from "./app.js";
import { connectDatabase } from "./config/db.js";

dotenv.config();

const PORT = Number(process.env.PORT || 5000);

connectDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`SMS MongoDB backend running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  });
