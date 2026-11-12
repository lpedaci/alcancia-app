import type { Page } from '@playwright/test';

/**
 * Screens checked by the overflow and accessibility tests (CLAUDE.md 2.7 and 2.10).
 * Add every new screen here as it is built, with the simulated session it needs.
 */
export interface CheckedPage {
  /** File-name friendly id, used for screenshots. */
  id: string;
  /** Hash route. */
  path: string;
  /** Demo person signed in before loading the page (simulated session, step 5). */
  as?: 'p-mariana' | 'p-diego' | 'p-andres' | 'p-paula' | 'p-ricardo';
  /** Sign in without the accepted privacy notice (to check G5). */
  noConsent?: boolean;
  /** A sign-in waiting for the second step (to check G3). */
  pendingMfa?: 'p-paula' | 'p-ricardo';
}

export const PAGES: CheckedPage[] = [
  { id: 'g0-landing', path: '/#/' },
  { id: 'g1-login', path: '/#/login' },
  { id: 'g2-sso', path: '/#/login/sso?provider=microsoft' },
  { id: 'g3-verify', path: '/#/login/verify', pendingMfa: 'p-paula' },
  { id: 'g4-access-help', path: '/#/access-help' },
  { id: 'g5-consent', path: '/#/consent', as: 'p-diego', noConsent: true },
  { id: 'p1-home', path: '/#/app', as: 'p-mariana' },
  { id: 'p1-home-diego', path: '/#/app', as: 'p-diego' },
  { id: 'sim3-tool', path: '/#/app/tools/SIM-3', as: 'p-mariana' },
  { id: 'p8-invest-locked', path: '/#/app/invest', as: 'p-mariana' },
  { id: 'p3-pay-diego', path: '/#/app/pay', as: 'p-diego' },
  { id: 'investor-profile', path: '/#/app/learn/investor-profile', as: 'p-mariana' },
  { id: 't1-tutor', path: '/#/tutor', as: 'p-andres' },
  { id: 'o1-admin', path: '/#/admin', as: 'p-paula' },
  { id: 'd1-sponsor', path: '/#/sponsor', as: 'p-ricardo' },
  { id: 'g7-forbidden', path: '/#/admin', as: 'p-mariana' },
  { id: 'g7-not-found', path: '/#/no-existe' },
  { id: 'styleguide', path: '/#/styleguide' },
];

/** CLAUDE.md 2.7: every screen at these widths. */
export const WIDTHS = [320, 375, 768, 1024, 1280, 1440] as const;

const ROLES = {
  'p-mariana': 'participant',
  'p-diego': 'participant',
  'p-andres': 'tutor',
  'p-paula': 'ld_admin',
  'p-ricardo': 'sponsor',
} as const;

/**
 * Writes the simulated session in the persisted stores before the app loads. The data store is
 * merged over the seed by Zustand, so only the consents need to be written.
 */
export async function prepareSession(page: Page, target: CheckedPage) {
  if (!target.as && !target.pendingMfa) return;
  const now = new Date().toISOString();
  const session = target.as
    ? { personId: target.as, role: ROLES[target.as], method: 'sso_microsoft', via: 'login', startedAt: now, lastActivityAt: now }
    : null;
  const pending = target.pendingMfa
    ? { personId: target.pendingMfa, role: ROLES[target.pendingMfa], method: 'sso_microsoft', demo: true }
    : null;
  const consents = target.as && !target.noConsent ? [{ personId: target.as, version: '1.0', acceptedAt: now }] : [];
  await page.addInitScript(
    ({ session, pending, consents }) => {
      localStorage.setItem(
        'alcancia-session',
        JSON.stringify({ state: { session, pending, returnTo: null, authAttempts: {}, demoUnlockAll: false }, version: 1 }),
      );
      localStorage.setItem('alcancia-data', JSON.stringify({ state: { consents }, version: 1 }));
    },
    { session, pending, consents },
  );
}
