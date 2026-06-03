function parsePort(raw, fallback) {
  const n = Number(String(raw || "").trim());
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function getEnv() {
  const mongoUri =
    process.env.MONGO_URI?.trim() ||
    process.env.MONGODB_URI?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    "mongodb://127.0.0.1:27017/lms";

  return {
    port: parsePort(process.env.PORT || process.env.LMS_BACKEND_PORT, 5827),
    mongoUri,
    sessionSecret:
      process.env.SESSION_SECRET?.trim() ||
      process.env.LMS_SESSION_SECRET?.trim() ||
      "lms-dev-session-secret-change-in-production",
    frontendUrl:
      process.env.FRONTEND_URL?.trim() ||
      process.env.LMS_FRONTEND_URL?.trim() ||
      "http://localhost:5828",
    nodeEnv: process.env.NODE_ENV || "development",
  };
}

module.exports = { getEnv };
