import { expect, test } from '@playwright/test';
import { PAGES, prepareSession } from './pages';

/**
 * CLAUDE.md 8.2 on the production build (D-200): the page carries the Content Security Policy and
 * no screen breaks it. A violation means a script, style, image or connection the policy blocks,
 * which would fail silently for visitors.
 */
const DEV_ONLY = new Set(['styleguide']);

test('the published page carries the Content Security Policy and the referrer policy', async ({ page }) => {
  await page.goto('/');
  const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
  expect(csp).toContain("script-src 'self'");
  expect(csp).toContain("object-src 'none'");
  expect(csp).not.toMatch(/script-src[^;]*unsafe/);
  await expect(page.locator('meta[name="referrer"]')).toHaveAttribute('content', 'strict-origin-when-cross-origin');
});

for (const target of PAGES.filter((p) => !DEV_ONLY.has(p.id))) {
  test(`${target.id} runs under the CSP without violations or errors`, async ({ page }) => {
    const problems: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') problems.push(`console: ${msg.text()}`);
    });
    page.on('pageerror', (error) => problems.push(`page error: ${error.message}`));
    await page.addInitScript(() => {
      document.addEventListener('securitypolicyviolation', (e) => {
        console.error(`CSP violation: ${e.violatedDirective} blocked ${e.blockedURI || 'inline'}`);
      });
    });
    await prepareSession(page, target);
    await page.goto(target.path);
    await page.locator('h1').first().waitFor();
    // Lazy chunks, charts and fonts load while scrolling.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 30));
      }
    });
    await page.waitForTimeout(300);
    expect(problems).toEqual([]);
  });
}

test('the indexing files are published (CLAUDE.md 15)', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://lpedaci.github.io/alcancia-app/');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /og-image\.png$/);
  for (const file of ['favicon.svg', 'manifest.webmanifest', 'og-image.png', 'robots.txt', 'sitemap.xml']) {
    const response = await request.get(`/${file}`);
    expect(response.status(), file).toBe(200);
  }
  const structured = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}');
  expect(structured['@type']).toBe('WebApplication');
});
