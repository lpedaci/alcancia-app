import { describe, expect, it } from 'vitest';
import { activeDebts, createWallet, walletMetrics } from '@/features/wallet/engine/engine';
import { debtPayoff } from '@/lib/finance';
import { buildMariana, POCKET_SAVINGS } from '@/features/wallet/engine/demo';
import {
  answerStep,
  fillText,
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
  it('has the 13 phase A missions; levels 0 to 5 are playable', () => {
    expect(MISSION_DEFS).toHaveLength(13);
    expect(MISSION_DEFS.filter((m) => isPlayable(m)).map((m) => m.id)).toEqual(['mission-security', 'mission-1', 'mission-2', 'mission-3', 'mission-6', 'mission-7', 'mission-emergency-fund', 'mission-5', 'mission-debts']);
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

describe('missions of level 2 (step 7)', () => {
  const start = (id: string) => startMission(missionById(id)!, buildMariana());

  it('mission 2: confirming with the wrong holder sends the money to another person, and the fix pays Sofía', () => {
    const def = missionById('mission-2')!;
    let run = start('mission-2');
    expect(run.wallet.balance).toBe('1284958.86'); // starts after the first salary
    run = play(def, run).run; // situation card
    const wrong = answerStep(def, run, 'confirm');
    expect(wrong.feedback?.tone).toBe('info');
    expect(wrong.run.wallet.balance).toBe('1272958.86'); // $ 1.284.958,86 − $ 12.000 sent to Sofía Ramírez
    run = play(def, wrong.run, 'cancel').run;
    run = play(def, run, 'right').run;
    expect(run.wallet.balance).toBe('1260958.86'); // and $ 12.000 more to Sofía Ramos
    expect(criteriaStatus(def, run).every((c) => c.met)).toBe(true);
  });

  it('mission 3: pays $ 3.500 with QR and checks the receipt', () => {
    const def = missionById('mission-3')!;
    let run = play(def, start('mission-3')).run;
    run = play(def, run).run; // pay
    expect(run.wallet.movements.at(-1)).toMatchObject({ type: 'qr_payment', amount: '-3500.00' });
    expect(answerStep(def, run, 'again').feedback?.tone).toBe('info');
    run = play(def, run, 'receipt').run;
    expect(criteriaStatus(def, run).every((c) => c.met)).toBe(true);
  });

  it('mission 6: the three messages must be classified right before reporting the false one', () => {
    const def = missionById('mission-6')!;
    let run = play(def, start('mission-6')).run;
    const wrong = answerStep(def, run, JSON.stringify({ m1: 'safe', m2: 'safe', m3: 'safe' }));
    expect(wrong.feedback?.tone).toBe('info');
    expect(answerStep(def, run, JSON.stringify({ m1: 'safe' })).feedback).toBeUndefined(); // incomplete: not checked
    run = play(def, wrong.run, JSON.stringify({ m1: 'safe', m2: 'suspicious', m3: 'safe' })).run;
    run = play(def, run, 'report').run;
    expect(finishMission(def, run).finished).toBe(true);
  });
});

describe('mission 7 "Mes completo" (step 7.3)', () => {
  const def = missionById('mission-7')!;

  it('closes month 0 in green after saving 10 % and paying the repair from the balance (hand calculation)', () => {
    let run = startMission(def, buildMariana());
    run = play(def, run).run; // card
    const low = answerStep(def, run, '64.247,94'); // 5 %: not enough
    expect(low.feedback?.text).toContain('128.495,89'); // $ 1.284.958,86 × 0,1
    run = play(def, low.run, '128.495,89').run;
    run = play(def, run).run; // phone raised to $ 22.000
    expect(run.wallet.expenses.phone).toBe('22000.00');
    expect(answerStep(def, run, 'savings').feedback?.tone).toBe('info');
    run = play(def, run, 'balance').run;
    run = play(def, run).run; // close the month
    expect(run.wallet.day).toBe(30);
    expect(run.wallet.monthSummaries[0]).toMatchObject({ month: 0, green: true });
    expect(criteriaStatus(def, run).every((c) => c.met)).toBe(true);
  });
});

describe('mission "Crea tu fondo de emergencia" (step 7.4)', () => {
  const def = missionById('mission-emergency-fund')!;

  it('3 months of $ 650.000 make a goal of $ 1.950.000, and the first contribution funds it (hand calculation)', () => {
    let run = play(def, startMission(def, buildMariana())).run;
    const wrong = answerStep(def, run, '650.000');
    expect(wrong.feedback?.text).toContain('1.950.000');
    run = play(def, wrong.run, '1.950.000').run;
    expect(run.wallet.pockets.find((p) => p.isEmergencyFund)).toMatchObject({ goal: '1950000.00', amount: '0.00' });
    run = play(def, run, 'p20').run;
    expect(run.wallet.pockets.find((p) => p.isEmergencyFund)?.amount).toBe('256991.77');
    run = play(def, answerStep(def, run, 'stocks').run, 'liquid').run;
    expect(finishMission(def, run).finished).toBe(true);
  });
});

describe('mission "El préstamo tentador" (step 8.3)', () => {
  const def = missionById('mission-5')!;
  const plain = (text?: string) => (text ?? '').replaceAll(String.fromCharCode(160), ' ');

  it('fills the offer of the scenario, asks for the CFT and the total, and accepting creates a high-rate debt', () => {
    let run = play(def, startMission(def, createWallet('p'))).run;
    expect(plain(answerStep(def, run, 'tna').feedback?.text)).not.toContain('{{');
    const cft = answerStep(def, run, 'cft');
    expect(plain(cft.feedback?.text)).toContain('81,8 %');
    run = play(def, cft.run).run;
    run = play(def, run).run;
    const wrong = answerStep(def, run, '41.737,16');
    expect(plain(wrong.feedback?.text)).toContain('$ 1.001.691,84');
    const right = answerStep(def, wrong.run, '1.001.691,84');
    expect(plain(right.feedback?.text)).toContain('$ 431.691,84');
    run = nextStep(def, right.run);
    const accepted = answerStep(def, run, 'accept');
    expect(walletMetrics(accepted.run.wallet).high_rate_debt).toBe(1);
    // Changing your mind replays from before the loan.
    const declined = answerStep(def, accepted.run, 'decline');
    expect(activeDebts(declined.run.wallet)).toEqual([]);
    expect(finishMission(def, nextStep(def, declined.run)).finished).toBe(true);
  });
});

describe('mission "Sal de tus deudas" (step 8.3)', () => {
  const def = missionById('mission-debts')!;

  it('its numbers are the ones SIM-9 gives for the A-29 case', () => {
    const debts = [
      { id: 'card', name: 'Tarjeta', balance: '40000', tna: '1.5', minimumPayment: '4000' },
      { id: 'fin', name: 'Financiera', balance: '15000', tna: '1.1', minimumPayment: '1500' },
      { id: 'bank', name: 'Crédito bancario', balance: '200000', tna: '0.8', minimumPayment: '10000' },
    ];
    const snow = debtPayoff({ debts, extra: '20000', method: 'snowball' });
    const aval = debtPayoff({ debts, extra: '20000', method: 'avalanche' });
    expect([snow.months, snow.totalInterest.toFixed(2), snow.paidOff[0]]).toEqual([11, '111507.88', { id: 'fin', name: 'Financiera', month: 1 }]);
    expect([aval.months, aval.totalInterest.toFixed(2), aval.paidOff[0]?.month]).toEqual([11, '109817.08', 2]);
    expect(snow.totalInterest.minus(aval.totalInterest).toFixed(2)).toBe('1690.80');
  });

  it('is completed by ordering with both methods, choosing one and applying it', () => {
    let run = play(def, startMission(def, createWallet('p'))).run;
    run = play(def, answerStep(def, run, 'fin').run, 'card').run;
    run = play(def, run, 'fin').run;
    run = play(def, run).run;
    run = play(def, run, 'snowball').run;
    run = play(def, answerStep(def, run, 'split').run, 'priority').run;
    expect(criteriaStatus(def, run).every((c) => c.met)).toBe(true);
  });
});

describe('mission texts', () => {
  it('every text shown on screen is filled in: no {{placeholder}} is left', () => {
    for (const def of MISSION_DEFS.filter((m) => isPlayable(m))) {
      const run = startMission(def, createWallet('p'));
      for (const step of def.steps!) {
        const texts = Object.entries(step)
          .filter(([key, value]) => typeof value === 'string' && ['title', 'body', 'prompt', 'instruction', 'fuerte'].includes(key))
          .map(([, value]) => value as string);
        if ('options' in step) texts.push(...step.options.flatMap((o) => [o.text, o.feedback]));
        for (const text of texts) expect(fillText(text, run), `${def.id}/${step.id}`).not.toContain('{{');
      }
    }
  });
});
