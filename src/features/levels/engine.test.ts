import { describe, expect, it } from 'vitest';
import levelsJson from '@/data/levels.json';
import { buildDiego, buildMariana } from '@/features/wallet/engine/demo';
import { seedData } from '@/store/data-store';
import type { LocalData } from '@/store/local-store';
import type { LevelDef } from '@/types/domain';
import { buildLevelContext } from './context';
import { completedLights, currentLevel, evaluateLevels, type LevelContext, nextUnlock } from './engine';

const levels = levelsJson as LevelDef[];
const emptyLocal = (): LocalData => ({ scenarios: [], goals: [], habitAnswers: {}, reflections: {}, levelProgress: [] });

function contextOf(personId: 'p-mariana' | 'p-diego', overrides: Partial<LevelContext> = {}, local = emptyLocal()) {
  const wallet = personId === 'p-mariana' ? buildMariana() : buildDiego();
  return { ...buildLevelContext({ personId, data: seedData(), wallet, local, demoUnlockAll: false }), ...overrides };
}

const statusOf = (ctx: LevelContext) => Object.fromEntries(evaluateLevels(levels, ctx).map((s) => [s.level.id, s.status]));

describe('levels of the demo states (CLAUDE.md 7, demo-states.json)', () => {
  it('Mariana: levels 0 to 6 completed and Invertir locked, with what is missing', () => {
    const statuses = evaluateLevels(levels, contextOf('p-mariana'));
    expect(Object.fromEntries(statuses.map((s) => [s.level.id, s.status]))).toEqual({
      'level-0': 'completed',
      'level-1': 'completed',
      'level-2': 'completed',
      'level-3': 'completed',
      'level-4': 'completed',
      'level-5': 'completed',
      'level-6': 'completed',
      'level-7': 'locked',
    });
    const invest = nextUnlock(statuses)!;
    expect(invest.level.id).toBe('level-7');
    const missing = invest.conditions.filter((c) => !c.met).map((c) => c.condition.type);
    expect(missing).toEqual(['wallet_metric', 'investor_profile_done']);
    expect(invest.conditions[0]).toMatchObject({ current: '2.3', target: '3', met: false });
    expect(completedLights(statuses)).toBe(6);
  });

  it('Diego: levels 0 and 1 completed, Pagar unlocked in progress, Presupuesto locked at 4 of 10', () => {
    const statuses = evaluateLevels(levels, contextOf('p-diego'));
    expect(statuses.map((s) => s.status).slice(0, 4)).toEqual(['completed', 'completed', 'unlocked', 'locked']);
    expect(currentLevel(statuses)!.level.id).toBe('level-2');
    expect(currentLevel(statuses)!.guidesRead).toBe(1);
    const budget = nextUnlock(statuses)!;
    expect(budget.conditions[0]).toMatchObject({ current: '4', target: '10', met: false });
    expect(budget.conditions[1]).toMatchObject({ met: false });
  });

  it('matches the lock states recorded in demo-states.json', async () => {
    const demo = (await import('@/data/demo-states.json')).default as unknown as Record<string, { levelProgress: { levelId: string; status: string }[] }>;
    for (const personId of ['p-mariana', 'p-diego'] as const) {
      const expected = Object.fromEntries(demo[personId]!.levelProgress.map((p) => [p.levelId, p.status]));
      expect(statusOf(contextOf(personId)), personId).toEqual(expected);
    }
  });
});

describe('unlock rules (5.0)', () => {
  it('D-67: taking the investor profile test removes that condition, before Invertir opens', () => {
    const local = { ...emptyLocal(), investorProfile: 'moderate' as const };
    const invest = nextUnlock(evaluateLevels(levels, contextOf('p-mariana', {}, local)))!;
    expect(invest.conditions.find((c) => c.condition.type === 'investor_profile_done')!.met).toBe(true);
    expect(invest.status).toBe('locked'); // the fund is still 2.3 of 3 months
  });

  it('opens Invertir with a fund of 3 months, no high-rate debt, the challenge and the profile', () => {
    const ctx = contextOf('p-mariana', { investorProfileDone: true });
    const opened = statusOf({ ...ctx, metrics: { ...ctx.metrics, emergency_months: '3.0' } });
    expect(opened['level-7']).toBe('unlocked');
  });

  it('"Ya sé esto": a passed mastery challenge unlocks a level without the previous ones', () => {
    const ctx = contextOf('p-diego');
    const s = evaluateLevels(levels, { ...ctx, bestScores: { ...ctx.bestScores, 'mastery-level-3': 0.8 } });
    expect(s.find((x) => x.level.id === 'level-3')).toMatchObject({ status: 'unlocked', unlockedBy: 'mastery' });
  });

  it('a tutor can enable any level with a reason; the reason stays with the person', () => {
    const s = evaluateLevels(levels, contextOf('p-diego', { tutorUnlocks: { 'level-5': 'Pidió practicar con la tarjeta' } }));
    expect(s.find((x) => x.level.id === 'level-5')).toMatchObject({ status: 'unlocked', unlockedBy: 'tutor', reason: 'Pidió practicar con la tarjeta' });
  });

  it('nothing is lost: a level unlocked by the rule stays open if a wallet metric drops', () => {
    const ctx = contextOf('p-mariana', { investorProfileDone: true, previouslyUnlocked: ['level-7'] });
    expect(statusOf(ctx)['level-7']).toBe('unlocked');
  });

  it('"Ver todo desbloqueado" and the admin free mode open everything', () => {
    expect(Object.values(statusOf(contextOf('p-diego', { demoUnlockAll: true }))).includes('locked')).toBe(false);
    expect(Object.values(statusOf(contextOf('p-diego', { freeMode: true }))).includes('locked')).toBe(false);
  });

  it('phase B levels are not part of phase A', () => {
    expect(evaluateLevels(levels, contextOf('p-diego')).some((s) => s.level.id === 'level-8')).toBe(false);
  });
});
