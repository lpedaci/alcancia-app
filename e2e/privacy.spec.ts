import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { PAGES, prepareSession } from './pages';

/**
 * Mi privacidad (F16, D-320): the person downloads her data and sends a request of deletion, which
 * shows its deadline of 5 business days (Ley 25.326): from Monday 16/11/2026, Monday 23/11/2026.
 */
for (const width of [375, 1280]) {
  test(`Mi privacidad: download and a deletion request with its deadline @ ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await prepareSession(page, PAGES.find((p) => p.id === 'p14-privacy-mariana')!);
    await page.goto('/#/app/profile/privacy');
    await expect(page.getByRole('heading', { name: 'Mi privacidad', level: 1 })).toBeVisible();
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Descargar mis datos' }).click();
    expect((await download).suggestedFilename()).toBe('alcancia-mis-datos-2026-11-16.json');
    await page.getByText('Borrado', { exact: true }).click();
    await expect(page.getByText('Si lo envías hoy, la respuesta llega hasta el 23/11/2026.')).toBeVisible();
    await page.getByRole('button', { name: 'Enviar pedido' }).click();
    await expect(page.getByText('Escribe al menos 10 caracteres.')).toBeVisible();
    await page.getByLabel('Detalle del pedido (obligatorio)').fill('Quiero que se borren mis consultas a la tutoría.');
    await page.getByRole('button', { name: 'Enviar pedido' }).click();
    await expect(page.getByText('Enviado el 16/11/2026 · respuesta hasta el 23/11/2026')).toBeVisible();
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    expect(result.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  });
}
