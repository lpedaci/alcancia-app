import { D, DAYS_PER_MONTH, DAYS_PER_YEAR, type Decimal, type Num, ONE, roundCents } from './decimal';

/** Daily yield credited by the wallet (docs/wallet-engine.md, section 6): balance × TNA / 365, in cents. */
export function dailyYield(balance: Num, tna: Num): Decimal {
  return roundCents(D(balance).times(tna).div(DAYS_PER_YEAR));
}

/** Price index of simulated day d: (1 + π_m)^(d / 30) (wallet-engine.md, section 5). */
export function priceIndex(day: number, monthlyInflation: Num): Decimal {
  return ONE.plus(monthlyInflation).pow(D(day).div(DAYS_PER_MONTH));
}

/** Purchasing power shown next to the balance: balance ÷ price index. */
export function purchasingPowerOnDay(balance: Num, day: number, monthlyInflation: Num): Decimal {
  return D(balance).div(priceIndex(day, monthlyInflation));
}

/** Accrues daily yield for n days, crediting each day rounded to cents (F-26). */
export function accrueDaily({ balance, tna, days }: { balance: Num; tna: Num; days: number }) {
  let current = D(balance);
  let earned = D(0);
  for (let day = 0; day < days; day += 1) {
    const credit = dailyYield(current, tna);
    current = current.plus(credit);
    earned = earned.plus(credit);
  }
  return { balance: current, earned };
}

/** Emergency months (wallet-engine.md, section 7): fund ÷ essential monthly expenses, one decimal, rounded down. */
export function emergencyMonths(fund: Num, essentialMonthly: Num): Decimal {
  if (D(essentialMonthly).lte(0)) return D(0);
  return D(fund).div(essentialMonthly).toDecimalPlaces(1, 1 /* ROUND_DOWN */);
}

/** High-rate debt (D-113, provisional): effective annual rate above the scenario's annual inflation. */
export function isHighRateDebt(effectiveAnnualRate: Num, annualInflation: Num): boolean {
  return D(effectiveAnnualRate).gt(annualInflation);
}
