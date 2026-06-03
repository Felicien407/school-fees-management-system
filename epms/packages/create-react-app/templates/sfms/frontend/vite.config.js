import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_DEV_PORT = 5173;
const DEFAULT_API_PORT = 5000;

/** Read PORT from backend-mysql or backend-mongodb .env */
function backendPortFromEnvFile() {
  for (const dir of ['backend-mysql', 'backend-mongodb']) {
    const envPath = path.join(__dirname, `../${dir}/.env`);
    if (!fs.existsSync(envPath)) continue;
    try {
      const text = fs.readFileSync(envPath, 'utf8');
      const portLine = text
        .split('\n')
        .map((line) => line.trim())
        .find((line) => line.startsWith('PORT=') || line.startsWith('SFMS_BACKEND_PORT='));
      if (!portLine) continue;
      const n = Number(portLine.split('=')[1]?.trim());
      if (Number.isFinite(n) && n > 0) return n;
    } catch {
      /* try next */
    }
  }
  return null;
}

export default defineConfig(({ mode }) => {
  const rootEnv = loadEnv(mode, process.cwd(), '');

  const port =
    Number(
      rootEnv.VITE_DEV_SERVER_PORT ||
        rootEnv.SFMS_FRONTEND_PORT ||
        `${DEFAULT_DEV_PORT}`
    ) || DEFAULT_DEV_PORT;

  const fromBackendEnv = backendPortFromEnvFile();
  const proxyTarget =
    rootEnv.VITE_API_PROXY_TARGET ||
    rootEnv.VITE_BACKEND_URL ||
    (fromBackendEnv ? `http://localhost:${fromBackendEnv}` : `http://localhost:${DEFAULT_API_PORT}`);

  return {
    plugins: [react()],
    server: {
      port,
      strictPort: true,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
