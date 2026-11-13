import { D, type Decimal, type Num, ONE, roundCents, ZERO } from './decimal';
import { periodRate } from './rates';

/**
 * Credit of the practice wallet (level 5, docs/formulas.md section 17). Loans use the French system
 * with a monthly rate of TNA / 12, the usual convention of personal loans; the card finances its
 * unpaid balance at TNA × 30 / 365 per statement, like SIM-7 (F-14).
 */

/** F-29 · Installment of the French system: c = P × i / (1 − (1 + i)^−n), with i = TNA / 12. */
export function frenchInstallment({ principal, tna, months }: { principal: Num; tna: Num; months: number }): Decimal {
  const i = D(tna).div(12);
  if (i.isZero()) return roundCents(D(principal).div(months));
  return roundCents(D(principal).times(i).div(ONE.minus(ONE.plus(i).pow(-months))));
}

/** Principal still owed after paying some installments: present value of the remaining ones at i. */
export function remainingPrincipal({ installment, tna, remaining }: { installment: Num; tna: Num; remaining: number }): Decimal {
  if (remaining <= 0) return ZERO;
  const i = D(tna).div(12);
  if (i.isZero()) return roundCents(D(installment).times(remaining));
  return roundCents(D(installment).times(ONE.minus(ONE.plus(i).pow(-remaining))).div(i));
}

/**
 * F-30 · Total financial cost (CFT) as an effective annual rate (B-04): the monthly rate r that makes
 * the money actually received equal to the present value of the installments, then (1 + r)^12 − 1.
 * Solved by bisection; commissions are included because they reduce what you receive.
 */
export function annualCostRate({ received, installment, months }: { received: Num; installment: Num; months: number }): Decimal {
  const target = D(received);
  const pv = (r: Decimal) => (r.isZero() ? D(installment).times(months) : D(installment).times(ONE.minus(ONE.plus(r).pow(-months))).div(r));
  let low = ZERO;
  let high = ONE;
  for (let k = 0; k < 100; k += 1) {
    const mid = low.plus(high).div(2);
    if (pv(mid).gt(target)) low = mid;
    else high = mid;
  }
  return ONE.plus(low.plus(high).div(2)).pow(12).minus(1);
}

/** F-31 · Next card statement when part of it is not paid: carried × (1 + TNA × 30 / 365). */
export function financedStatement({ carried, tna }: { carried: Num; tna: Num }): Decimal {
  return roundCents(D(carried).times(ONE.plus(periodRate(tna, 30))));
}
