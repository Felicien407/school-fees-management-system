import express from "express";
import cors from "cors";
import { query } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import saleRoutes from "./routes/saleRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import authMiddleware from "./middleware/authMiddleware.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "SMS API" });
});

app.get("/api/health/database", async (_req, res) => {
  try {
    await query("SELECT 1");
    res.json({
      status: "ok",
      database: "running",
      message: "Database is running.",
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[DB HEALTH CHECK] Database check failed.");
    // eslint-disable-next-line no-console
    console.error(`[DB HEALTH CHECK] Code: ${error?.code || "UNKNOWN"}`);
    // eslint-disable-next-line no-console
    console.error(`[DB HEALTH CHECK] Message: ${error?.message || "No message provided."}`);
    res.status(503).json({
      status: "error",
      database: "not running",
      message: "Database is not running or connection failed.",
      errorCode: error?.code || "UNKNOWN",
      errorReason: error?.message || "No reason provided.",
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/products", authMiddleware, productRoutes);
app.use("/api/customers", authMiddleware, customerRoutes);
app.use("/api/sales", authMiddleware, saleRoutes);
app.use("/api/reports", authMiddleware, reportRoutes);

app.use((error, _req, res, _next) => {
  const message = error?.message || "Server error";
  res.status(500).json({ message });
});

export default app;
