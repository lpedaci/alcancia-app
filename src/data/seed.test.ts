import { describe, expect, it } from 'vitest';
import { DEMO_TODAY, PRIVACY_THRESHOLD_MIN } from '@/app/config';
import brokers from './brokers.json';
import demoStates from './demo-states.json';
import fintech from './fintech.json';
import levels from './levels.json';
import modules from './modules.json';
import scenarios from './scenarios.json';
import seed from './seed.json';

const participants = seed.people.filter((p) => p.role === 'participant');

describe('seed data (CLAUDE.md 7)', () => {
  it('has about 80 participants in 4 cohorts, one per area', () => {
    expect(participants).toHaveLength(80);
    expect(seed.cohorts).toHaveLength(4);
    expect(new Set(seed.cohorts.map((c) => c.area)).size).toBe(4);
  });

  it('has at least one cohort below the privacy threshold', () => {
    const sizes = seed.cohorts.map((c) => participants.filter((p) => p.cohortIds.includes(c.id)).length);
    expect(sizes.some((n) => n < PRIVACY_THRESHOLD_MIN)).toBe(true);
  });

  it('operational staff uses the phone more than office staff (4.1)', () => {
    const mobileShare = (area: string) => {
      const group = participants.filter((p) => p.area === area);
      return group.filter((p) => p.device === 'mobile').length / group.length;
    };
    expect(mobileShare('operations')).toBeGreaterThan(mobileShare('administration'));
    expect(mobileShare('operations')).toBeGreaterThan(mobileShare('technology'));
  });

  it('uses fictitious .demo emails only', () => {
    expect(seed.people.every((p) => p.email.endsWith('@andina.demo'))).toBe(true);
  });

  it('has the four demo roles with their personas', () => {
    const byId = Object.fromEntries(seed.people.map((p) => [p.id, p]));
    expect(byId['p-paula']).toMatchObject({ role: 'ld_admin', name: 'Paula Gómez' });
    expect(byId['p-andres']).toMatchObject({ role: 'tutor', name: 'Andrés Molina' });
    expect(byId['p-mariana']).toMatchObject({ role: 'participant', device: 'desktop', status: 'active' });
    expect(byId['p-diego']).toMatchObject({ role: 'participant', device: 'mobile', status: 'active' });
    expect(byId['p-ricardo']).toMatchObject({ role: 'sponsor', name: 'Ricardo Benítez' });
  });

  it('dates are coherent with the demo date and the program start (D-60)', () => {
    expect(seed.program.name).toBe('Bienestar financiero 2026');
    expect(seed.program.startDate).toBe('2026-08-03');
    const dates = [
      ...seed.guideProgress.map((g) => g.completedAt),
      ...seed.challengeAttempts.map((a) => a.finishedAt.slice(0, 10)),
      ...seed.weeklyReports.map((r) => r.reportedAt),
    ];
    expect(dates.every((d) => !d || d <= DEMO_TODAY)).toBe(true);
  });

  it('Diego: level 1 challenge passed, level 2 in progress, one weekly challenge done (D-63)', () => {
    const learning = seed.levelLearning.filter((l) => l.personId === 'p-diego');
    expect(learning.find((l) => l.levelId === 'level-1')).toMatchObject({ challenge: 'passed', completed: true });
    expect(learning.find((l) => l.levelId === 'level-2')?.completed).toBe(false);
    expect(seed.weeklyReports.filter((r) => r.personId === 'p-diego')).toHaveLength(1);
    expect(demoStates['p-diego'].currentLevelId).toBe('level-2');
  });

  it('Mariana: level 6 challenge passed, Invertir locked by her wallet, a weekly challenge pending', () => {
    expect(seed.levelLearning.find((l) => l.personId === 'p-mariana' && l.levelId === 'level-6')?.challenge).toBe('passed');
    const lock = demoStates['p-mariana'].levelProgress.find((l) => l.levelId === 'level-7');
    expect(lock?.status).toBe('locked');
    const open = seed.weeklyChallenges.filter((w) => w.cohortId === 'cohort-operations' && w.dueDate > DEMO_TODAY);
    expect(open.length).toBeGreaterThan(0);
    expect(seed.weeklyReports.some((r) => r.personId === 'p-mariana' && open.some((w) => w.id === r.challengeId))).toBe(false);
  });
});

