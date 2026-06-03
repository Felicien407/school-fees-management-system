const DEFAULT_BACKEND_PORT = 5000;

function parsePort(raw, fallback) {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export const env = {
  port: parsePort(process.env.PORT || process.env.SFMS_BACKEND_PORT, DEFAULT_BACKEND_PORT),
  jwtSecret: process.env.JWT_SECRET?.trim() || process.env.JWT_INGUFU?.trim() || '',
  nodeEnv: process.env.NODE_ENV || 'development',
};

export function requireJwtSecret() {
  if (!env.jwtSecret) {
    console.error('Missing JWT_SECRET in .env');
    process.exit(1);
  }
  return env.jwtSecret;
}
