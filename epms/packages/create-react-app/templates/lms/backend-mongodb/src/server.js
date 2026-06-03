const express = require("express");
const cors = require("cors");
const session = require("express-session");
const connectMongo = require("connect-mongo");
const dotenv = require("dotenv");

dotenv.config();

const { getEnv } = require("./config/env");
const connectDatabase = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const bookRoutes = require("./routes/bookRoutes");
const borrowRoutes = require("./routes/borrowRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reportRoutes = require("./routes/reportRoutes");
const ensureSeedData = require("./ensureSeedData");

const env = getEnv();
const app = express();
const MongoStore = connectMongo.default || connectMongo.MongoStore || connectMongo;

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  })
);
app.use(express.json());

app.use(
  session({
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: env.mongoUri }),
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 8,
    },
  })
);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, app: "LMS" });
});

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/borrows", borrowRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);

connectDatabase()
  .then(() => ensureSeedData())
  .then(() => {
    app.listen(env.port, () => {
      console.log(`LMS API on http://localhost:${env.port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start:", err.message);
    process.exit(1);
  });
