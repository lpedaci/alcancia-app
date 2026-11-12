import { describe, expect, it } from 'vitest';
import {
  accrueDaily,
  budgetSplit,
  cedearTheoreticalPrice,
  compoundAnnual,
  compoundGrowth,
  D,
  type Debt,
  debtPayoff,
  effectiveAnnualRate,
  emergencyFundOptions,
  emergencyFundTarget,
  emergencyMonths,
  fixedTermDeposit,
  installmentsPresentValue,
  isHighRateDebt,
  annualInflation,
  minimumPaymentSchedule,
  periodRate,
  priceIndex,
  proratedAguinaldo,
  purchasingPower,
  realRate,
  savingsGoal,
  toMoneyString,
  uvaDeposit,
  withinTolerance,
} from './index';

/** Hand-checked cases of docs/formulas.md (F-01 to F-28). Amounts compared in cents. */
const cents = (value: Parameters<typeof toMoneyString>[0]) => toMoneyString(value);
const fixed = (value: Parameters<typeof D>[0], places: number) => D(value).toFixed(places);

describe('rates', () => {
  it('F-01 · period rate of TNA 36 % for 30 days', () => {
    expect(fixed(periodRate('0.36', 30), 10)).toBe('0.0295890411');
  });

  it('F-02 · effective annual rate of TNA 36 % renewed every 30 days', () => {
    expect(fixed(effectiveAnnualRate('0.36', 30), 10)).toBe('0.4258623040');
  });

  it('F-03 · real rate against 3 % monthly inflation is negative', () => {
    expect(fixed(realRate(periodRate('0.36', 30), '0.03'), 9)).toBe('-0.000398989');
  });

  it('F-04 · real rate against 1,5 % monthly inflation is positive', () => {
    expect(fixed(realRate(periodRate('0.36', 30), '0.015'), 6)).toBe('0.014373');
  });
});

describe('SIM-3 · inflation and purchasing power', () => {
  it('F-05 · $ 100.000, 3 % monthly, 12 months', () => {
    const r = purchasingPower({ amount: '100000', rate: '0.03', periods: 12 });
    expect(fixed(r.accumulatedInflation.times(100), 2)).toBe('42.58');
    expect(cents(r.purchasingPower)).toBe('70137.99');
    expect(fixed(r.loss.times(100), 2)).toBe('29.86');
    expect(cents(r.futurePrice)).toBe('142576.09');
  });

  it('F-06 · 6 % monthly, 12 months', () => {
    const r = purchasingPower({ amount: '100000', rate: '0.06', periods: 12 });
    expect(fixed(r.accumulatedInflation.times(100), 2)).toBe('101.22');
    expect(cents(r.purchasingPower)).toBe('49696.94');
  });

  it('F-07 · workshop calculator: $ 100 in 5 years at 25 % annual', () => {
    expect(cents(purchasingPower({ amount: '100', rate: '0.25', periods: 5 }).purchasingPower)).toBe('32.77');
  });
});

describe('SIM-5 · fixed-term deposits', () => {
  it('F-08 · traditional, $ 1.000.000, 30 days, TNA 36 %', () => {
    const r = fixedTermDeposit({ amount: '1000000', tna: '0.36', days: 30 });
    expect(cents(r.final)).toBe('1029589.04');
    expect(cents(r.interest)).toBe('29589.04');
    expect(cents(r.final.div('1.03'))).toBe('999601.01');
  });

  it('F-09 · UVA, $ 1.000.000, 90 days, 3 % monthly, extra 1 %', () => {
    const r = uvaDeposit({ amount: '1000000', monthlyInflation: '0.03', extraTna: '0.01', days: 90 });
    expect(cents(r.adjusted)).toBe('1092727.00');
    expect(cents(r.extra)).toBe('2694.40');
    expect(cents(r.final)).toBe('1095421.40');
    expect(cents(fixedTermDeposit({ amount: '1000000', tna: '0.36', days: 90 }).final)).toBe('1088767.12');
  });
});

describe('SIM-6 · installments or cash', () => {
  const base = { installment: '10000', count: 12 };
  it('F-10 · 3 % monthly: installments are cheaper than $ 102.000 cash', () => {
    expect(cents(installmentsPresentValue({ ...base, monthlyInflation: '0.03' }))).toBe('99540.04');
  });
  it('F-11 · 1,5 % monthly', () => {
    expect(cents(installmentsPresentValue({ ...base, monthlyInflation: '0.015' }))).toBe('109075.05');
  });
  it('F-12 · 6 % monthly', () => {
    expect(cents(installmentsPresentValue({ ...base, monthlyInflation: '0.06' }))).toBe('83838.44');
  });
  it('F-13 · 3 % monthly, first installment today', () => {
    expect(cents(installmentsPresentValue({ ...base, monthlyInflation: '0.03', firstPaymentToday: true }))).toBe('102526.24');
  });
});

