import { mergeConfig } from 'vite';
import base from '../vite.config';

// Isolated e2e frontend (default :3100) proxying to the throwaway backend (default :8105).
const frontendPort = Number(process.env.E2E_FRONTEND_PORT || 3100);
const backendPort = Number(process.env.E2E_BACKEND_PORT || 8105);

export default mergeConfig((base as any)({ mode: 'development', command: 'serve' }), {
  server: {
    port: frontendPort,
    strictPort: true,
    proxy: { '/api': { target: `http://127.0.0.1:${backendPort}`, changeOrigin: true } },
  },
});
