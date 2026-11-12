import { describe, expect, it } from 'vitest';
import { D } from '@/lib/finance';
import { buildDiego, buildMariana, DEMO_DAYS, POCKET_EMERGENCY, POCKET_SAVINGS } from './demo';
import {
  advanceDays,
  advanceMonth,
  categorize,
  chargeSurpriseSubscription,
  createPocket,
  createWallet,
  dayOfMonth,
  essentialMonthlyExpenses,
  monthOf,
  moveToPocket,
  walletMetrics,
  WalletError,
  withdrawFromPocket,
} from './engine';

/** docs/wallet-engine.md, cases checked by hand. */
describe('time (section 2)', () => {
  it('maps days to simulated months of 30 days', () => {
    expect([monthOf(0), monthOf(1), monthOf(30), monthOf(31), monthOf(154)]).toEqual([-1, 0, 0, 1, 5]);
    expect([dayOfMonth(1), dayOfMonth(30), dayOfMonth(31), dayOfMonth(154)]).toEqual([1, 30, 1, 4]);
  });

  it('"Avanzar un mes" goes to the last day of the month in progress', () => {
    expect(advanceMonth(createWallet('p')).day).toBe(30);
    expect(advanceMonth(advanceDays(createWallet('p'), 12)).day).toBe(30);
    expect(advanceMonth(advanceDays(createWallet('p'), 30)).day).toBe(60);
  });
});

describe('income and expenses (sections 3 to 5)', () => {
  it('credits the net salary of D-54 on day 1, before the debits of the day', () => {
    const s = advanceDays(createWallet('p'), 1);
    expect(s.movements[0]).toMatchObject({ type: 'income', amount: '1284958.86', day: 1 });
    expect(s.balance).toBe('1284958.86');
  });

  it('charges month 1 at day-0 prices: needs $ 650.000 and wants $ 186.500 without the subscription', () => {
    const s = advanceDays(createWallet('p'), 30);
    const summary = s.monthSummaries[0]!;
    expect(summary.needs).toBe('650000.00');
    expect(summary.wants).toBe('186500.00');
    expect(summary.income).toBe('1284958.86');
  });

  it('updates prices: monthly by inflation, rent and salary every 3 months (D-111)', () => {
    const s = advanceDays(createWallet('p'), 91); // day 91 = month 3
    expect(s.expenses.groceries).toBe('207618.13'); // 190000 × 1.03, rounded each month
    expect(s.expenses.rent).toBe('415236.26'); // 380000 × 1.03^3 (INC-08)
    expect(s.salary).toBe('1404109.24'); // 1284958.86 × 1.03^3 (D-142)
    expect(s.expenses.subscription).toBe('4990.00'); // fixed (D-55)
  });

  it('never lets the balance go negative: a debit that cannot be charged stays pending and stops the advance', () => {
    let s = advanceDays(createWallet('p'), 1);
    s = createPocket(s, { id: 'big', name: 'Todo' });
    s = moveToPocket(s, 'big', s.balance);
    s = advanceDays(s, 10);
    expect(s.pendingDebit).toMatchObject({ expenseKey: 'transport', day: 2 });
    expect(s.day).toBe(2);
    expect(D(s.balance).gte(0)).toBe(true);
    expect(advanceDays(s, 5).day).toBe(2);
  });
});

