import { describe, expect, it } from 'vitest';
import { buildMariana } from '@/features/wallet/engine/demo';
import {
  activeDebts,
  advanceDays,
  createWallet,
  fallForScam,
  markMessage,
  openPracticeCard,
  payCard,
  payOffPlan,
  planLeft,
  reportScam,
  walletMetrics,
} from '@/features/wallet/engine/engine';
import type { WalletState } from '@/features/wallet/engine/types';
import { D } from '@/lib/finance';
import { answerStep, checkCriterion, finishMission, type MissionDef, type MissionRun, missionById, nextStep, startMission, walletAfter } from './engine';

/**
 * D-77 and D-208 (step 18): missions play in the person's wallet and leave their mark; a decision is
 * final there and is reverted with an action; a replay is a labelled copy that is never kept. The
 * numbers are the hand-checked cases F-35 to F-37 of docs/formulas.md (medium scenario).
 */
const play = (def: MissionDef, run: MissionRun, input?: string) => nextStep(def, answerStep(def, run, input).run);
const withBalance = (w: WalletState, balance: string): WalletState => ({ ...w, balance });

describe('missions in the person wallet (D-208)', () => {
  it('the first time plays in the wallet; a completed mission replays in a practice copy', () => {
    const mariana = buildMariana();
    const def = missionById('mission-5')!;
    expect(startMission(def, mariana)).toMatchObject({ mode: 'own', startDay: mariana.day });
    expect(startMission(def, mariana).wallet.balance).toBe(mariana.balance);
    const replay = startMission(missionById('mission-4')!, mariana, { replay: true });
    expect(replay.mode).toBe('practice');
    expect(replay.wallet.day).toBe(1);
  });

  it('"Aguanta la caída" is the only exception for now: always a practice copy', () => {
    expect(startMission(missionById('mission-hold-the-drop')!, buildMariana()).mode).toBe('practice');
  });

  it('a finished replay leaves the wallet exactly as it was', () => {
    const def = missionById('mission-security')!;
    const current = buildMariana();
    let run = startMission(def, current, { replay: true });
    run = { ...run, finished: true };
    expect(walletAfter(def, run, current)).toEqual(current);
  });
});

describe('"El préstamo tentador" in the wallet (F-35)', () => {
  const def = missionById('mission-5')!;
  const take = () => {
    const before = buildMariana();
    let run = startMission(def, before);
    run = play(def, run);
    run = play(def, run, 'cft');
    run = play(def, run);
    run = play(def, run, '1.001.691,84');
    const decided = answerStep(def, run, 'accept');
    return { before, run: decided.run };
  };

  it('accepting credits $ 570.000 net, puts the loan in Tus deudas and keeps Invertir locked', () => {
    const { before, run } = take();
    expect(D(run.wallet.balance).minus(before.balance).toFixed(2)).toBe('570000.00');
    const loan = activeDebts(run.wallet).find((d) => d.kind === 'loan')!;
    expect(loan.highRate).toBe(true);
    expect(run.wallet.plans!.at(-1)!.installment).toBe('41737.16');
    expect(walletMetrics(run.wallet).high_rate_debt).toBeGreaterThan(0);
  });

  it('the decision is final in the wallet: choosing again changes nothing', () => {
    const { run } = take();
    expect(answerStep(def, run, 'decline').run).toBe(run);
  });

  it('a month later the installment is debited; paying off what is left reverts the lock', () => {
    const { run } = take();
    const plan = run.wallet.plans!.at(-1)!;
    const later = advanceDays(run.wallet, 30);
    expect(later.movements.some((m) => m.amount === '-41737.16')).toBe(true);
    const after = later.plans!.find((p) => p.id === plan.id)!;
    expect(after.paid).toBe(1);
    expect(planLeft(after).toFixed(2)).toBe('585762.83');
    const paidOff = payOffPlan(later, plan.id);
    expect(walletMetrics(paidOff).high_rate_debt).toBe(0);
  });
});

