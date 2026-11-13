/**
 * Screenshots the dev-only /og-image page (src/features/og-image) into public/og-image.png,
 * 1200 × 630 (CLAUDE.md 15). Needs the dev server running: `npm run dev`, then `npm run og-image`.
 * Optional argument: the dev server URL (default http://localhost:5173).
 */
import { chromium } from '@playwright/test';

const base = process.argv[2] ?? 'http://localhost:5173';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, reducedMotion: 'reduce', locale: 'es-AR' });
await page.goto(`${base}/#/og-image`);
await page.locator('#og-image').waitFor();
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);
await page.locator('#og-image').screenshot({ path: 'public/og-image.png' });
await browser.close();
console.log('public/og-image.png written');
