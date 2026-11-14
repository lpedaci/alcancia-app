import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import es from '@/locales/es.json';
import { makeDeposit } from '@/features/wallet/engine/engine';
import { readWallet, writeWallet } from '@/store/wallet-store';
import { renderAt } from '@/test/render-app';
import { resetAll, signInAs } from '@/test/session';

/**
 * D-78, step 17: the guide starts from the action. From Rendir, the card of a negative real rate opens
 * the part "Se acumula" of "El ladrón silencioso" (module 9) and "Volver a Rendir" comes back with
 * what was typed still there.
 */
beforeEach(() => resetAll());

describe('the guide starts from the action (D-78)', () => {
  it('Rendir → card of negative real rate → "Se acumula" → back to Rendir with the form intact', { timeout: 30000 }, async () => {
    signInAs('p-mariana');
    const { router } = renderAt('/app/save/yield');
    await screen.findAllByRole('heading', { level: 1 });

    // The person types an amount in the practice fixed-term form.
    const amount = screen.getByRole('textbox', { name: new RegExp(es.yield.deposit.amount) });
    fireEvent.change(amount, { target: { value: '150.000' } });

    // A traditional fixed term with the medium scenario: its real rate is negative, so the card shows.
    act(() => writeWallet('p-mariana', makeDeposit(readWallet('p-mariana'), 'traditional', '100000', 30)));
    await screen.findByRole('complementary', { name: 'Este plazo fijo le pierde a la inflación' });

    fireEvent.click(screen.getByRole('link', { name: new RegExp(es.cards.toGuide) }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/app/learn/guides/module-09-guide-1'));
    expect(router.state.location.search).toBe('?part=5&from=%2Fapp%2Fsave%2Fyield');
    expect(await screen.findByRole('heading', { level: 1, name: 'Se acumula' })).toBeInTheDocument();
    expect(screen.getByText('Parte 5 de 8')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: 'Volver a Rendir' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/app/save/yield'));
    await screen.findAllByRole('heading', { level: 1 });
    expect(screen.getByRole('textbox', { name: new RegExp(es.yield.deposit.amount) })).toHaveValue('150.000');
  });

  it('ignores a return path outside the app (no open redirect)', async () => {
    signInAs('p-mariana');
    renderAt('/app/learn/guides/module-09-guide-1?part=5&from=https%3A%2F%2Fevil.example');
    expect(await screen.findByRole('heading', { level: 1, name: 'Se acumula' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Volver a/ })).toBeNull();
  });
});
