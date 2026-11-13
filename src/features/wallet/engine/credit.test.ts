import { describe, expect, it } from 'vitest';
import { D } from '@/lib/finance';
import {
  acceptLoan,
  activeDebts,
  advanceDays,
  buyInCash,
  buyInInstallments,
  createPocket,
  createWallet,
  dayOfMonth,
  loanOffer,
  monthBreakdown,
  moveToPocket,
  openPracticeCard,
  payCard,
  payOffPlan,
  statementLeft,
  walletMetrics,
  WalletError,
  withdrawFromPocket,
} from './engine';

/** docs/wallet-engine.md section 9 and formulas.md section 17, cases checked by hand. */
const paid = () => advanceDays(createWallet('p'), 1);

describe('practice card (section 9, D-112)', () => {
  it('arrives with a $ 240.000 statement due on day 10, minimum $ 24.000, at the scenario TNA', () => {
    const s = openPracticeCard(paid());
    expect(s.card).toMatchObject({ limit: '1500000.00', tna: '0.60', paidInFull: 0 });
    expect(s.card!.statement).toMatchObject({ total: '240000.00', minimum: '24000.00', paid: '0.00', dueDay: 10, financed: false });
    // Opening it twice changes nothing.
    expect(openPracticeCard(s)).toBe(s);
  });

  it('a statement not yet due is not a debt; paying it in full clears the card when the due day passes', () => {
    let s = openPracticeCard(paid());
    expect(walletMetrics(s).high_rate_debt).toBe(0);
    s = payCard(s, '240000');
    expect(statementLeft(s).toFixed(2)).toBe('0.00');
    expect(s.movements.at(-1)).toMatchObject({ type: 'card_payment', amount: '-240000.00', suggestedCategory: 'needs' });
    s = advanceDays(s, 10);
    expect(s.card!.statement).toBeUndefined();
    expect(s.card!.paidInFull).toBe(1);
    expect(activeDebts(s)).toEqual([]);
  });

  it('F-31: paying the minimum finances $ 216.000, which becomes $ 226.652,05 and a high-rate debt', () => {
    let s = payCard(openPracticeCard(paid()), '24000');
    s = advanceDays(s, 10);
    expect(s.card!.statement).toMatchObject({ total: '226652.05', minimum: '22665.21', dueDay: 40, financed: true, belowMinimum: false });
    const [debt] = activeDebts(s);
    // TEA of 60 % renewed every 30 days ≈ 79,6 %, above the 42,6 % annual inflation of the scenario.
    expect(debt).toMatchObject({ kind: 'card', highRate: true });
    expect(debt!.tea.toFixed(3)).toBe('0.796');
    expect(walletMetrics(s).high_rate_debt).toBe(1);
  });

  it('paying below the minimum is flagged for the next statement', () => {
    const s = advanceDays(payCard(openPracticeCard(paid()), '1000'), 10);
    expect(s.card!.statement!.belowMinimum).toBe(true);
  });

  it('rejects paying more than what is due or more than the balance', () => {
    const s = openPracticeCard(paid());
    expect(() => payCard(s, '240000.01')).toThrow(WalletError);
    expect(() => payCard(s, '0')).toThrow(WalletError);
    const empty = moveToPocket(createPocket(s, { id: 'x', name: 'X' }), 'x', s.balance);
    expect(() => payCard(empty, '1000')).toThrow('insufficient_balance');
  });
});

describe('loan offer and installments (section 9, F-29, F-30)', () => {
  it('the medium-scenario offer: $ 600.000 in 24 installments of $ 41.737,16, $ 570.000 received and a CFT of about 81,8 %', () => {
    const offer = loanOffer({ scenarioId: 'medium' });
    expect(offer.installment.toFixed(2)).toBe('41737.16');
    expect(offer.total.toFixed(2)).toBe('1001691.84');
    expect(offer.received.toFixed(2)).toBe('570000.00');
    expect(offer.cft.toDecimalPlaces(3).toFixed(3)).toBe('0.818');
    expect(offer.tea.toDecimalPlaces(3).toFixed(3)).toBe('0.712');
  });

  it('accepting credits the principal, charges the commission and debits an installment each month', () => {
    let s = acceptLoan(paid());
    const before = D(paid().balance);
    expect(D(s.balance).minus(before).toFixed(2)).toBe('570000.00');
    expect(walletMetrics(s).high_rate_debt).toBe(1);
    expect(() => acceptLoan(s)).toThrow('loan_active');
    s = advanceDays(s, 30);
    const installments = s.movements.filter((m) => m.type === 'loan' && m.counterparty.includes('cuota'));
    expect(installments).toHaveLength(1);
    expect(installments[0]).toMatchObject({ day: 31, amount: '-41737.16' });
    expect(installments[0]!.counterparty).toContain('cuota 1 de 24');
    // Borrowed money is not income; the installment is spending.
    expect(monthBreakdown(s, 0).income.toFixed(2)).toBe(D(s.salary).toFixed(2));
  });

  it('paying the loan off early costs only the remaining principal and removes the high-rate debt', () => {
    let s = acceptLoan(paid());
    s = advanceDays(s, 30);
    const left = activeDebts(s)[0]!.balance;
    expect(left.lt('600000')).toBe(true);
    s = payOffPlan(s, s.plans![0]!.id);
    expect(s.movements.at(-1)!.amount).toBe(left.neg().toFixed(2));
    expect(walletMetrics(s).high_rate_debt).toBe(0);
    expect(advanceDays(s, 30).movements.filter((m) => m.counterparty.includes('cuota'))).toHaveLength(1);
  });

  it('installments without interest are a debt but not a high-rate one; cash pays $ 102.000', () => {
    const s = buyInInstallments(paid());
    expect(activeDebts(s)[0]).toMatchObject({ kind: 'purchase', highRate: false });
    expect(activeDebts(s)[0]!.balance.toFixed(2)).toBe('120000.00');
    expect(walletMetrics(s).high_rate_debt).toBe(0);
    const next = advanceDays(s, 30);
    expect(next.movements.find((m) => m.type === 'installment')).toMatchObject({ amount: '-10000.00', suggestedCategory: 'wants' });
    const cash = buyInCash(paid());
    expect(cash.movements.at(-1)).toMatchObject({ type: 'qr_payment', amount: '-102000.00' });
  });
});

describe('pending debits are resumed (section 4)', () => {
  it('a debit that could not be charged is charged once the balance covers it, and time moves again', () => {
    let s = createPocket(paid(), { id: 'big', name: 'Todo' });
    s = moveToPocket(s, 'big', s.balance);
    s = advanceDays(s, 10);
    expect(s.pendingDebit).toMatchObject({ expenseKey: 'transport', day: 2 });
    s = withdrawFromPocket(s, 'big', '100000');
    s = advanceDays(s, 1);
    expect(s.pendingDebit).toBeUndefined();
    expect(s.day).toBe(3);
    expect(s.movements.some((m) => m.expenseKey === 'transport' && m.day === 2)).toBe(true);
  });

  it('an installment can be pending too, named by its lender', () => {
    // Day 1 has no profile debit (the subscription is off), so the installment is the one that fails.
    let s = { ...acceptLoan(paid()), day: 30, balance: '0.00', salary: '1.00' };
    s = advanceDays(s, 1);
    expect(s.pendingDebit?.planId).toBe(s.plans![0]!.id);
    expect(s.pendingDebit?.counterparty).toContain('Financiera de Ejemplo S.A.');
    expect(dayOfMonth(s.pendingDebit!.day)).toBe(1);
  });
});
