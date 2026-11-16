import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';
import { PAGES, prepareSession } from './pages';

/**
 * Sessions with the tutor (F13, D-319): the tutor schedules the 1:1 that was requested, and a
 * participant asks for one with a module and a note. axe and no overflow at each step.
 */
const axe = async (page: Page) => {
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  expect(result.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
};

for (const width of [375, 1280]) {
  test(`the tutor schedules a requested 1:1 @ ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await prepareSession(page, PAGES.find((p) => p.id === 't7-sessions')!);
    await page.goto('/#/tutor/sessions');
    await expect(page.getByText('Quiero entender el resumen de la tarjeta', { exact: false })).toBeVisible();
    await page.getByRole('button', { name: 'Programar', exact: true }).click();
    await axe(page);
    await page.getByRole('button', { name: 'Programar encuentro' }).first().click();
    await expect(page.getByText('No hay pedidos pendientes.')).toBeVisible();
    await expect(page.getByText('Encuentro 1:1: Tarjeta de crédito', { exact: false }).first()).toBeVisible();
    await axe(page);
  });

  test(`a participant asks for a 1:1 @ ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await prepareSession(page, PAGES.find((p) => p.id === 'p9-learn-diego')!);
    await page.goto('/#/app/learn');
    await expect(page.getByRole('heading', { name: 'Encuentros con tu tutoría' })).toBeVisible();
    await page.getByRole('button', { name: 'Pedir un encuentro 1:1' }).click();
    await page.getByRole('button', { name: 'Enviar pedido' }).click();
    await expect(page.getByText('Escribe al menos 10 caracteres.')).toBeVisible();
    await page.getByLabel('Tema (obligatorio)').selectOption({ label: 'Módulo 3 · Presupuesto y gastos hormiga' });
    await page.getByLabel('Qué quieres ver (obligatorio)').fill('Cómo armar el presupuesto si cobro por quincena.');
    await page.getByRole('button', { name: 'Enviar pedido' }).click();
    await expect(page.getByText('Esperando respuesta')).toBeVisible();
    await axe(page);
  });
}
