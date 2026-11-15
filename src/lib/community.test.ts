import { describe, expect, it } from 'vitest';
import { seedOrgData } from '@/store/data-store';
import type { CollectiveGoal } from '@/types/domain';
import { activeGoal, contributes, goalProgress, postProblems } from './community';

/** Step 26 (D-80, F20, D-274): collective goal aggregated with the threshold, and the space's guard. */
describe('collective goal', () => {
  const data = seedOrgData();
  const goal = data.collectiveGoals.find((g) => g.cohortId === 'cohort-operations')!;

  it('counts the active participants of the cohort who did it, as a share', () => {
    const p = goalProgress(goal, data, data.program.passingScore, 5);
    expect(p.status).toBe('ok');
    const members = data.people.filter((x) => x.role === 'participant' && x.status === 'active' && x.cohortIds.includes(goal.cohortId));
    const did = members.filter((m) => data.missionCompletions.some((c) => c.personId === m.id && c.missionId === goal.targetId)).length;
    expect(p.status === 'ok' && p.value.share).toBeCloseTo(did / members.length, 10);
  });

  it('hides the progress of a cohort under the threshold (Comercial has 4 people)', () => {
    const small: CollectiveGoal = { ...goal, id: 'x', cohortId: 'cohort-commercial' };
    expect(goalProgress(small, data, data.program.passingScore, 5).status).toBe('insufficient');
  });

  it('a level goal counts a passed challenge of that level only', () => {
    const level: CollectiveGoal = { ...goal, kind: 'level', targetId: 'level-1' };
    const passed = data.challengeAttempts.find((a) => a.challengeId === 'challenge-level-1' && a.score >= 0.7)!;
    expect(contributes(level, passed.personId, data, 0.7)).toBe(true);
    expect(contributes({ ...level, targetId: 'level-7' }, 'p-diego', data, 0.7)).toBe(false);
  });

  it('only an open goal is active', () => {
    expect(activeGoal(data.collectiveGoals, { id: 'cohort-operations' }, '2026-11-16')?.id).toBe(goal.id);
    expect(activeGoal(data.collectiveGoals, { id: 'cohort-operations' }, '2027-01-01')).toBeUndefined();
  });
});

describe('the space never takes amounts or personal data (F20)', () => {
  it('accepts a question about concepts', () => {
    expect(postProblems('¿Alguien usa la regla 70/20/10 con gastos fijos altos?')).toEqual([]);
    expect(postProblems('Lo vemos en la guía 3, en 2 semanas.')).toEqual([]);
  });

  it('blocks amounts, contacts and account keys, and says which', () => {
    expect(postProblems('Cobro $ 850.000 por mes')).toContain('money');
    expect(postProblems('Debo 1.200.000 de la tarjeta')).toContain('money');
    expect(postProblems('Tengo USD 300 ahorrados')).toContain('money');
    expect(postProblems('Escribime a ana@correo.com')).toContain('contact');
    expect(postProblems('Mi celu 11 4567 8910')).toContain('contact');
    expect(postProblems('CBU 0000003100012345678901')).toContain('account');
    expect(postProblems('   ')).toEqual(['empty']);
  });

  it('the seed conversations pass the guard', () => {
    for (const p of seedOrgData().cohortPosts) expect(postProblems(p.text), p.text).toEqual([]);
    for (const p of seedOrgData('org-ceibo').cohortPosts) expect(postProblems(p.text), p.text).toEqual([]);
  });
});
