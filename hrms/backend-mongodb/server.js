import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import { connectDatabase } from "./config/db.js";
import auth from "./middleware/auth.js";
import authRoutes from "./routes/authRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import positionRoutes from "./routes/positionRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5555;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(
  session({
    name: "hrms.sid",
    secret: process.env.SESSION_SECRET || "dev_session_secret_change_in_production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 8 * 60 * 60 * 1000,
    },
  })
);

app.get("/api/health", (_req, res) => {
  res.json({ message: "HRMS API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", auth, dashboardRoutes);
app.use("/api/departments", auth, departmentRoutes);
app.use("/api/positions", auth, positionRoutes);
app.use("/api/employees", auth, employeeRoutes);
app.use("/api/users", auth, userRoutes);
app.use("/api/reports", auth, reportRoutes);

app.use((err, _req, res, _next) => {
  res.status(500).json({ message: err.message || "Server error" });
});

connectDatabase().then((ok) => {
  app.listen(PORT, () => {
    console.log(`HRMS server running on port ${PORT}`);
    if (!ok) console.log("Database Connection Failed");
  });
});
