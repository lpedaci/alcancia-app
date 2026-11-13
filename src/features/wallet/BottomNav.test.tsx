import { screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
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

describe('bottom navigation (D-72)', () => {
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

  it('only the active destination shows its name; the rest show only the icon', async () => {
    renderAt('/app');
    await screen.findByRole('heading', { level: 1 });
    const links = within(bottomNav()).getAllByRole('link');
    const active = links.filter((link) => link.getAttribute('aria-current') === 'page');
    expect(active).toHaveLength(1);
    expect(visibleText(active[0]!)).toBe(es.wallet.nav.home);
    for (const link of links.filter((l) => l !== active[0])) expect(visibleText(link)).toBe('');
  });

  it('the visible name follows the active destination', async () => {
    renderAt('/app/tools/SIM-3');
    await screen.findAllByRole('heading', { level: 1 });
    const active = within(bottomNav())
      .getAllByRole('link')
      .find((link) => link.getAttribute('aria-current') === 'page')!;
    expect(visibleText(active)).toBe(es.wallet.nav.learn);
  });
});
