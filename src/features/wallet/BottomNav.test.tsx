import { act, fireEvent, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import es from '@/locales/es.json';
import { renderAt } from '@/test/render-app';
import { resetAll, signInAs } from '@/test/session';

/** The bottom navigation of phones and tablets (D-72). */
function bottomNav() {
  const nav = document.querySelector('[data-wallet-bottom-nav]');
  if (!(nav instanceof HTMLElement)) throw new Error('bottom navigation not found');
  return nav;
}

const NAMES = ['home', 'pay', 'save', 'invest', 'learn'] as const;

/** Text a sighted person sees: everything except the visually hidden spans. */
function visibleText(element: HTMLElement) {
  const clone = element.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('.sr-only').forEach((node) => node.remove());
  return clone.textContent?.trim() ?? '';
}

describe('bottom navigation (D-72, D-228)', () => {
  beforeEach(() => {
    resetAll();
    signInAs('p-mariana');
  });

  it('every destination has an accessible name, and locked ones say so', async () => {
    renderAt('/app');
    await screen.findByRole('heading', { level: 1 });
    const nav = bottomNav();
    for (const key of NAMES) {
      expect(within(nav).getByRole('link', { name: new RegExp(`^${es.wallet.nav[key]}`) })).toBeInTheDocument();
    }
    expect(within(nav).getByRole('link', { name: `${es.wallet.nav.invest}, ${es.wallet.nav.locked}` })).toBeInTheDocument();
  });

  it('no destination shows its name; the active one is marked with the pill and aria-current (D-228)', async () => {
    renderAt('/app');
    await screen.findByRole('heading', { level: 1 });
    const links = within(bottomNav()).getAllByRole('link');
    const active = links.filter((link) => link.getAttribute('aria-current') === 'page');
    expect(active).toHaveLength(1);
    expect(active[0]).toHaveAccessibleName(es.wallet.nav.home);
    for (const link of links) expect(visibleText(link)).toBe('');
  });

  it('holding an icon shows its name and does not navigate; a tap navigates (D-228)', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderAt('/app');
    await screen.findByRole('heading', { level: 1 });
    const pay = within(bottomNav()).getByRole('link', { name: es.wallet.nav.pay });
    fireEvent.pointerDown(pay, { pointerType: 'touch' });
    act(() => vi.advanceTimersByTime(600));
    expect(visibleText(pay)).toBe(es.wallet.nav.pay);
    fireEvent.pointerUp(pay, { pointerType: 'touch' });
    fireEvent.click(pay);
    expect(window.location.hash).not.toContain('/app/pay');
    vi.useRealTimers();
  });
});
