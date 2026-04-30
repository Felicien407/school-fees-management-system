import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const DEFAULT_WEB = 5828;
const DEFAULT_API = 5827;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port =
    Number(env.VITE_DEV_SERVER_PORT || env.LMS_FRONTEND_PORT || String(DEFAULT_WEB)) ||
    DEFAULT_WEB;
  const proxyTarget =
    env.VITE_API_PROXY_TARGET || env.LMS_API_URL || `http://localhost:${DEFAULT_API}`;

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port,
      strictPort: true,
      proxy: {
        "/api": { target: proxyTarget, changeOrigin: true },
      },
    },
  };
});
