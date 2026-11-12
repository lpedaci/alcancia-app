import { D, DAYS_PER_MONTH, DAYS_PER_YEAR, Decimal, type Num, ONE, roundCents, ZERO } from './decimal';
import { periodRate } from './rates';

/* ------------------------------------------------------------------------------------------------
 * Formulas of the tools SIM-1 to SIM-12 (docs/formulas.md, sections 4 to 14). Pure functions: no
 * rounding unless the formula says so; the UI rounds when it shows a value.
 * ---------------------------------------------------------------------------------------------- */

/** SIM-3 · Inflation and purchasing power (F-05 to F-07). `periods` are months (or years with an annual rate). */
export function purchasingPower({ amount, rate, periods }: { amount: Num; rate: Num; periods: Num }) {
  const factor = ONE.plus(rate).pow(periods);
  return {
    factor,
    accumulatedInflation: factor.minus(1),
    purchasingPower: D(amount).div(factor),
    loss: ONE.minus(ONE.div(factor)),
    futurePrice: D(amount).times(factor),
  };
}

/** SIM-5 · Traditional fixed-term deposit (F-08): M × (1 + TNA × d / 365). */
export function fixedTermDeposit({ amount, tna, days }: { amount: Num; tna: Num; days: Num }) {
  const final = D(amount).times(ONE.plus(periodRate(tna, days)));
  return { final, interest: final.minus(amount) };
}

/**
 * SIM-5 · UVA fixed-term deposit, didactic version (F-09): capital adjusted by the scenario
 * inflation (stands in for the UVA, which really follows the CER with a lag) plus the extra rate.
 */
export function uvaDeposit({
  amount,
  monthlyInflation,
  extraTna,
  days,
}: {
  amount: Num;
  monthlyInflation: Num;
  extraTna: Num;
  days: Num;
}) {
  const adjusted = D(amount).times(ONE.plus(monthlyInflation).pow(D(days).div(DAYS_PER_MONTH)));
  const extra = adjusted.times(periodRate(extraTna, days));
  return { adjusted, extra, final: adjusted.plus(extra) };
}

/** SIM-6 · Present value of n equal installments with monthly inflation (F-10 to F-13). */
export function installmentsPresentValue({
  installment,
  count,
  monthlyInflation,
  firstPaymentToday = false,
}: {
  installment: Num;
  count: number;
  monthlyInflation: Num;
  firstPaymentToday?: boolean;
}): Decimal {
  const base = ONE.plus(monthlyInflation);
  let total = ZERO;
  for (let k = 0; k < count; k += 1) {
    const exponent = firstPaymentToday ? k : k + 1;
    total = total.plus(D(installment).div(base.pow(exponent)));
  }
  return total;
}

export interface CardScheduleRow {
  month: number;
  interest: Decimal;
  payment: Decimal;
  balance: Decimal;
}

/**
 * SIM-7 · Paying the card minimum, month by month, with no new purchases and no taxes (F-14, F-15).
 * Interest and payments are rounded to cents because they are real charges.
 */
export function minimumPaymentSchedule({
  balance,
  tna,
  minimumRate,
  floor = '1000',
  maxMonths = 600,
}: {
  balance: Num;
  tna: Num;
  minimumRate: Num;
  floor?: Num;
  maxMonths?: number;
}) {
  const monthlyRate = periodRate(tna, DAYS_PER_MONTH);
  let current = D(balance);
  let totalInterest = ZERO;
  let totalPaid = ZERO;
  const schedule: CardScheduleRow[] = [];
  while (current.gt(0) && schedule.length < maxMonths) {
    const interest = roundCents(current.times(monthlyRate));
    current = current.plus(interest);
    let payment = Decimal.max(roundCents(current.times(minimumRate)), D(floor));
    payment = Decimal.min(payment, current);
    current = current.minus(payment);
    totalInterest = totalInterest.plus(interest);
    totalPaid = totalPaid.plus(payment);
    schedule.push({ month: schedule.length + 1, interest, payment, balance: current });
  }
  return { months: schedule.length, totalInterest, totalPaid, paidOff: current.isZero(), schedule };
}

export interface Debt {
  id: string;
  name: string;
  balance: Num;
  /** Nominal annual rate, as a fraction. */
  tna: Num;
  minimumPayment: Num;
}

export type PayoffMethod = 'snowball' | 'avalanche';

/**
 * SIM-9 · Snowball (smallest balance first) or avalanche (highest rate first), month by month
 * (F-16, F-17). The monthly budget is the sum of the original minimums plus the extra amount, so a
 * paid-off debt frees its minimum for the next one.
 */
export function debtPayoff({ debts, extra, method, maxMonths = 600 }: { debts: Debt[]; extra: Num; method: PayoffMethod; maxMonths?: number }) {
  const state = debts.map((debt) => ({ ...debt, left: D(debt.balance), rate: D(debt.tna), min: D(debt.minimumPayment) }));
  const budget = state.reduce((sum, d) => sum.plus(d.min), D(extra));
  let month = 0;
  let totalInterest = ZERO;
  const paidOff: { id: string; name: string; month: number }[] = [];
  while (state.some((d) => d.left.gt(0)) && month < maxMonths) {
    month += 1;
    for (const d of state) {
      if (d.left.gt(0)) {
        const interest = roundCents(d.left.times(periodRate(d.rate, DAYS_PER_MONTH)));
        d.left = d.left.plus(interest);
        totalInterest = totalInterest.plus(interest);
      }
    }
    let available = budget;
    for (const d of state) {
      if (d.left.gt(0)) {
        const pay = Decimal.min(d.min, d.left);
        d.left = d.left.minus(pay);
        available = available.minus(pay);
      }
    }
    const priority = state
      .filter((d) => d.left.gt(0))
      .sort((a, b) => (method === 'snowball' ? a.left.comparedTo(b.left) : b.rate.comparedTo(a.rate)));
    for (const d of priority) {
      const pay = Decimal.min(available, d.left);
      d.left = d.left.minus(pay);
      available = available.minus(pay);
    }
    for (const d of state) {
      if (d.left.isZero() && !paidOff.some((p) => p.id === d.id)) paidOff.push({ id: d.id, name: d.name, month });
    }
  }
  return { months: month, totalInterest, paidOff, finished: state.every((d) => d.left.isZero()) };
}

