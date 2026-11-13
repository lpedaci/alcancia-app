import { describe, expect, it } from 'vitest';
import { seedData } from '@/store/data-store';
import { alerts, cohortsOf, heatmap, itemStats, kpis, learningByLevel, membersOf } from './tutor-data';

/** Tutor's panel (F6, F7, D-58, D-193): computed from the data, with the privacy threshold. */
const data = seedData();
const mine = cohortsOf(data, 'p-kevin');
const commercial = data.cohorts.find((c) => c.id === 'cohort-commercial')!;

describe('tutor panel data', () => {
  it('Kevin tutors the four cohorts of the demo', () => {
    expect(mine.map((c) => c.id).sort()).toEqual(['cohort-administration', 'cohort-commercial', 'cohort-operations', 'cohort-technology']);
  });

  it('KPIs are computed from the data and stay between 0 and 1', () => {
    const k = kpis(data, mine);
    for (const value of [k.participation, k.modules, k.challengeAverage, k.weeklyDone]) {
      expect(value.status).toBe('ok');
      if (value.status === 'ok') {
        expect(value.value).toBeGreaterThanOrEqual(0);
        expect(value.value).toBeLessThanOrEqual(1);
      }
    }
    const active = mine.flatMap((c) => membersOf(data, c)).filter((p) => p.status === 'active').length;
    expect(k.participation.status === 'ok' && k.participation.value).toBeCloseTo(active / k.people, 6);
  });

  it('a cohort of fewer than 5 people shows no group figure (F7)', () => {
    expect(membersOf(data, commercial).length).toBeLessThan(5);
    const k = kpis(data, [commercial]);
    expect([k.participation, k.modules, k.challengeAverage, k.weeklyDone].every((v) => v.status === 'insufficient')).toBe(true);
  });

  it('item statistics only show questions answered by at least 5 people, worst first', () => {
    const { stats, hidden } = itemStats(data, mine);
    expect(stats.length).toBeGreaterThan(0);
    expect(hidden).toBeGreaterThanOrEqual(0);
    for (const s of stats) expect(s.people).toBeGreaterThanOrEqual(5);
    for (let i = 1; i < stats.length; i += 1) expect(stats[i - 1]!.errorRate).toBeGreaterThanOrEqual(stats[i]!.errorRate);
    expect(itemStats(data, [commercial]).stats).toEqual([]);
  });

  it('the deadline shows once when every cohort ends the same day, and alerts lead somewhere', () => {
    const list = alerts(data, mine);
    expect(list.filter((a) => a.kind === 'due_soon')).toHaveLength(1);
    expect(list.every((a) => a.to.startsWith('/tutor'))).toBe(true);
    expect(list[0]!.kind).toBe('due_soon');
  });

  it('the heat map has one row per member and one cell per module of the route', () => {
    const cohort = mine[0]!;
    const rows = heatmap(data, cohort);
    expect(rows).toHaveLength(membersOf(data, cohort).length);
    expect(rows.every((r) => r.cells.length === cohort.moduleIds.length)).toBe(true);
  });

  it('progress by level never says whether a level is locked or unlocked (D-58)', () => {
    const levels = learningByLevel(data, 'p-mariana');
    expect(levels.length).toBeGreaterThan(0);
    for (const l of levels) {
      expect(l).not.toHaveProperty('status');
      expect(Object.keys(l)).not.toContain('locked');
      expect(JSON.stringify(l)).not.toMatch(/"(locked|unlocked)"/);
    }
  });
});
