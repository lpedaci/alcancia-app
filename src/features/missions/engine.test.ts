import { describe, expect, it } from 'vitest';
import { createWallet } from '@/features/wallet/engine/engine';
import { buildMariana, POCKET_SAVINGS } from '@/features/wallet/engine/demo';
import {
  answerStep,
  canContinue,
  criteriaStatus,
  currentStep,
  finishMission,
  isPlayable,
  type MissionDef,
  type MissionRun,
  MISSION_DEFS,
  missionById,
  nextStep,
  startMission,
  walletAfter,
} from './engine';

const mission1 = missionById('mission-1')!;
const security = missionById('mission-security')!;

/** Answers and moves on, as the person would. */
function play(def: MissionDef, run: MissionRun, input?: string) {
  const answered = answerStep(def, run, input);
  return { ...answered, run: nextStep(def, answered.run) };
}

describe('mission catalog (D-59, D-166)', () => {
  it('has the 13 phase A missions, each with a level, and the first two are playable', () => {
    expect(MISSION_DEFS).toHaveLength(13);
    expect(MISSION_DEFS.filter((m) => isPlayable(m)).map((m) => m.id)).toEqual(['mission-security', 'mission-1']);
  });

  it('every playable mission ends with a summary and its criteria point to real steps', () => {
    for (const def of MISSION_DEFS.filter((m) => isPlayable(m))) {
      expect(def.steps!.at(-1)!.kind).toBe('summary');
      const ids = new Set(def.steps!.map((s) => s.id));
      for (const c of def.criteria ?? []) if (c.check.startsWith('step_')) expect(ids.has(c.param!)).toBe(true);
    }
  });

  it('single questions name an existing correct option', () => {
    for (const def of MISSION_DEFS) {
      for (const step of def.steps ?? []) {
        if (step.kind === 'single') expect(step.options.map((o) => o.id)).toContain(step.correct);
      }
    }
  });
});

describe('mission 1 "Tu primer cobro" (5.3, D-53, D-54, D-55)', () => {
  const start = () => startMission(mission1, buildMariana());

  it('runs on a fresh practice account, not on the person wallet', () => {
    const run = start();
    expect(run.wallet.day).toBe(0);
    expect(run.wallet.balance).toBe('0.00');
  });

  it('credits the net salary of the demo payslip', () => {
    const { run, feedback } = answerStep(mission1, start());
    expect(run.wallet.balance).toBe('1284958.86');
    expect(feedback?.tone).toBe('success');
  });

  it('a wrong answer gives a hint in info tone and does not let the person go on', () => {
    let run = play(mission1, start()).run; // salary
    const answered = answerStep(mission1, run, 'gross');
    expect(answered.feedback?.tone).toBe('info');
    expect(canContinue(mission1, answered.run)).toBe(false);
    run = play(mission1, answered.run, 'net').run;
    expect(currentStep(mission1, run)?.id).toBe('save');
  });

  it('20 % of $ 1.284.958,86 is $ 256.991,77, with a tolerance of $ 1 (hand calculation)', () => {
    let run = play(mission1, start()).run;
    run = play(mission1, run, 'net').run;
    const wrong = answerStep(mission1, run, '250.000');
    expect(wrong.feedback?.tone).toBe('info');
    expect(wrong.feedback?.text).toContain('256.991,77');
    const right = answerStep(mission1, wrong.run, '256.992');
    expect(right.feedback?.tone).toBe('success');
    expect(right.run.wallet.pockets.find((p) => p.id === POCKET_SAVINGS)?.amount).toBe('256992.00');
    expect(right.run.results.save).toMatchObject({ correct: true, attempts: 2 });
  });

  it('charges the surprise subscription of $ 4.990 and lets the person cancel it or change her mind', () => {
    let run = play(mission1, start()).run;
    run = play(mission1, run, 'net').run;
    run = play(mission1, run, '256991,77').run;
    run = play(mission1, run).run; // surprise event
    expect(run.wallet.movements.at(-1)).toMatchObject({ amount: '-4990.00', expenseKey: 'subscription' });
    const cancelled = answerStep(mission1, run, 'cancel').run;
    expect(cancelled.wallet.subscriptionActive).toBe(false);
    const kept = answerStep(mission1, cancelled, 'keep').run;
    expect(kept.wallet.subscriptionActive).toBe(true);
  });

  it('finishes with every criterion met and only records the completion on the person wallet', () => {
    let run = play(mission1, start()).run;
    run = play(mission1, run, 'net').run;
    run = play(mission1, run, '256991,77').run;
    run = play(mission1, run).run;
    run = play(mission1, run, 'cancel').run;
    expect(currentStep(mission1, run)?.kind).toBe('summary');
    expect(criteriaStatus(mission1, run).every((c) => c.met)).toBe(true);
    const finished = finishMission(mission1, run);
    expect(finished.finished).toBe(true);
    expect(finished.statements.at(-1)).toMatchObject({ verb: 'completed', object: 'mission-1' });
    const current = createWallet('p-test');
    const after = walletAfter(mission1, finished, current);
    expect(after.completedMissionIds).toContain('mission-1');
    expect(after.balance).toBe('0.00');
  });

  it('does not finish while a criterion is missing', () => {
    const run = play(mission1, start()).run;
    expect(finishMission(mission1, run).finished).toBe(false);
  });
});

describe('mission "Configura tu seguridad" (level 0)', () => {
  it('keeps the security settings on the person wallet', () => {
    const wallet = createWallet('p-test');
    let run = startMission(security, wallet);
    run = play(security, run).run; // card
    run = play(security, run).run; // two factor
    run = play(security, run, '300000').run;
    expect(answerStep(security, run, 'give').feedback?.tone).toBe('info');
    run = play(security, answerStep(security, run, 'give').run, 'check').run;
    run = finishMission(security, run);
    expect(run.finished).toBe(true);
    const after = walletAfter(security, run, wallet);
    expect(after.securitySettings).toEqual({ twoFactor: true, dailyLimit: '300000.00' });
    expect(after.completedMissionIds).toContain('mission-security');
  });

  it('records an xAPI-like statement for each answer (F21)', () => {
    let run = startMission(security, createWallet('p-test'));
    run = play(security, run).run;
    run = play(security, run).run;
    run = play(security, run, '100000').run;
    run = answerStep(security, run, 'email').run;
    expect(run.statements.filter((s) => s.verb === 'answered')).toHaveLength(2);
    expect(run.statements[0]).toEqual({ verb: 'started', object: 'mission-security' });
  });
});