describe('SIM-7 · card minimum payment', () => {
  it('F-14 · $ 100.000, TNA 60 %, 10 % minimum, $ 1.000 floor', () => {
    const r = minimumPaymentSchedule({ balance: '100000', tna: '0.60', minimumRate: '0.10' });
    expect(cents(r.schedule[0]!.interest)).toBe('4931.51');
    expect(cents(r.schedule[0]!.payment)).toBe('10493.15');
    expect(cents(r.schedule[0]!.balance)).toBe('94438.36');
    expect(r.months).toBe(55);
    expect(cents(r.totalInterest)).toBe('83880.36');
    expect(cents(r.totalPaid)).toBe('183880.36');
    expect(r.paidOff).toBe(true);
  });

  it('F-15 · the same balance with TNA 120 %', () => {
    const r = minimumPaymentSchedule({ balance: '100000', tna: '1.20', minimumRate: '0.10' });
    expect(r.months).toBe(237);
    expect(cents(r.totalInterest)).toBe('813271.16');
  });

  it('stops at the safety limit when the debt never ends', () => {
    const r = minimumPaymentSchedule({ balance: '100000', tna: '6', minimumRate: '0.01', floor: '1', maxMonths: 50 });
    expect(r.months).toBe(50);
    expect(r.paidOff).toBe(false);
  });
});

describe('SIM-9 · snowball and avalanche', () => {
  // A-29 balances and rates; minimums and extra are test-only assumptions (docs/formulas.md, F-16).
  const a29: Debt[] = [
    { id: 'card', name: 'Tarjeta', balance: '40000', tna: '1.50', minimumPayment: '4000' },
    { id: 'lender', name: 'Financiera', balance: '15000', tna: '1.10', minimumPayment: '1500' },
    { id: 'bank', name: 'Crédito bancario', balance: '200000', tna: '0.80', minimumPayment: '10000' },
  ];

  it('F-16 · avalanche pays less interest', () => {
    const r = debtPayoff({ debts: a29, extra: '20000', method: 'avalanche' });
    expect(r.months).toBe(11);
    expect(cents(r.totalInterest)).toBe('109817.08');
    expect(r.paidOff.map((p) => [p.id, p.month])).toEqual([
      ['card', 2],
      ['lender', 3],
      ['bank', 11],
    ]);
  });

  it('F-16 · snowball pays off the first debt a month earlier', () => {
    const r = debtPayoff({ debts: a29, extra: '20000', method: 'snowball' });
    expect(r.months).toBe(11);
    expect(cents(r.totalInterest)).toBe('111507.88');
    expect(r.paidOff.map((p) => [p.id, p.month])).toEqual([
      ['lender', 1],
      ['card', 3],
      ['bank', 11],
    ]);
  });

  it('F-17 · A-25 with rate 0: order and freed payments roll over', () => {
    const a25: Debt[] = [
      { id: 'clothes', name: 'Tarjeta ropa', balance: '5000', tna: '0', minimumPayment: '500' },
      { id: 'personal', name: 'Préstamo personal', balance: '25000', tna: '0', minimumPayment: '2000' },
      { id: 'car', name: 'Crédito auto', balance: '100000', tna: '0', minimumPayment: '10000' },
    ];
    const r = debtPayoff({ debts: a25, extra: '2500', method: 'snowball' });
    expect(r.paidOff.map((p) => [p.id, p.month])).toEqual([
      ['clothes', 2],
      ['personal', 6],
      ['car', 9],
    ]);
    expect(cents(r.totalInterest)).toBe('0.00');
  });
});

describe('SIM-10 · compound interest', () => {
  it('F-18 · USD 1.000 at 10 % for 10 years', () => {
    expect(cents(compoundAnnual({ principal: '1000', rate: '0.10', years: 10 }))).toBe('2593.74');
  });

  it('F-19 · A-55: USD 200 a month at 12 % for 33 years', () => {
    const r = compoundGrowth({ initial: '0', monthly: '200', annualRate: '0.12', years: 33 });
    expect(cents(r.final)).toBe('1008712.49');
    expect(cents(r.contributed)).toBe('79200.00');
    expect(cents(r.interest)).toBe('929512.49');
  });
});

describe('SIM-11 · CEDEAR', () => {
  it('F-20 · two sources of variation that multiply', () => {
    expect(cents(cedearTheoreticalPrice({ usdPrice: '600', ratio: '20', impliedFx: '1500' }))).toBe('45000.00');
    expect(cents(cedearTheoreticalPrice({ usdPrice: '660', ratio: '20', impliedFx: '1500' }))).toBe('49500.00');
    expect(cents(cedearTheoreticalPrice({ usdPrice: '600', ratio: '20', impliedFx: '1650' }))).toBe('49500.00');
    expect(cents(cedearTheoreticalPrice({ usdPrice: '660', ratio: '20', impliedFx: '1650' }))).toBe('54450.00');
  });
});

