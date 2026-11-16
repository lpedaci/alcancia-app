import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * The landing on a phone (D-324): a menu with the sections and the main action, and a sticky action
 * at the bottom that shows up once the hero is behind and hides where the journeys are.
 */
test('landing on a phone: menu and sticky action @ 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/#/');
  const sticky = page.locator('[data-sticky-journey]');
  await expect(sticky).toHaveAttribute('aria-hidden', 'true');
  await page.getByRole('button', { name: 'Abrir el menú' }).click();
  const menu = page.getByRole('dialog', { name: 'Menú' });
  await expect(menu).toBeVisible();
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  expect(result.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  await page.keyboard.press('Escape');
  await page.mouse.wheel(0, 1800);
  await expect(sticky).toHaveAttribute('aria-hidden', 'false');
  await page.locator('#recorridos').scrollIntoViewIfNeeded();
  await expect(sticky).toHaveAttribute('aria-hidden', 'true');
});
