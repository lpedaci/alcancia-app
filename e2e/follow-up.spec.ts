import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { PAGES, prepareSession } from './pages';

/**
 * 30-day follow-up (F15, D-316): Mariana started on 07/08/2026, so the reminder is in her bell and
 * the three questions can be answered; a missing answer is pointed out next to its question.
 */
for (const width of [375, 1280]) {
  test(`30-day follow-up from the reminder to the saved answers @ ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await prepareSession(page, PAGES.find((p) => p.id === 'p9-follow-up-mariana')!);
    await page.goto('/#/app/learn/follow-up');
    await expect(page.getByRole('heading', { name: '¿Qué aplicaste en estos 30 días?' })).toBeVisible();
    await page.getByRole('group', { name: /presupuesto/ }).getByLabel('Sí').check();
    await page.getByRole('button', { name: 'Enviar respuestas' }).click();
    await expect(page.getByText('Elige una opción.').first()).toBeVisible();
    await page.getByRole('group', { name: /fondo de emergencia/ }).getByLabel('Sí').check();
    await page.getByRole('group', { name: /total de la tarjeta/ }).getByLabel('No').check();
    await page.getByRole('button', { name: 'Enviar respuestas' }).click();
    await expect(page.getByText('Respuestas guardadas')).toBeVisible();
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    expect(result.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
    await page.screenshot({ path: `docs/screenshots/follow-up-${width}.jpg`, fullPage: true, quality: 70, type: 'jpeg' });
  });
}
