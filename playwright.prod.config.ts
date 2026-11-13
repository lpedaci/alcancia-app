import { defineConfig, devices } from '@playwright/test';

/**
 * Production-build checks (CLAUDE.md 8.2, D-200): the same files GitHub Pages serves, with the
 * Content Security Policy active. Run with `npm run test:e2e:prod`; the CI runs it before deploying.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: /prod-.*\.spec\.ts/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5198',
    reducedMotion: 'reduce',
    locale: 'es-AR',
    timezoneId: 'America/Argentina/Buenos_Aires',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // The CI builds first; locally, `npm run test:e2e:prod` builds before starting.
    command: 'npx vite preview --port 5198 --strictPort',
    url: 'http://localhost:5198',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
