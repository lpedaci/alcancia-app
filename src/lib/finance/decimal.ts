import Decimal from 'decimal.js';

/**
 * Shared Decimal setup for every formula (docs/formulas.md, section 0): 40 significant digits,
 * half-up rounding. Money never goes through `number` (CLAUDE.md 3).
 */
Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP });

export { Decimal };
export type Num = Decimal | string | number;

export const D = (value: Num): Decimal => (value instanceof Decimal ? value : new Decimal(value));

export const ZERO = new Decimal(0);
export const ONE = new Decimal(1);

/** Days in a simulated month (docs/formulas.md, section 0). */
export const DAYS_PER_MONTH = 30;
/** Days in a year for nominal rates (TNA). */
export const DAYS_PER_YEAR = 365;

/** Rounds to cents, half up. Used only where a real amount is credited or charged (movements, schedules). */
export const roundCents = (value: Num): Decimal => D(value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

/** Money as stored in data: a plain decimal string with two places ("150000.00"). */
export const toMoneyString = (value: Num): string => roundCents(value).toFixed(2);
