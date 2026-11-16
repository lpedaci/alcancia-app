import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { PAGES, prepareSession } from './pages';

/** F10 (D-321): the glossary search ignores accents, and a module summary can be printed. */
test('glossary search without accents and a printable module summary @ 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await prepareSession(page, PAGES.find((p) => p.id === 'p9-glossary-diego')!);
  await page.goto('/#/app/learn/glossary');
  await page.getByLabel('Buscar un término').fill('inflacion');
  await expect(page.getByRole('heading', { name: /^Inflación/, level: 3 })).toBeVisible();
  await expect(page.getByText(/términos? encontrados?/)).toBeVisible();
  await page.getByLabel('Buscar un término').fill('xyzw');
  await expect(page.getByText('No hay términos con "xyzw".', { exact: false })).toBeVisible();
  await page.goto('/#/app/learn/library/module-06');
  await expect(page.getByRole('heading', { name: 'Ideas clave' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Imprimir o guardar como PDF' })).toBeVisible();
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  expect(result.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
});
