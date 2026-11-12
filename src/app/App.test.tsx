import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import en from '@/locales/en.json';
import es from '@/locales/es.json';
import { renderAt } from '@/test/render-app';
import i18n from './i18n';

afterEach(async () => {
  await i18n.changeLanguage('es');
});

describe('G0 landing (F0)', () => {
  it('has a single h1 in Spanish and a skip link to the main landmark', () => {
    renderAt('/');
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(es.landing.hero.titleKey);
    expect(document.documentElement.lang).toBe('es');
    expect(screen.getByRole('link', { name: es.app.skipToContent })).toHaveAttribute('href', '#main-content');
  });

  it('offers one journey per role, each opening the login with that person preselected', () => {
    renderAt('/');
    const roles = screen.getByRole('region', { name: es.landing.roles.title });
    const links = within(roles).getAllByRole('link', { name: /^Recorrer como/ });
    expect(links.map((l) => l.getAttribute('href'))).toEqual([
      '/login?demo=mariana',
      '/login?demo=diego',
      '/login?demo=andres',
      '/login?demo=paula',
      '/login?demo=ricardo',
    ]);
  });

  it('computes the figures from the demo data', () => {
    renderAt('/');
    const figures = screen.getByRole('region', { name: es.landing.figures.title });
    expect(within(figures).getByText(es.landing.figures.people).nextElementSibling).toHaveTextContent('80');
    expect(within(figures).getByText(es.landing.figures.missions).nextElementSibling).toHaveTextContent('13');
    expect(within(figures).getByText(es.landing.figures.tools).nextElementSibling).toHaveTextContent('12');
  });

  it('runs SIM-3 without signing in: $ 100.000 at 3 % for 12 months buys $ 70.137,99 (F-05)', () => {
    renderAt('/');
    const sim = screen.getByRole('region', { name: es.landing.simulator.title });
    expect(within(sim).getAllByText('$ 70.137,99').length).toBeGreaterThan(0);
    fireEvent.click(within(sim).getByRole('radio', { name: es.sim3.scenario.highShort }));
    expect(within(sim).getByText(/inflación alta/, { selector: 'p' })).toBeInTheDocument();
    expect(within(sim).getAllByText('$ 49.696,94').length).toBeGreaterThan(0);
  });

  it('shows the legal notice and opens external links safely (1.2, 8.2)', () => {
    renderAt('/');
    expect(screen.getAllByText(es.sim3.legal).length).toBeGreaterThan(0);
    const external = screen.getAllByRole('link').filter((a) => a.getAttribute('target') === '_blank');
    expect(external.length).toBeGreaterThan(0);
    for (const a of external) expect(a).toHaveAttribute('rel', 'noopener noreferrer');
  });
});

describe('P1 and SIM-3 in the wallet (visual pilot)', () => {
  it('P1 has one h1, the practice banner and the five destinations', async () => {
    renderAt('/app');
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Mariana');
    expect(screen.getByText(es.wallet.practiceBanner)).toBeInTheDocument();
    const nav = screen.getAllByRole('navigation', { name: es.wallet.nav.label })[0]!;
    for (const key of ['home', 'pay', 'save', 'invest', 'learn'] as const) {
      expect(within(nav).getByRole('link', { name: new RegExp(es.wallet.nav[key]) })).toBeInTheDocument();
    }
    expect(within(nav).getByRole('link', { name: /Invertir, bloqueado/ })).toBeInTheDocument();
  });

  it('SIM-3 page uses the simulator title as its only h1', async () => {
    renderAt('/app/tools/SIM-3');
    const h1 = await screen.findAllByRole('heading', { level: 1 });
    expect(h1).toHaveLength(1);
    expect(h1[0]).toHaveTextContent(es.sim3.title);
  });
});

describe('not found', () => {
  it('shows the not found page for unknown routes', () => {
    renderAt('/does-not-exist');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(es.notFound.title);
  });
});

describe('locales', () => {
  const keysOf = (obj: object, prefix = ''): string[] =>
    Object.entries(obj).flatMap(([key, value]) =>
      typeof value === 'object' && value !== null ? keysOf(value, `${prefix}${key}.`) : [`${prefix}${key}`],
    );
  const valuesOf = (obj: object): string[] =>
    Object.values(obj).flatMap((value) => (typeof value === 'object' && value !== null ? valuesOf(value) : [String(value)]));

  it('English covers the landing and SIM-3 in phase A, with the same keys as Spanish (CLAUDE.md 3)', () => {
    const groups = ['app', 'landing', 'notFound', 'ui', 'money', 'validation', 'sim3'] as const;
    for (const group of groups) {
      expect(keysOf(en[group]).sort(), group).toEqual(keysOf(es[group]).sort());
    }
    // The rest falls back to Spanish until F17 (phase B).
    expect(keysOf(en).every((k) => keysOf(es).includes(k))).toBe(true);
  });

  it('Spanish texts follow the voice rules (CLAUDE.md 2.9)', () => {
    const texts = valuesOf(es).join(' | ');
    expect(texts).not.toMatch(/—/);
    expect(texts).not.toMatch(/\b(vos|usted)\b/i);
    expect(texts).not.toMatch(/\b(loguea|dashboard|mail|móvil|ordenador|target|cuotas gratis)\b/i);
    expect(texts).not.toMatch(/\bvas a ganar\b/i);
  });

  it('loads English on demand and keeps <html lang> in sync (WCAG 3.1.1)', async () => {
    await i18n.changeLanguage('en');
    await waitFor(() => expect(i18n.t('landing.hero.titleKey')).toBe(en.landing.hero.titleKey));
    expect(document.documentElement.lang).toBe('en');
  });
});