describe('privacy of the shared seed (D-58, D-62, 5.3)', () => {
  const text = JSON.stringify(seed);

  it('has no money, wallet, habit, reflection or lock-state data', () => {
    expect(text).not.toMatch(/"(balance|amount|movements|pocket|saldo|habit|habitAnswers|reflection)"/i);
    expect(text).not.toMatch(/"status":"(locked|unlocked)"/);
    expect(seed.levelLearning.every((l) => !('status' in l))).toBe(true);
  });

  it('Conocerte results carry knowledge scores only', () => {
    for (const d of seed.diagnostics) {
      expect(Object.keys(d).sort()).toEqual(['kind', 'personId', 'scores', 'takenAt']);
    }
  });

  it('tutor questions mention no amounts', () => {
    expect(seed.tutorQuestions.every((q) => !/\$\s?\d/.test(q.text + (q.answer?.text ?? '')))).toBe(true);
  });
});

describe('content and reference data', () => {
  it('levels 0 to 7 are phase A, and every level from 2 asks for the previous challenge (D-63)', () => {
    expect(levels.filter((l) => l.phase === 'A').map((l) => l.order)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    for (const level of levels.filter((l) => l.order >= 2 && l.order <= 7)) {
      const previous = `challenge-level-${level.order - 1}`;
      expect(level.unlock.all.some((c) => c.type === 'challenge_passed' && 'challengeId' in c && c.challengeId === previous)).toBe(true);
    }
  });

  it('16 modules plus the module 18 base guide in phase A, each with a level and a dimension (D-61, D-116)', () => {
    const phaseA = modules.filter((m) => m.phase === 'A');
    expect(phaseA).toHaveLength(17);
    const guideModules = levels.flatMap((l) => l.guideModuleIds);
    for (const m of modules) {
      expect(guideModules).toContain(m.id);
      expect(['budget', 'savings', 'debt', 'inflation_rates', 'goals']).toContain(m.dimension);
    }
  });

  it('scenarios are example values with the rates of D-110', () => {
    expect(scenarios.map((s) => [s.id, s.monthlyInflation])).toEqual([
      ['low', '0.015'],
      ['medium', '0.03'],
      ['high', '0.06'],
    ]);
    expect(scenarios.every((s) => s.note === 'example')).toBe(true);
    expect(scenarios[0]?.exampleRates).toMatchObject({ fixedTerm: '0.22', moneyMarket: '0.20' });
  });

  it('brokers and wallets were verified in official registries, in alphabetical order, without rankings', () => {
    expect(brokers.map((b) => b.nombreComercial)).toEqual([...brokers.map((b) => b.nombreComercial)].sort((a, b) => a.localeCompare(b)));
    for (const row of [...brokers, ...fintech]) {
      expect(row.verificadoEl).toBe('2026-11-12');
      expect(row.fuente).toMatch(/bcra\.gob\.ar|cnv\.gov\.ar|byma\.com\.ar/);
      expect(JSON.stringify(row)).not.toMatch(/mejor|ranking|comisi[oó]n|tasa|promo/i);
    }
    expect(fintech).toHaveLength(11);
  });

  it('PPI keeps its row with a dated note about the announced merger (Annex C, Q-15)', () => {
    const ppi = brokers.find((b) => b.nombreComercial === 'PPI') as (typeof brokers)[number] & { nota?: string; notaFecha?: string };
    expect(ppi.nota).toMatch(/Banco de Valores/);
    expect(ppi.notaFecha).toBe('2026-11');
  });
});
