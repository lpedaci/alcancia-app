import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';
import { PAGES, prepareSession } from './pages';

/**
 * Lesson builder (F14, D-317): the tutor writes a lesson for one of his cohorts, the missing parts are
 * pointed out before publishing, and once published it is in the list. axe and no overflow at a phone
 * and a desktop width.
 */
const axe = async (page: Page) => {
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  expect(result.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
};

for (const width of [375, 1280]) {
  test(`a tutor builds and publishes a lesson @ ${width}px`, async ({ page }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width, height: 900 });
    await prepareSession(page, PAGES.find((p) => p.id === 't6-lessons')!);
    await page.goto('/#/tutor/lessons');
    await expect(page.getByText('Cuotas del centro de distribución')).toBeVisible();
    await page.getByRole('button', { name: 'Nueva lección' }).click();
    await page.getByRole('button', { name: 'Publicar' }).click();
    await expect(page.getByText('Para publicar falta')).toBeVisible();
    await axe(page);

    await page.getByLabel('Título (obligatorio)').fill('Separar antes de gastar');
    await page.getByLabel('Módulo (obligatorio)').selectOption({ label: 'Módulo 3: Presupuesto y gastos hormiga' });
    await page.getByLabel('Operaciones', { exact: false }).first().check();
    await page.getByLabel('Objetivo', { exact: true }).fill('Al terminar vas a poder separar el ahorro apenas cobras.');
    await page.getByLabel('Título', { exact: true }).fill('Primero el ahorro');
    await page.getByLabel('Texto', { exact: true }).fill('Si separas apenas cobras, el ahorro no depende de lo que sobre.');
    await page.getByRole('button', { name: 'Agregar bloque' }).click();
    await page.getByRole('menuitem', { name: /Pregunta de práctica/ }).click();
    await page.getByLabel('Pregunta', { exact: true }).fill('¿Cuándo conviene separar el ahorro?');
    await page.getByLabel('Opción 1', { exact: true }).fill('Apenas cobro');
    await page.getByLabel('Opción 2', { exact: true }).fill('A fin de mes');
    await page.getByLabel('Si acierta').fill('Así es: el ahorro sale primero.');
    await page.getByLabel('Si no acierta').fill('A fin de mes muchas veces no sobra nada.');
    await axe(page);
    await page.getByRole('button', { name: 'Publicar' }).click();
    await expect(page.getByText('Separar antes de gastar')).toBeVisible();
    await expect(page.getByText('Publicada').first()).toBeVisible();
    await axe(page);
    await page.screenshot({ path: `docs/screenshots/authoring-${width}.jpg`, fullPage: true, quality: 70, type: 'jpeg' });
  });
}

// D-318: the complex types, here a case with decisions, are written with plain fields and published
test('a tutor writes a case with decisions @ 375px', async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 375, height: 900 });
  await prepareSession(page, PAGES.find((p) => p.id === 't6-lessons')!);
  await page.goto('/#/tutor/lessons');
  await page.getByRole('button', { name: 'Nueva lección' }).click();
  await page.getByLabel('Título (obligatorio)').fill('El préstamo de fin de año');
  await page.getByLabel('Módulo (obligatorio)').selectOption({ label: 'Módulo 5: El orden importa' });
  await page.getByLabel('Operaciones', { exact: false }).first().check();
  await page.getByLabel('Objetivo', { exact: true }).fill('Al terminar vas a poder decidir ante una oferta de préstamo mirando el CFT.');
  await page.getByLabel('Título', { exact: true }).fill('Antes de firmar');
  await page.getByLabel('Texto', { exact: true }).fill('El costo financiero total dice cuánto pagas en realidad.');
  await page.getByRole('button', { name: 'Agregar bloque' }).click();
  await page.getByRole('menuitem', { name: /Pregunta de práctica/ }).click();
  await page.getByLabel('Tipo de pregunta').selectOption({ label: 'Caso con decisiones' });
  await page.getByLabel('Pregunta', { exact: true }).fill('¿Qué haces con la oferta?');
  const situations = page.getByLabel('Situación');
  await situations.nth(0).fill('Te ofrecen un préstamo con una cuota baja.');
  await situations.nth(1).fill('El CFT es más del doble de la TNA.');
  for (const [i, good, bad, why] of [
    [0, 'Busco el CFT', 'Lo acepto ya', 'Sin el CFT no sabes cuánto vas a pagar.'],
    [1, 'Lo rechazo', 'Lo tomo igual', 'Pagarías mucho más de lo que pediste.'],
  ] as const) {
    await page.getByLabel('Decisión que sigue').nth(i).fill(good);
    await page.getByLabel('Decisión que termina el caso').nth(i).fill(bad);
    await page.getByLabel('Qué pasa si elige esa').nth(i).fill(why);
  }
  await page.getByLabel('Cierre del caso').fill('Decidiste con el costo total a la vista.');
  await axe(page);
  await page.getByRole('button', { name: 'Publicar' }).click();
  await expect(page.getByText('El préstamo de fin de año')).toBeVisible();
});
