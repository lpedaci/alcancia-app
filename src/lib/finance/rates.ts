import { D, DAYS_PER_MONTH, DAYS_PER_YEAR, type Decimal, type Num, ONE } from './decimal';

/** F-01 · Rate of a d-day term from a nominal annual rate: i_d = TNA × d / 365. */
export function periodRate(tna: Num, days: Num): Decimal {
  return D(tna).times(days).div(DAYS_PER_YEAR);
}

/** F-02 · Effective annual rate when renewing every d days: (1 + TNA × d / 365)^(365 / d) − 1. */
export function effectiveAnnualRate(tna: Num, days: Num): Decimal {
  return ONE.plus(periodRate(tna, days)).pow(D(DAYS_PER_YEAR).div(days)).minus(1);
}

/** F-03 · Real rate of a period: (1 + i) / (1 + π) − 1, with i and π of the same period. */
export function realRate(periodRateValue: Num, periodInflation: Num): Decimal {
  return ONE.plus(periodRateValue).div(ONE.plus(periodInflation)).minus(1);
}

/** Inflation of a d-day period from a monthly rate: (1 + π_m)^(d / 30) − 1. */
export function periodInflation(monthlyInflation: Num, days: Num): Decimal {
  return ONE.plus(monthlyInflation).pow(D(days).div(DAYS_PER_MONTH)).minus(1);
}

/** Accumulated inflation of n months at a constant monthly rate: (1 + π_m)^n − 1. */
export function accumulatedInflation(monthlyInflation: Num, months: Num): Decimal {
  return ONE.plus(monthlyInflation).pow(months).minus(1);
}

/** Annual inflation of a monthly scenario, used for "high rate debt" (D-113). */
export function annualInflation(monthlyInflation: Num): Decimal {
  return accumulatedInflation(monthlyInflation, 12);
}
