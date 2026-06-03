import app from "./app.js";
import { checkDatabaseConnection } from "./config/db.js";

const PORT = Number(process.env.PORT || 5000);

const startServer = async () => {
  const dbStatus = await checkDatabaseConnection();

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`SMS backend running on port ${PORT}`);
    if (!dbStatus.ok) {
      // eslint-disable-next-line no-console
      console.error("[SERVER] API started, but database connection failed.");
    }
  });
};

startServer();