describe('paying only the minimum (F-36)', () => {
  it('$ 216.000 financed for 30 days at 60 % make $ 226.652,05: $ 10.652,05 of interest', () => {
    let w = openPracticeCard(advanceDays(createWallet('p-test'), 1));
    expect(w.card!.statement!.minimum).toBe('24000.00');
    w = payCard(w, '24000.00');
    const due = w.card!.statement!.dueDay;
    w = advanceDays(w, due - w.day + 1);
    expect(w.card!.statement!.total).toBe('226652.05');
    expect(D(w.card!.statement!.total).minus('216000').toFixed(2)).toBe('10652.05');
  });
});

describe('falling for a fake message (F-37)', () => {
  const base = () => withBalance(advanceDays(createWallet('p-test'), 2), '100000.00');

  it('the code takes $ 30.000 now and $ 30.000 the next day if it is not reported', () => {
    const fell = fallForScam(base(), 'message-x', 'reply_code');
    expect(fell.balance).toBe('70000.00');
    expect(advanceDays(fell, 1).balance.startsWith('40000')).toBe(true);
  });

  it('reporting stops the second attempt; what left does not come back', () => {
    const reported = reportScam(fallForScam(base(), 'message-x', 'open_link'), 'message-x');
    expect(reported.balance).toBe('70000.00');
    expect(reported.scamPending).toBeUndefined();
  });

  it('"transferir para invertir" sends $ 50.000 once', () => {
    const fell = fallForScam(base(), 'message-x', 'transfer');
    expect(fell.balance).toBe('50000.00');
    expect(fell.scamPending).toBeUndefined();
  });

  it('reporting a fallen message from the bell also stops the second attempt', () => {
    const w = advanceDays(createWallet('p-test'), 45);
    const message = w.messages!.at(-1)!;
    const fell = fallForScam(markMessage(w, message.id, 'fell'), message.id, 'reply_code');
    expect(markMessage(fell, message.id, 'reported').scamPending).toBeUndefined();
  });

  it('mission 6 in the wallet: giving the code costs $ 30.000; reporting stops the next attempt', () => {
    const def = missionById('mission-6')!;
    let run = startMission(def, withBalance(buildMariana(), '100000.00'));
    run = play(def, run);
    run = play(def, run, JSON.stringify({ m1: 'safe', m2: 'suspicious', m3: 'safe' }));
    run = answerStep(def, run, 'give').run;
    expect(run.wallet.balance).toBe('70000.00');
    run = answerStep(def, run, 'report').run;
    expect(run.wallet.scamPending).toBeUndefined();
  });
});

describe('a step that does not fit the balance (D-208, criterion 3)', () => {
  it('does not advance and says why, instead of breaking the mission', () => {
    const def = missionById('mission-3')!;
    let run = startMission(def, createWallet('p-test'));
    run = play(def, run);
    const tried = answerStep(def, run);
    expect(tried.error).toBe('insufficient_balance');
    expect(tried.run.results).toEqual(run.results);
  });
});

describe('criteria count from the run start, not from the wallet history', () => {
  it('"this month" is the month the run started in', () => {
    const wallet = { ...createWallet('p-test'), day: 154, monthSummaries: [{ month: 5, income: '0', needs: '0', wants: '0', saved: '0', yield: '0', savingsWithdrawn: false, green: true }] };
    const run = { ...startMission(missionById('mission-7')!, wallet as WalletState), wallet: wallet as WalletState };
    expect(checkCriterion({ id: 'x', description: '', check: 'month_green', param: '0' }, run)).toBe(true);
  });
});

it('finishing a mission in the wallet keeps what happened and records the completion', () => {
  const def = missionById('mission-security')!;
  let run = startMission(def, buildMariana());
  run = { ...run, wallet: { ...run.wallet, securitySettings: { twoFactor: true, dailyLimit: '200000.00' } } };
  const finished = finishMission(def, { ...run, results: Object.fromEntries(def.steps!.map((s) => [s.id, { attempts: 1, done: true, correct: true }])) });
  if (finished.finished) expect(walletAfter(def, finished, buildMariana()).securitySettings.twoFactor).toBe(true);
});
