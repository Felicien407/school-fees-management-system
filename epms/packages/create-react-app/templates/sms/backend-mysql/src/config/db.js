import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
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
    
    console.log("[DB] Connection successful. Database is running.");
    return { ok: true };
  } catch (error) {
   
    console.error("[DB] CONNECTION FAILED");
   
    console.error(`[DB] Error code: ${error?.code || "UNKNOWN"}`);
  
    console.error(`[DB] Error message: ${error?.message || "No message provided."}`);

    console.error(`[DB] Reason: ${getFailureReason(error)}`);
    return { ok: false, error, reason: getFailureReason(error) };
  }
};

export default pool;
