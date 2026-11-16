import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';
import { PAGES, prepareSession } from './pages';

/**
 * Escape room "Tu primer sueldo" (F18, D-304): played from the first room to the door, pressing the
 * buttons with the keyboard (focus and Enter), axe with no violations in every room and no horizontal overflow, at a
 * phone and a desktop width. Screenshots go to docs/screenshots/.
 */
const axe = async (page: Page) => {
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  expect(result.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
};

for (const width of [375, 1280]) {
  test(`escape room can be played to the end @ ${width}px`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width, height: 900 });
    await prepareSession(page, PAGES.find((p) => p.id === 'p9-escape-mariana')!);
    await page.goto('/#/app/learn/escape');
    await page.getByRole('button', { name: 'Entrar a la oficina' }).click();
    const shot = (name: string) => page.screenshot({ path: `docs/screenshots/escape-${name}-${width}.jpg`, fullPage: true, quality: 70, type: 'jpeg' });

    // Room 1: inspect, an expected mistake, a hint, then the net salary
    await page.getByRole('button', { name: /Inspeccionar: Recibo de sueldo/ }).click();
    await expect(page.getByRole('dialog', { name: 'Recibo de sueldo' })).toBeVisible();
    await page.keyboard.press('Escape');
    await page.getByLabel('¿Cuál es tu sueldo neto?').fill('1000000');
    await page.getByRole('button', { name: 'Probar' }).press('Enter');
    await expect(page.getByText('Ese es el bruto.', { exact: false })).toBeVisible();
    await page.getByRole('button', { name: 'Ver pista (1 llave)' }).click();
    await expect(page.getByText('Bruto menos descuentos es igual a neto.')).toBeVisible();
    await axe(page);
    await shot('room-1');
    await page.getByLabel('¿Cuál es tu sueldo neto?').fill('830000');
    await page.getByRole('button', { name: 'Probar' }).press('Enter');
    await expect(page.getByText('Abriste el candado. Ganaste la letra', { exact: false })).toBeVisible();
    await page.getByLabel(/¿Qué dato del recibo/).fill('El neto, para ver que coincida con lo que cobro.');
    await page.getByRole('button', { name: 'Guardar reflexión' }).press('Enter');
    await expect(page.getByText('Ganaste una llave.', { exact: false })).toBeVisible();
    await axe(page);
    await page.getByRole('button', { name: 'Seguir a la sala' }).press('Enter');

    // Room 2: classify first (one select per row), then the coffee of the month
    for (const [item, category] of [
      ['Alquiler compartido', 'Necesidad'],
      ['Carga de la tarjeta de transporte', 'Necesidad'],
      ['Plan básico de celular', 'Necesidad'],
      ['Salida del sábado', 'Deseo'],
      ['Zapatillas de marca para estrenar', 'Deseo'],
      ['Café de paso todos los días', 'Deseo'],
    ]) {
      await page.getByLabel(item, { exact: true }).selectOption({ label: category });
    }
    await page.getByRole('button', { name: 'Revisar' }).press('Enter');
    await expect(page.getByText('Se encendió el candado.', { exact: false })).toBeVisible();
    await page.getByLabel('¿Cuánto se va por mes en café?').fill('66000');
    await axe(page);
    await shot('room-2');
    await page.getByRole('button', { name: 'Probar' }).press('Enter');
    await page.getByRole('button', { name: 'Seguir a la sala' }).press('Enter');

    // Room 3: the CFT
    await page.getByText('El costo financiero total (CFT o CFTEA)').click();
    await axe(page);
    await shot('room-3');
    await page.getByRole('button', { name: 'Probar' }).press('Enter');
    await page.getByRole('button', { name: 'Seguir a la sala' }).press('Enter');

    // Room 4: order the steps with "Subir" and "Bajar" until right, then how much is missing
    const order = ['Mirar cuánto subió el precio', 'Calcular el precio nuevo', 'Restarle lo que tienes en el sobre', 'Planificar cómo juntar la diferencia'];
    for (let target = 0; target < order.length; target++) {
      for (let guard = 0; guard < 4; guard++) {
        const group = page.getByRole('group', { name: /ordena los pasos/i });
        const items = await group.getByRole('listitem').allInnerTexts();
        const index = items.findIndex((t) => t.includes(order[target]!));
        if (index <= target) break;
        await page.getByRole('button', { name: `Subir: ${order[target]}` }).click();
      }
    }
    await page.getByRole('button', { name: 'Revisar' }).press('Enter');
    await expect(page.getByText('Buen orden.', { exact: false })).toBeVisible();
    await page.getByLabel('¿Cuánto dinero te falta ahora para las zapatillas?').fill('10000');
    await axe(page);
    await shot('room-4');
    await page.getByRole('button', { name: 'Probar' }).press('Enter');
    await page.getByRole('button', { name: 'Seguir a la sala' }).press('Enter');

    // Room 5: the case with decisions, message by message
    for (const choice of ['No toco el enlace', 'No lo comparto', 'Lo descarto', 'Es real']) {
      await page.getByText(choice, { exact: false }).first().click();
      const next = page.getByRole('button', { name: /Continuar|Siguiente|Elegir/ });
      if (await next.count()) await next.first().click();
    }
    await axe(page);
    await shot('room-5');
    await page.getByRole('button', { name: 'Probar' }).press('Enter');
    await expect(page.getByText('Abriste el candado. Ganaste la letra', { exact: false })).toBeVisible();
    await page.getByRole('button', { name: 'Ir a la puerta final' }).press('Enter');

    // The door: the letters, then the word that answers the question
    const letters = (await page.getByRole('list', { name: 'Letras' }).getByRole('listitem').allInnerTexts()).join('');
    const answer = letters.split('').sort().join('') === 'AEMST' ? 'METAS' : 'RENTA';
    await page.getByLabel('Tu respuesta').fill(answer);
    await axe(page);
    await shot('door');
    await page.getByRole('button', { name: 'Abrir la puerta' }).press('Enter');
    await expect(page.getByRole('heading', { name: 'Saliste' })).toBeVisible();
    await expect(page.getByText('Insignia de bronce')).toBeVisible();
    await axe(page);
    await shot('exit');
  });
}
