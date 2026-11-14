import { expect, type Page, test } from '@playwright/test';
import { PAGES, prepareSession, WIDTHS } from './pages';

/**
 * D-215: Fuerte never covers content of the wallet. From 600 px the page keeps a free lane on his side,
 * so nothing is under him at any scroll position. On phones he floats over the content while it
 * scrolls, like any floating button, but nothing ends hidden under him at the end of the page.
 */
const WALLET = PAGES.filter((p) => (p.as === 'p-mariana' || p.as === 'p-diego') && !p.noConsent && p.id !== 'g7-forbidden');

/** Texts and controls of the page that intersect Fuerte's button (and are not inside an overlay). */
async function covered(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const fab = document.querySelector<HTMLElement>('[data-fuerte-fab]');
    if (!fab) return [];
    const f = fab.getBoundingClientRect();
    const hits: string[] = [];
    const candidates = document.querySelectorAll<HTMLElement>('main a, main button, main input, main select, main textarea, main label, main h1, main h2, main h3, main p, main li, main dd, main dt, main td, main th, main span');
    for (const el of candidates) {
      // Only the innermost text or a control: a big card that merely contains something is not "covered".
      const control = el.matches('a, button, input, select, textarea');
      const text = [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? '').trim().length > 0);
      if (!control && !text) continue;
      const style = getComputedStyle(el);
      if (style.visibility === 'hidden' || style.display === 'none' || Number(style.opacity) === 0) continue;
      for (const r of el.getClientRects()) {
        const x = Math.min(r.right, f.right) - Math.max(r.left, f.left);
        const y = Math.min(r.bottom, f.bottom) - Math.max(r.top, f.top);
        if (x > 2 && y > 2 && r.width > 0 && r.height > 0) {
          hits.push(`${el.tagName.toLowerCase()} "${(el.textContent ?? '').trim().slice(0, 40)}"`);
          break;
        }
      }
    }
    return hits;
  });
}

for (const target of WALLET) {
  for (const width of WIDTHS) {
    test(`${target.id} @ ${width}px: Fuerte covers no content`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await prepareSession(page, target);
      await page.goto(target.path);
      await page.locator('h1').first().waitFor();
      const fab = page.locator('[data-fuerte-fab]');
      if ((await fab.count()) === 0) return;
      await page.waitForTimeout(400);
      if (width >= 600) expect(await covered(page), 'at the top').toEqual([]);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(300);
      expect(await covered(page), 'at the end of the page').toEqual([]);
    });
  }
}
