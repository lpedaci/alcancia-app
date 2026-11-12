import Decimal from 'decimal.js';
import { z } from 'zod';
import { parseDecimalInput } from './money';

/**
 * Field schemas (Zod). Messages are i18n keys, translated by `useFieldError`. Validation runs on
 * blur and on submit, never while typing for the first time (CLAUDE.md 2.10).
 */

/** Converts DD/MM/AAAA to ISO (AAAA-MM-DD), or null if the date does not exist. */
export function parseDisplayDate(value: string): string | null {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, dd, mm, yyyy] = match as unknown as [string, string, string, string];
  const date = new Date(Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd)));
  if (date.getUTCFullYear() !== Number(yyyy) || date.getUTCMonth() !== Number(mm) - 1 || date.getUTCDate() !== Number(dd)) {
    return null;
  }
  return `${yyyy}-${mm}-${dd}`;
}

const required = (schema: z.ZodString) => schema.trim().min(1, 'validation.required');

export const requiredText = required(z.string());

export const emailField = required(z.string()).pipe(z.email('validation.email'));

export const dateField = required(z.string())
  .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'validation.dateFormat')
  .refine((value) => parseDisplayDate(value) !== null, 'validation.dateInvalid');

export const otpField = required(z.string()).regex(/^\d{6}$/, 'validation.otp');

/**
 * Amount in pesos, as typed by the person ("150.000", "$ 1.500,50" or "1500.50").
 * Optional bounds come in pesos as decimal strings.
 */
export function moneyField({ min = '0', max }: { min?: string; max?: string } = {}) {
  return required(z.string())
    .refine((value) => parseDecimalInput(value) !== null, 'validation.amount')
    .refine((value) => {
      const n = parseDecimalInput(value);
      if (n === null) return true;
      return new Decimal(n).gte(min) && (max === undefined || new Decimal(n).lte(max));
    }, 'validation.amountRange');
}

/** Percentage as typed ("3", "42,5" or "-1,2" if negatives are allowed), within bounds in percent. */
export function percentField({ min = '0', max = '100' }: { min?: string; max?: string } = {}) {
  return required(z.string())
    .refine((value) => parseDecimalInput(value, { allowNegative: true }) !== null, 'validation.percent')
    .refine((value) => {
      const n = parseDecimalInput(value, { allowNegative: true });
      if (n === null) return true;
      return new Decimal(n).gte(min) && new Decimal(n).lte(max);
    }, 'validation.percentRange');
}

/** Flattens a Zod result into `{ path: messageKey }`, first issue per path. */
export function issuesByPath(result: z.ZodSafeParseResult<unknown>): Record<string, string> {
  if (result.success) return {};
  const out: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join('.');
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}
