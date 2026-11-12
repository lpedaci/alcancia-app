import { expect, test } from '@playwright/test';

/**
 * D-157 (WCAG 2.2.2) on a touch screen: the hero phone rotates on its own and a floating pause
 * button, with a 48 × 48 px target, stops it. Motion is allowed here on purpose: with reduced
 * motion the phone does not rotate and the button is not shown.
 */
test.use({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true, reducedMotion: 'no-preference' });

test('touch: the pause button exists, has a 48 × 48 px target and stops the rotation', async ({ page }) => {
  test.setTimeout(40_000);
  await page.goto('/#/');
  const phone = page.getByRole('img', { name: /^Pantalla de la billetera de práctica en un celular/ });
  const pause = page.getByRole('button', { name: 'Pausar animación' });
  await expect(pause).toBeVisible();
  await expect(pause).toHaveAttribute('aria-pressed', 'false');

  const box = await pause.boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(48);
  expect(box!.height).toBeGreaterThanOrEqual(48);

  // It rotates on its own (6 s per screen).
  const first = await phone.getAttribute('aria-label');
  await expect.poll(() => phone.getAttribute('aria-label'), { timeout: 9_000 }).not.toBe(first);

  // Tapping the button stops it: the screen stays the same for longer than a full turn.
  await pause.tap();
  const resume = page.getByRole('button', { name: 'Reanudar animación' });
  await expect(resume).toHaveAttribute('aria-pressed', 'true');
  const stopped = await phone.getAttribute('aria-label');
  await page.waitForTimeout(7_000);
  expect(await phone.getAttribute('aria-label')).toBe(stopped);
});

test('touch with reduced motion: no rotation and no button', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/#/');
  await page.locator('h1').waitFor();
  await expect(page.getByRole('button', { name: 'Pausar animación' })).toHaveCount(0);
  await context.close();
});
