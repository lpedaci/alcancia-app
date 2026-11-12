/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import { CONTENT_SECURITY_POLICY } from './src/app/security.ts';

/**
 * Injects the Content Security Policy (src/app/security.ts) in the production build only:
 * in development, Vite needs inline scripts for hot reload.
 */
function securityMeta(): Plugin {
  return {
    name: 'alcancia-security-meta',
    apply: 'build',
    transformIndexHtml(html) {
      return {
        html,
        tags: [
          {
            tag: 'meta',
            attrs: { 'http-equiv': 'Content-Security-Policy', content: CONTENT_SECURITY_POLICY },
            injectTo: 'head-prepend',
          },
          {
            tag: 'meta',
            attrs: { name: 'referrer', content: 'strict-origin-when-cross-origin' },
            injectTo: 'head-prepend',
          },
        ],
      };
    },
  };
}

// `base: './'` keeps asset paths relative, so the build works on GitHub Pages under
// /alcancia-app/. The hash router handles client routes.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), securityMeta()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Stable, cacheable chunks (INC-03): the seed data, React and the UI libraries apart from the app code.
        manualChunks(id: string) {
          if (id.includes('src/data/seed.json')) return 'seed';
          if (/node_modules\/(react|react-dom|scheduler|react-router)\//.test(id)) return 'react';
          if (/node_modules\/(radix-ui|@radix-ui)\//.test(id)) return 'radix';
          if (/node_modules\/(i18next|react-i18next)\//.test(id)) return 'i18n';
          if (/node_modules\/(recharts|d3-[a-z-]+|victory-vendor|es-toolkit|@reduxjs|immer|reselect|redux)\//.test(id)) return 'charts';
          return undefined;
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: { include: [/tokens.css/] },
  },
});
