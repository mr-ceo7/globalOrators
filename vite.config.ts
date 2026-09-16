/// <reference types="vitest" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';


export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      allowedHosts: true as const,
      port: 3000,
      host: '0.0.0.0',
      headers: {
        // Google Identity Services (GSI) requires this header so the sign-in
        // popup can postMessage credentials back to the opener window.
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      },
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8005',
          changeOrigin: true,
        },
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler') || id.includes('framer-motion') || id.includes('motion')) {
                return 'vendor-framework';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              return 'vendor-utils';
            }
            if (id.includes('/src/components/clientApp/')) {
              return 'portal-speaker';
            }
            if (id.includes('/src/components/landing/')) {
              return 'portal-landing';
            }
            if (id.includes('/src/components/onboarding/')) {
              return 'portal-onboarding';
            }
            if (id.includes('/src/components/programs/') || id.includes('/src/components/clients/') || id.includes('/src/components/dashboard/') || id.includes('/src/components/messenger/') || id.includes('/src/components/progress/')) {
              return 'portal-coach';
            }
          }
        }
      }
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      testTimeout: 30000,
    },
  };
});

