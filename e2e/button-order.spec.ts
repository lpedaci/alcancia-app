import { expect, test } from '@playwright/test';
import { PAGES, prepareSession } from './pages';

/**
 * D-331: in a row of actions, the primary button (filled, or danger to confirm) goes on the right and
 * the secondary ones (tonal, outlined, text) on the left. Checked on every screen of the overflow suite
 * at a desktop and a tablet width, where the actions sit in one row (on phones they stack, D-308).
 */
for (const page of PAGES) {
  for (const width of [1280, 768]) {
    test(`${page.id} @ ${width}px keeps the primary action on the right`, async ({ page: browserPage }) => {
      await browserPage.setViewportSize({ width, height: 900 });
      await prepareSession(browserPage, page);
      await browserPage.goto(page.path);
      await browserPage.locator('h1').first().waitFor();

      const wrong = await browserPage.evaluate(() => {
        const visible = (el: Element) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden';
        };
        const primaries = [...document.querySelectorAll<HTMLElement>('[data-variant="filled"], [data-variant="danger"]')].filter(visible);
        const found: string[] = [];
        for (const primary of primaries) {
          // The design system and styleguide show the variants side by side as a catalog, not as a row of actions
          if (primary.closest('[data-button-catalog]')) continue;
          // The row is the closest flex row that holds the primary and another action (up to three levels up).
          let row: HTMLElement | null = primary.parentElement;
          for (let depth = 0; row && depth < 3; depth += 1, row = row.parentElement) {
            const style = getComputedStyle(row);
            if (style.display.includes('flex') && style.flexDirection.startsWith('row')) {
              const secondaries = [...row.querySelectorAll<HTMLElement>('[data-variant="tonal"], [data-variant="outlined"], [data-variant="text"]')].filter(visible);
              if (secondaries.length) {
                const p = primary.getBoundingClientRect();
                const sameLine = secondaries.filter((s) => {
                  const r = s.getBoundingClientRect();
                  return Math.abs(r.top + r.height / 2 - (p.top + p.height / 2)) < 12;
                });
                for (const s of sameLine) {
                  if (s.getBoundingClientRect().left > p.left) found.push(`"${primary.innerText.trim()}" left of "${s.innerText.trim()}"`);
                }
                break;
              }
            }
          }
        }
        return [...new Set(found)];
      });
      expect(wrong).toEqual([]);
    });
  }
}
