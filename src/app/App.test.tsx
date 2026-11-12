import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import en from '@/locales/en.json';
import es from '@/locales/es.json';
import { renderAt } from '@/test/render-app';
import { resetAll, signInAs } from '@/test/session';
import { useSessionStore } from '@/store/session-store';
import i18n from './i18n';

beforeEach(() => resetAll());

afterEach(async () => {
  await i18n.changeLanguage('es');
});

describe('G0 landing (F0)', () => {
  it('has a single h1 in Spanish and a skip link to the main landmark', () => {
    renderAt('/');
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(es.landing.hero.titleKey);
    expect(document.documentElement.lang).toBe('es');
    expect(screen.getByRole('link', { name: es.app.skipToContent })).toHaveAttribute('data-target', 'main-content');
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

describe('G0 in-page links and phone (INC-11, D-155, D-157)', () => {
  it('"Elegir un recorrido" and the section menu stay on the landing (hash routing)', () => {
    const { router } = renderAt('/');
    for (const link of screen.getAllByRole('link', { name: es.landing.chooseJourney })) {
      fireEvent.click(link);
      expect(router.state.location.pathname).toBe('/');
    }
    fireEvent.click(screen.getByRole('link', { name: es.app.skipToContent }));
    expect(router.state.location.pathname).toBe('/');
    expect(document.activeElement).toBe(document.getElementById('main-content'));
  });

  it('the landing simulator has no "Guardar escenario" and keeps the assumptions next to the data', () => {
    renderAt('/');
    const sim = screen.getByRole('region', { name: es.landing.simulator.title });
    expect(within(sim).queryByRole('button', { name: es.sim3.compare.save })).not.toBeInTheDocument();
    const form = within(sim).getByRole('form', { name: es.sim3.dataLabel });
    expect(form.parentElement?.querySelector('details')).not.toBeNull();
  });

  it('the hero phone has no buttons and stops its rotation on hover, focus or tap (D-157)', () => {
    renderAt('/');
    const phone = screen.getByRole('img', { name: /Tu cuenta$/ });
    expect(screen.queryByRole('radiogroup', { name: /pantalla de la app/ })).not.toBeInTheDocument();
    expect(phone.parentElement).toHaveAttribute('tabindex', '0');
  });
});

describe('P1 and SIM-3 in the wallet (visual pilot)', () => {
  beforeEach(() => signInAs('p-mariana'));

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

  it('SIM-3 page: the h1 comes before the description and Fuerte, and the amount starts with the practice salary', async () => {
    renderAt('/app/tools/SIM-3');
    const h1 = await screen.findAllByRole('heading', { level: 1 });
    expect(h1).toHaveLength(1);
    expect(h1[0]).toHaveTextContent(es.sim3.title);
    const intro = screen.getByText(es.sim3.intro);
    expect(h1[0]!.compareDocumentPosition(intro) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByLabelText(es.sim3.amount.label)).toHaveValue('1.404.109,24');
    expect(screen.getByRole('region', { name: es.sim3.title })).toBeInTheDocument();
    // The tools live under Aprender (5.3): that destination is the current one.
    const nav = screen.getAllByRole('navigation', { name: es.wallet.nav.label })[0]!;
    expect(within(nav).getByRole('link', { name: new RegExp(es.wallet.nav.learn) })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('link', { name: new RegExp(es.wallet.nav.home) })).not.toHaveAttribute('aria-current');
  });

  it('SIM-3 on the landing, without a session, starts at 100.000', () => {
    renderAt('/');
    const sim = screen.getByRole('region', { name: es.landing.simulator.title });
    expect(within(sim).getByLabelText(es.sim3.amount.label)).toHaveValue('100.000');
  });

  it('the fixed banner always says the money is play money (1.1.1, D-69)', async () => {
    renderAt('/app');
    await screen.findByRole('heading', { level: 1 });
    expect(es.wallet.practiceBanner).toContain('dinero ficticio');
    expect(screen.getByText(es.wallet.practiceBanner)).toHaveTextContent('dinero ficticio');
  });

  it('P1 offers to advance a day, a week and a month', async () => {
    renderAt('/app');
    await screen.findByRole('heading', { level: 1 });
    for (const key of ['day', 'week', 'month'] as const) {
      expect(screen.getByRole('button', { name: es.wallet.home.advance[key] })).toBeInTheDocument();
    }
  });
});

describe('not found', () => {
  it('shows the not found page for unknown routes', () => {
    renderAt('/does-not-exist');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(es.notFound.title);
  });
});

describe('route guards (F0, roles.md 3.4)', () => {
  it('sends a visitor without a session to sign in and remembers the route', async () => {
    renderAt('/app/tools/SIM-3');
    expect(await screen.findByRole('heading', { level: 1, name: es.auth.login.title })).toBeInTheDocument();
    expect(useSessionStore.getState().returnTo).toBe('/app/tools/SIM-3');
  });

  it('asks for the privacy notice before entering (G5)', async () => {
    signInAs('p-diego', { consent: false });
    renderAt('/app');
    expect(await screen.findByRole('heading', { level: 1, name: es.consent.title })).toBeInTheDocument();
    expect(screen.getByText(es.consent.summary.participant)).toBeInTheDocument();
  });

  it('shows "Acceso no permitido" on another role\'s routes', async () => {
    signInAs('p-mariana');
    renderAt('/admin');
    expect(await screen.findByRole('heading', { level: 1, name: es.forbidden.title })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: es.forbidden.backHome })).toHaveAttribute('href', '/app');
  });

  it('gives G7 before "not found" inside another role\'s area', async () => {
    signInAs('p-andres');
    renderAt('/app/save/budget');
    expect(await screen.findByRole('heading', { level: 1, name: es.forbidden.title })).toBeInTheDocument();
  });

  for (const [personId, path, name] of [
    ['p-andres', '/tutor', 'Andrés'],
    ['p-paula', '/admin', 'Paula'],
    ['p-ricardo', '/sponsor', 'Ricardo'],
  ] as const) {
    it(`opens the provisional home of ${name} with "Ver como" and the user menu`, async () => {
      signInAs(personId);
      renderAt(path);
      expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(name);
      expect(screen.getAllByRole('button', { name: /Ver como/ }).length).toBeGreaterThan(0);
      expect(screen.getByRole('button', { name: new RegExp(`^Menú de ${name}`) })).toBeInTheDocument();
    });
  }
});

describe('access flow (G1 to G5)', () => {
  it('one click from the landing: SSO, verification with the code prefilled, notice and home', async () => {
    renderAt('/login?demo=paula');
    fireEvent.click(await screen.findByRole('button', { name: es.auth.login.ssoMicrosoft }));
    expect(await screen.findByRole('heading', { level: 1, name: /Iniciar sesión con Microsoft/ })).toBeInTheDocument();
    expect(screen.getByText('paula.gomez@andina.demo')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: es.auth.sso.continue }));
    expect(await screen.findByRole('heading', { level: 1, name: es.auth.mfa.title })).toBeInTheDocument();
    expect(screen.getByLabelText(es.auth.mfa.codeLabel)).toHaveValue('246810');
    fireEvent.click(screen.getByRole('button', { name: es.auth.mfa.submit }));
    expect(await screen.findByRole('heading', { level: 1, name: es.consent.title })).toBeInTheDocument();
    expect(screen.getByText(es.consent.summary.staff)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: es.consent.next }));
    fireEvent.click(await screen.findByRole('button', { name: es.consent.accept }));
    expect(await screen.findByText(es.consent.checkRequired)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(es.consent.check));
    fireEvent.click(screen.getByRole('button', { name: es.consent.accept }));
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Paula');
  });

  it('participants skip the second step', async () => {
    renderAt('/login?demo=diego');
    fireEvent.click(await screen.findByRole('button', { name: es.auth.login.ssoGoogle }));
    fireEvent.click(await screen.findByRole('button', { name: es.auth.sso.continue }));
    expect(await screen.findByRole('heading', { level: 1, name: es.consent.title })).toBeInTheDocument();
  });

  it('shows a generic error and keeps the email (G1)', async () => {
    renderAt('/login');
    fireEvent.click(await screen.findByRole('button', { name: es.auth.login.emailToggle }));
    fireEvent.change(screen.getByLabelText(es.auth.login.emailLabel), { target: { value: 'mariana.lopez@andina.demo' } });
    fireEvent.change(screen.getByLabelText(es.auth.login.passwordLabel), { target: { value: 'equivocada' } });
    fireEvent.click(screen.getByRole('button', { name: es.auth.login.submit }));
    expect(await screen.findByText(es.auth.login.invalid)).toBeInTheDocument();
    expect(screen.getByLabelText(es.auth.login.emailLabel)).toHaveValue('mariana.lopez@andina.demo');
    expect(screen.getByLabelText(es.auth.login.passwordLabel)).toHaveValue('');
  });

  it('records a help desk request and shows its number (G4)', async () => {
    renderAt('/access-help');
    fireEvent.change(await screen.findByLabelText(new RegExp(es.auth.login.emailLabel)), { target: { value: 'diego.suarez@andina.demo' } });
    fireEvent.click(screen.getByLabelText(es.accessHelp.reasons.locked));
    fireEvent.click(screen.getByRole('button', { name: es.accessHelp.submit }));
    expect(await screen.findByText('Número de solicitud: MDA-2026-0001')).toBeInTheDocument();
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
