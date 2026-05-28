import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "student",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "smartshop_db",
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const getFailureReason = (error) => {
  const reasons = {
    ECONNREFUSED: "MySQL server is not started or host/port is wrong.",
    ER_ACCESS_DENIED_ERROR: "Invalid database username or password.",
    ER_BAD_DB_ERROR: "Database name does not exist.",
    ETIMEDOUT: "Database connection timed out.",
  };

  return reasons[error?.code] || "Unknown database connection issue.";
};

export const query = async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params);
  return rows;
};

export const checkDatabaseConnection = async () => {
  try {
    await query("SELECT 1");
    // eslint-disable-next-line no-console
    console.log("[DB] Connection successful. Database is running.");
    return { ok: true };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[DB] CONNECTION FAILED");
    // eslint-disable-next-line no-console
    console.error(`[DB] Error code: ${error?.code || "UNKNOWN"}`);
    // eslint-disable-next-line no-console
    console.error(`[DB] Error message: ${error?.message || "No message provided."}`);
    // eslint-disable-next-line no-console
    console.error(`[DB] Reason: ${getFailureReason(error)}`);
    return { ok: false, error, reason: getFailureReason(error) };
  }
};

export default pool;
