import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const DEFAULT_DEV_PORT = 5173;
const DEFAULT_API_PROXY = 'http://localhost:5000';

export default defineConfig(({ mode }) => {
  const rootEnv = loadEnv(mode, process.cwd(), '');

  const port =
    Number(
      rootEnv.VITE_DEV_SERVER_PORT ||
        rootEnv.SFMS_FRONTEND_PORT ||
        `${DEFAULT_DEV_PORT}`
    ) || DEFAULT_DEV_PORT;

  const proxyTarget =
    rootEnv.VITE_API_PROXY_TARGET ||
    rootEnv.VITE_BACKEND_URL ||
    DEFAULT_API_PROXY;

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