/** SIM-10 · Compound interest without contributions, as in the workshop (F-18): C = P × (1 + r)^n. */
export function compoundAnnual({ principal, rate, years }: { principal: Num; rate: Num; years: Num }): Decimal {
  return D(principal).times(ONE.plus(rate).pow(years));
}

/**
 * SIM-10 · Monthly contributions at the end of each month, with r_m = annual / 12, the same
 * convention as the workshop calculator (F-19).
 */
export function compoundGrowth({ initial, monthly, annualRate, years }: { initial: Num; monthly: Num; annualRate: Num; years: number }) {
  const n = years * 12;
  const rm = D(annualRate).div(12);
  const growth = ONE.plus(rm).pow(n);
  const fromInitial = D(initial).times(growth);
  const fromContributions = rm.isZero() ? D(monthly).times(n) : D(monthly).times(growth.minus(1)).div(rm);
  const final = fromInitial.plus(fromContributions);
  const contributed = D(initial).plus(D(monthly).times(n));
  return { final, contributed, interest: final.minus(contributed) };
}

/** SIM-11 · Theoretical CEDEAR price in pesos (F-20, B-36): USD price ÷ ratio × implied exchange rate. */
export function cedearTheoreticalPrice({ usdPrice, ratio, impliedFx }: { usdPrice: Num; ratio: Num; impliedFx: Num }): Decimal {
  return D(usdPrice).div(ratio).times(impliedFx);
}

export interface SavingOption {
  id: string;
  tna: Num;
  /** Daily accrual (account, money market) or simple interest at maturity (fixed term). */
  accrual: 'daily' | 'at_maturity';
}

/** SIM-12 · Where to keep the emergency fund (F-21, F-28). Compares features, never recommends. */
export function emergencyFundOptions({
  amount,
  days,
  monthlyInflation,
  options,
}: {
  amount: Num;
  days: number;
  monthlyInflation: Num;
  options: SavingOption[];
}) {
  const inflationFactor = ONE.plus(monthlyInflation).pow(D(days).div(DAYS_PER_MONTH));
  return options.map((option) => {
    const factor =
      option.accrual === 'daily'
        ? ONE.plus(D(option.tna).div(DAYS_PER_YEAR)).pow(days)
        : ONE.plus(periodRate(option.tna, days));
    const final = D(amount).times(factor);
    return {
      id: option.id,
      final,
      periodReturn: factor.minus(1),
      realRate: factor.div(inflationFactor).minus(1),
      purchasingPower: final.div(inflationFactor),
    };
  });
}

/** SIM-8 · Savings goal with inflation (F-22): future price and monthly saving at the end of each month. */
export function savingsGoal({ currentPrice, months, monthlyInflation, monthlyReturn }: { currentPrice: Num; months: number; monthlyInflation: Num; monthlyReturn: Num }) {
  const futurePrice = D(currentPrice).times(ONE.plus(monthlyInflation).pow(months));
  const r = D(monthlyReturn);
  const monthlySaving = r.isZero() ? futurePrice.div(months) : futurePrice.times(r).div(ONE.plus(r).pow(months).minus(1));
  return { futurePrice, monthlySaving };
}

/** SIM-2 · Emergency fund target (F-23). Months are rounded up: a partial month still needs saving. */
export function emergencyFundTarget({ essentialMonthly, months, current, monthlySaving }: { essentialMonthly: Num; months: Num; current: Num; monthlySaving: Num }) {
  const target = D(essentialMonthly).times(months);
  const missing = Decimal.max(target.minus(current), 0);
  const monthsToGoal = D(monthlySaving).gt(0) ? missing.div(monthlySaving).ceil() : null;
  return { target, missing, monthsToGoal };
}

export type BudgetRule = '50/30/20' | '70/20/10';

/** SIM-1 · Reference split of an income (A-32, A-33; F-24): a starting point, never a rule. */
export function budgetSplit({ income, rule }: { income: Num; rule: BudgetRule }) {
  const shares = rule === '50/30/20' ? ['0.5', '0.3', '0.2'] : ['0.7', '0.2', '0.1'];
  const [needs, wants, savings] = shares.map((share) => D(income).times(share)) as [Decimal, Decimal, Decimal];
  return { needs, wants, savings };
}

/** SIM-1 · Prorated aguinaldo, approximation: net monthly ÷ 12 (Q-12, pending review). */
export function proratedAguinaldo(netMonthly: Num): Decimal {
  return D(netMonthly).div(12);
}

/** Mission 1 evidence (F-25): is the separated amount within $ 1 of 20 % of the net salary? */
export function withinTolerance(answer: Num, expected: Num, tolerance: Num = '1'): boolean {
  return D(answer).minus(expected).abs().lte(tolerance);
}
