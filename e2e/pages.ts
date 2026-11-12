import type { Page } from '@playwright/test';

/**
 * Screens checked by the overflow and accessibility tests (CLAUDE.md 2.7 and 2.10).
 * Add every new screen here as it is built. Step 5 adds roles and a simulated session.
 */
export interface CheckedPage {
  /** File-name friendly id, used for screenshots. */
  id: string;
  /** Hash route. */
  path: string;
}

export const PAGES: CheckedPage[] = [
  { id: 'g0-placeholder', path: '/#/' },
  { id: 'g7-not-found', path: '/#/no-existe' },
  { id: 'styleguide', path: '/#/styleguide' },
];

/** CLAUDE.md 2.7: every screen at these widths. */
export const WIDTHS = [320, 375, 768, 1024, 1280, 1440] as const;

/** Hook for the simulated session (step 5). Nothing to prepare yet. */
export async function prepareSession(page: Page, target: CheckedPage) {
  void page;
  void target;
}
