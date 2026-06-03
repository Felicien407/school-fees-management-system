/** Central env with fallbacks (||) so missing vars degrade to safe defaults where possible. */

const DEFAULT_BACKEND_PORT = 5000;

function parsePort(raw, fallback) {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export const env = {
  port: parsePort(
    process.env.PORT || process.env.SFMS_BACKEND_PORT,
    DEFAULT_BACKEND_PORT
  ),
  mongodbUri:
    process.env.MONGODB_URI?.trim() ||
    process.env.MONGO_URL?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    '',
  jwtSecret:
    process.env.JWT_SECRET?.trim() ||
    process.env.JWT_INGUFU?.trim() ||
    '',
  nodeEnv: process.env.NODE_ENV || 'development',
};

export function requireMongoUri() {
  if (!env.mongodbUri) {
    console.error(
      'Missing MongoDB connection string. Set MONGODB_URI (or MONGO_URL / DATABASE_URL) in .env'
    );
    process.exit(1);
  }
  return env.mongodbUri;
}
