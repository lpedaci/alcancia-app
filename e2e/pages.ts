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
  as?: 'p-mariana' | 'p-diego' | 'p-kevin' | 'p-paula' | 'p-ricardo';
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
  { id: 'p3-transfer-diego', path: '/#/app/pay/transfer', as: 'p-diego' },
  { id: 'p3-qr-diego', path: '/#/app/pay/qr', as: 'p-diego' },
  { id: 'p3-bills-mariana', path: '/#/app/pay/bills', as: 'p-mariana' },
  { id: 'p4-budget-mariana', path: '/#/app/save/budget', as: 'p-mariana' },
  { id: 'p5-pockets-mariana', path: '/#/app/save/pockets', as: 'p-mariana' },
  { id: 'p13-tools', path: '/#/app/tools', as: 'p-mariana' },
  { id: 'p13-sim-1', path: '/#/app/tools/SIM-1', as: 'p-mariana' },
  { id: 'p13-sim-2', path: '/#/app/tools/SIM-2', as: 'p-mariana' },
  { id: 'p13-sim-4', path: '/#/app/tools/SIM-4', as: 'p-mariana' },
  { id: 'p13-sim-5', path: '/#/app/tools/SIM-5', as: 'p-mariana' },
  { id: 'p13-sim-6', path: '/#/app/tools/SIM-6', as: 'p-mariana' },
  { id: 'p13-sim-7', path: '/#/app/tools/SIM-7', as: 'p-mariana' },
  { id: 'p13-sim-8', path: '/#/app/tools/SIM-8', as: 'p-mariana' },
  { id: 'p13-sim-9', path: '/#/app/tools/SIM-9', as: 'p-mariana' },
  { id: 'p13-sim-10', path: '/#/app/tools/SIM-10', as: 'p-mariana' },
  { id: 'p13-sim-11', path: '/#/app/tools/SIM-11', as: 'p-mariana' },
  { id: 'p13-sim-12', path: '/#/app/tools/SIM-12', as: 'p-mariana' },
  { id: 'p12-mission-fund-mariana', path: '/#/app/missions/mission-emergency-fund', as: 'p-mariana' },
  { id: 'p12-mission-7-mariana', path: '/#/app/missions/mission-7', as: 'p-mariana' },
  { id: 'p12-mission-6-diego', path: '/#/app/missions/mission-6', as: 'p-diego' },
  { id: 'investor-profile', path: '/#/app/learn/investor-profile', as: 'p-mariana' },
  { id: 'p2-welcome-mariana', path: '/#/app/welcome', as: 'p-mariana' },
  { id: 'p12-mission-1-diego', path: '/#/app/missions/mission-1', as: 'p-diego' },
  { id: 'p12-mission-security', path: '/#/app/missions/mission-security', as: 'p-mariana' },
  { id: 'p14-profile-mariana', path: '/#/app/profile', as: 'p-mariana' },
  { id: 'p9-learn-diego', path: '/#/app/learn', as: 'p-diego' },
  { id: 'p10-guide-diego', path: '/#/app/learn/guides/module-17-guide-1', as: 'p-diego' },
  { id: 'p11-challenge-diego', path: '/#/app/learn/challenges/challenge-level-2', as: 'p-diego' },
  { id: 'p10-guide-m06-mariana', path: '/#/app/learn/guides/module-06-guide-1', as: 'p-mariana' },
  { id: 'p11-challenge-l6-mariana', path: '/#/app/learn/challenges/challenge-level-6', as: 'p-mariana' },
  { id: 'p7-credit-mariana', path: '/#/app/pay/credit', as: 'p-mariana' },
  { id: 'p7-credit-locked-diego', path: '/#/app/pay/credit', as: 'p-diego' },
  { id: 'p12-mission-5-mariana', path: '/#/app/missions/mission-5', as: 'p-mariana' },
  { id: 'p12-mission-debts-mariana', path: '/#/app/missions/mission-debts', as: 'p-mariana' },
  { id: 'p6-yield-mariana', path: '/#/app/save/yield', as: 'p-mariana' },
  { id: 'p6-yield-locked-diego', path: '/#/app/save/yield', as: 'p-diego' },
  { id: 'p12-mission-4-mariana', path: '/#/app/missions/mission-4', as: 'p-mariana' },
  { id: 'p8-invest-mariana', path: '/#/app/invest', as: 'p-mariana' },
  { id: 'p8-instrument-mariana', path: '/#/app/invest/cedear-sp500', as: 'p-mariana' },
  { id: 'p9-sources-diego', path: '/#/app/learn/sources', as: 'p-diego' },
  { id: 'p12-mission-broker-mariana', path: '/#/app/missions/mission-broker-account', as: 'p-mariana' },
  { id: 'p12-mission-cedear-mariana', path: '/#/app/missions/mission-first-cedear', as: 'p-mariana' },
  { id: 'p12-mission-drop-mariana', path: '/#/app/missions/mission-hold-the-drop', as: 'p-mariana' },
  { id: 't1-tutor', path: '/#/tutor', as: 'p-kevin' },
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
  'p-kevin': 'tutor',
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
