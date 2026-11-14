import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import es from '@/locales/es.json';
import { writeLocal } from '@/store/local-store';
import { renderAt } from '@/test/render-app';
import { resetAll, signInAs } from '@/test/session';

/** RF-84, D-209: "¿Por qué importa?" is visible on every wallet screen, also with Fuerte in "Silencio". */
const SCREENS = ['/app', '/app/pay', '/app/pay/transfer', '/app/pay/qr', '/app/pay/bills', '/app/pay/credit', '/app/save/budget', '/app/save/pockets', '/app/save/yield', '/app/invest', '/app/profile'];

beforeEach(() => resetAll());

describe('"¿Por qué importa?" on every wallet screen', () => {
  for (const path of SCREENS) {
    it(`${path} shows it with Fuerte silenced`, async () => {
      signInAs('p-mariana');
      writeLocal('p-mariana', (d) => ({ ...d, fuertePresence: 'silent' }));
      const { container } = renderAt(path);
      await screen.findAllByRole('heading', { level: 1 });
      const why = container.querySelector('[data-why-matters] button');
      expect(why, path).not.toBeNull();
      fireEvent.click(why!);
      expect(screen.getAllByRole('link', { name: new RegExp(es.cards.toGuide) }).length).toBeGreaterThan(0);
    });
  }
});

describe('free-mode card in the wallet (RF-83)', () => {
  it('appears after choosing where the balance yields, without Fuerte when he is silenced, and only once when answered well', { timeout: 20000 }, async () => {
    signInAs('p-mariana');
    writeLocal('p-mariana', (d) => ({ ...d, fuertePresence: 'silent' }));
    const { container } = renderAt('/app/save/yield');
    await screen.findAllByRole('heading', { level: 1 });
    // Whichever of the two options is not the current one (text match: role queries are slow on this page).
    const choose = () => screen.getAllByText(/^Elegir$/).map((el) => el.closest('button')!).find((b) => /Fondo money market|Cuenta remunerada/.test(b.textContent ?? ''))!;
    fireEvent.click(choose());
    const card = await screen.findByRole('complementary', { name: 'Cuenta o fondo: no es lo mismo' });
    expect(container.querySelector('[data-learning-card] svg[viewBox="0 0 168 152"]')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Falso' }));
    expect(card).toHaveTextContent('no un depósito');
    fireEvent.click(screen.getByRole('button', { name: es.cards.understood }));
    expect(screen.queryByRole('complementary', { name: 'Cuenta o fondo: no es lo mismo' })).toBeNull();
    // Answered well: choosing again does not bring it back.
    fireEvent.click(choose());
    expect(screen.queryByRole('complementary', { name: 'Cuenta o fondo: no es lo mismo' })).toBeNull();
  });
});