describe('pockets, categories and metrics (sections 7, 8 and 13)', () => {
  it('moves money into a pocket and back, and rejects what is not there', () => {
    let s = advanceDays(createWallet('p'), 1);
    s = createPocket(s, { id: POCKET_SAVINGS, name: 'Ahorro' });
    s = moveToPocket(s, POCKET_SAVINGS, '256991.77');
    expect(s.pockets[0]!.amount).toBe('256991.77');
    expect(s.balance).toBe('1027967.09');
    expect(() => moveToPocket(s, POCKET_SAVINGS, '9999999')).toThrow(WalletError);
    s = withdrawFromPocket(s, POCKET_SAVINGS, '1000');
    expect(s.pockets[0]!.amount).toBe('255991.77');
  });

  it('counts only confirmed categories, and only for expenses', () => {
    let s = advanceDays(createWallet('p'), 5);
    expect(walletMetrics(s).categorized_movements).toBe(0);
    const expense = s.movements.find((m) => m.type === 'qr_payment')!;
    s = categorize(s, expense.id, 'needs');
    s = categorize(s, s.movements[0]!.id, 'needs'); // the salary does not count
    expect(walletMetrics(s).categorized_movements).toBe(1);
  });

  it('marks a month in green only with savings of at least 10 % and nothing withdrawn (D-115)', () => {
    const noSavings = advanceDays(createWallet('p'), 30);
    expect(noSavings.monthSummaries[0]!.green).toBe(false);
    let s = advanceDays(createWallet('p'), 1);
    s = createPocket(s, { id: POCKET_SAVINGS, name: 'Ahorro' });
    s = moveToPocket(s, POCKET_SAVINGS, '200000');
    expect(advanceDays(s, 29).monthSummaries[0]!.green).toBe(true);
    s = withdrawFromPocket(s, POCKET_SAVINGS, '1000');
    expect(advanceDays(s, 29).monthSummaries[0]!.green).toBe(false);
  });

  it('the surprise subscription is debited now and every day 1 until cancelled (D-55)', () => {
    let s = chargeSurpriseSubscription(advanceDays(createWallet('p'), 1));
    expect(s.movements.at(-1)).toMatchObject({ amount: '-4990.00', expenseKey: 'subscription' });
    s = advanceDays(s, 30);
    expect(s.movements.filter((m) => m.expenseKey === 'subscription')).toHaveLength(2);
  });
});

describe('demo states (CLAUDE.md 7, INC-08)', () => {
  it('are deterministic', () => {
    expect(buildMariana()).toEqual(buildMariana());
    expect(buildDiego()).toEqual(buildDiego());
  });

  it('Diego is on day 12 at level 2: one salary, "Ahorro" with 20 %, fewer than 10 categories', () => {
    const s = buildDiego();
    expect(s.day).toBe(DEMO_DAYS['p-diego']);
    expect(s.completedMissionIds).toEqual(['mission-security', 'mission-1']);
    expect(s.pockets).toEqual([{ id: POCKET_SAVINGS, name: 'Ahorro', amount: '256991.77' }]);
    expect(walletMetrics(s).categorized_movements).toBe(4);
    expect(s.pendingDebit).toBeUndefined();
  });

  it('Mariana is on day 154 at level 6 with an emergency fund of 2 of 3 months, computed with month 4 prices', () => {
    const s = buildMariana();
    expect(s.day).toBe(DEMO_DAYS['p-mariana']);
    expect(s.pendingDebit).toBeUndefined();
    expect(D(s.balance).gt(0)).toBe(true);
    // INC-08: the fund has to be between 2 and 3 times the essential expenses of the last closed month.
    const essential = essentialMonthlyExpenses(s);
    const fund = D(s.pockets.find((p) => p.id === POCKET_EMERGENCY)!.amount);
    expect(fund.gte(essential.times(2))).toBe(true);
    expect(fund.lt(essential.times(3))).toBe(true);
    const metrics = walletMetrics(s);
    expect(Number(metrics.emergency_months)).toBeGreaterThanOrEqual(2);
    expect(Number(metrics.emergency_months)).toBeLessThan(3);
    expect(metrics.emergency_pocket).toBe(1);
    expect(metrics.months_closed_green).toBeGreaterThanOrEqual(1);
    expect(metrics.categorized_movements).toBeGreaterThanOrEqual(10);
    expect(metrics.high_rate_debt).toBe(0);
    expect(s.movements.some((m) => m.type === 'yield')).toBe(true);
    expect(s.movements.every((m) => !m.amount.startsWith('-') || m.type !== 'income')).toBe(true);
  });

  it('every closed month of Mariana is in green', () => {
    expect(buildMariana().monthSummaries.every((m) => m.green)).toBe(true);
  });
});
