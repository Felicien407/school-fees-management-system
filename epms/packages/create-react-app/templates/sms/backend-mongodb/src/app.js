import express from "express";
import cors from "cors";
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

app.use("/api/auth", authRoutes);
app.use("/api/products", authMiddleware, productRoutes);
app.use("/api/customers", authMiddleware, customerRoutes);
app.use("/api/sales", authMiddleware, saleRoutes);
app.use("/api/reports", authMiddleware, reportRoutes);

app.use((error, _req, res, _next) => {
  res.status(500).json({ message: error?.message || "Server error" });
});

export default app;
