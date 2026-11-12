import { beforeEach, describe, expect, it } from 'vitest';
import { clearLocal, localKey, readLocal, writeLocal } from './local-store';

/**
 * CLAUDE.md 11 and roles.md, section 6: participant data never reaches another role. The views of
 * the tutor, the admin and the sponsor cannot import the participant's local data, the wallet or
 * the money tools. As those features are built (steps 10 and 11), this test covers them.
 */
const otherRoleSources = import.meta.glob<string>(
  ['../features/tutor/**/*.{ts,tsx}', '../features/organization/**/*.{ts,tsx}', '../features/sponsor/**/*.{ts,tsx}'],
  { query: '?raw', import: 'default', eager: true },
);

const FORBIDDEN = [
  /store\/local-store/,
  /features\/wallet/,
  /walletStore|wallet-store/,
  /features\/simulators/,
  /features\/goals/,
  /habitAnswers|reflections|levelProgress|LocalScenario|LocalGoal/,
  /alcancia-local:/,
];

describe('privacy boundaries between roles', () => {
  it('tutor, admin and sponsor views never import participant-only data', () => {
    for (const [path, code] of Object.entries(otherRoleSources)) {
      for (const rule of FORBIDDEN) {
        expect(code, `${path} uses ${rule}`).not.toMatch(rule);
      }
    }
  });
});

describe('local store: one space per person', () => {
  beforeEach(() => localStorage.clear());

  it('keeps each person in a separate key', () => {
    writeLocal('p-mariana', (d) => ({ ...d, habitAnswers: { q1: 'sometimes' } }));
    expect(readLocal('p-diego').habitAnswers).toEqual({});
    expect(readLocal('p-mariana').habitAnswers).toEqual({ q1: 'sometimes' });
    expect(Object.keys(localStorage)).toEqual([localKey('p-mariana')]);
  });

  it('clears one person without touching another', () => {
    writeLocal('p-mariana', (d) => ({ ...d, reflections: { w1: 'texto' } }));
    writeLocal('p-diego', (d) => ({ ...d, reflections: { w1: 'otro' } }));
    clearLocal('p-mariana');
    expect(readLocal('p-mariana').reflections).toEqual({});
    expect(readLocal('p-diego').reflections).toEqual({ w1: 'otro' });
  });

  it('survives corrupted storage', () => {
    localStorage.setItem(localKey('p-diego'), '{not json');
    expect(readLocal('p-diego').goals).toEqual([]);
  });
});