describe('SIM-12 · where to keep the emergency fund', () => {
  it('F-21 · medium scenario: none beats inflation in 30 days', () => {
    const r = emergencyFundOptions({
      amount: '3000000',
      days: 30,
      monthlyInflation: '0.03',
      options: [
        { id: 'account', tna: '0.30', accrual: 'daily' },
        { id: 'money_market', tna: '0.31', accrual: 'daily' },
        { id: 'fixed_term', tna: '0.34', accrual: 'at_maturity' },
      ],
    });
    expect(r.map((o) => cents(o.final))).toEqual(['3074860.99', '3077387.20', '3083835.62']);
    expect(r.map((o) => cents(o.purchasingPower))).toEqual(['2985301.94', '2987754.57', '2994015.16']);
    expect(r.every((o) => o.realRate.isNegative())).toBe(true);
  });

  it('F-28 · low scenario: the fund and the fixed term beat inflation by a little', () => {
    const r = emergencyFundOptions({
      amount: '3000000',
      days: 30,
      monthlyInflation: '0.015',
      options: [
        { id: 'account', tna: '0.15', accrual: 'daily' },
        { id: 'money_market', tna: '0.20', accrual: 'daily' },
        { id: 'fixed_term', tna: '0.22', accrual: 'at_maturity' },
      ],
    });
    expect(r.map((o) => cents(o.final))).toEqual(['3037207.55', '3049708.90', '3054246.58']);
    expect(r.map((o) => fixed(o.realRate.times(100), 4))).toEqual(['-0.2559', '0.1546', '0.3037']);
    expect(r.map((o) => cents(o.purchasingPower))).toEqual(['2992322.71', '3004639.31', '3009109.93']);
  });
});

describe('SIM-8, SIM-2 and SIM-1', () => {
  it('F-22 · savings goal with inflation', () => {
    const r = savingsGoal({ currentPrice: '1500000', months: 12, monthlyInflation: '0.03', monthlyReturn: '0.025' });
    expect(cents(r.futurePrice)).toBe('2138641.33');
    expect(cents(r.monthlySaving)).toBe('155023.97');
    expect(cents(savingsGoal({ currentPrice: '1500000', months: 12, monthlyInflation: '0.03', monthlyReturn: '0' }).monthlySaving)).toBe(
      '178220.11',
    );
  });

  it('F-23 · emergency fund target, months rounded up', () => {
    const r = emergencyFundTarget({ essentialMonthly: '600000', months: 3, current: '400000', monthlySaving: '150000' });
    expect(cents(r.target)).toBe('1800000.00');
    expect(cents(r.missing)).toBe('1400000.00');
    expect(r.monthsToGoal?.toNumber()).toBe(10);
  });

  it('F-24 · 50/30/20 of the demo net salary and prorated aguinaldo', () => {
    const r = budgetSplit({ income: '1284958.86', rule: '50/30/20' });
    expect([r.needs, r.wants, r.savings].map(cents)).toEqual(['642479.43', '385487.66', '256991.77']);
    expect(cents(proratedAguinaldo('1284958.86'))).toBe('107079.91');
  });

  it('F-25 · mission 1 evidence accepts $ 1 of tolerance', () => {
    const expected = D('1284958.86').times('0.2');
    expect(withinTolerance('256990.78', expected)).toBe(true);
    expect(withinTolerance('256992.77', expected)).toBe(true);
    expect(withinTolerance('256990.77', expected)).toBe(false);
  });
});

describe('wallet engine formulas', () => {
  it('F-26 · daily yield credited in cents for 30 days, and purchasing power', () => {
    const r = accrueDaily({ balance: '1000000', tna: '0.30', days: 30 });
    expect(cents(r.balance)).toBe('1024953.66');
    expect(cents(r.earned)).toBe('24953.66');
    expect(cents(r.balance.div(priceIndex(30, '0.03')))).toBe('995100.64');
    expect(fixed(priceIndex(15, '0.03'), 10)).toBe('1.0148891565');
  });

  it('emergency months: fund over essential expenses, rounded down (wallet-engine.md 7)', () => {
    expect(emergencyMonths('1300000', '650000').toString()).toBe('2');
    expect(emergencyMonths('1949999', '650000').toString()).toBe('2.9');
    expect(emergencyMonths('1950000', '650000').toString()).toBe('3');
  });

  it('high-rate debt: card TEA above the medium scenario annual inflation (D-113)', () => {
    expect(fixed(annualInflation('0.03').times(100), 2)).toBe('42.58');
    expect(fixed(effectiveAnnualRate('0.60', 30).times(100), 1)).toBe('79.6');
    expect(isHighRateDebt(effectiveAnnualRate('0.60', 30), annualInflation('0.03'))).toBe(true);
    expect(isHighRateDebt('0', annualInflation('0.03'))).toBe(false);
  });
});
