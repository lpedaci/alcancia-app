import Decimal from 'decimal.js';

/**
 * How Alcancía shows money (CLAUDE.md 2.9 and the "Cómo mostramos el dinero" section of the design
 * system): `$ 1.234.567,89`, foreign currency always with its code (`USD 1.200`), percentages with a
 * space before the sign (`3 %`), losses and gains with a real minus or plus sign. All math uses
 * Decimal; `number` never touches money (CLAUDE.md 3).
 */

Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP });

export type Currency = 'ARS' | 'USD';
export type DecimalLike = Decimal | string | number;

/** U+2212, the typographic minus sign: easier to read than a hyphen next to a currency symbol. */
export const MINUS = '−';

const toDecimal = (value: DecimalLike) => (value instanceof Decimal ? value : new Decimal(value));

/** Groups the integer part with dots and uses a comma for decimals: 1234567.8 → "1.234.567,80". */
export function formatNumber(value: DecimalLike, decimals = 2): string {
  const fixed = toDecimal(value).abs().toFixed(decimals, Decimal.ROUND_HALF_UP);
  const [int, frac] = fixed.split('.') as [string, string | undefined];
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return frac ? `${grouped},${frac}` : grouped;
}

function signPrefix(value: Decimal, sign: 'auto' | 'always'): string {
  const rounded = value.toDecimalPlaces(2);
  if (rounded.isNegative() && !rounded.isZero()) return MINUS;
  if (sign === 'always' && rounded.gt(0)) return '+';
  return '';
}

export interface MoneyFormatOptions {
  currency?: Currency;
  /** Defaults to 2 for pesos. Whole amounts can use 0 ("USD 1.200"). */
  decimals?: number;
  /** "always" shows + on gains (movements, variations). */
  sign?: 'auto' | 'always';
}

/** `$ 1.234.567,89`, `−$ 4.990,00`, `+$ 24.953,66`, `USD 1.200`. */
export function formatMoney(value: DecimalLike, { currency = 'ARS', decimals = 2, sign = 'auto' }: MoneyFormatOptions = {}): string {
  const d = toDecimal(value);
  const symbol = currency === 'ARS' ? '$' : 'USD';
  return `${signPrefix(d, sign)}${symbol} ${formatNumber(d, decimals)}`;
}

/**
 * Compact amount for tight spaces (2.7): "$ 12,3 M". The full value always goes in aria-label or
 * a tooltip (see MoneyText). Below one million, the full amount is returned unchanged.
 */
export function formatCompactMoney(value: DecimalLike, { currency = 'ARS' }: { currency?: Currency } = {}): string {
  const d = toDecimal(value);
  const abs = d.abs();
  const symbol = currency === 'ARS' ? '$' : 'USD';
  const prefix = signPrefix(d, 'auto');
  if (abs.gte(1e9)) return `${prefix}${symbol} ${trimZeros(formatNumber(abs.div(1e9), 1))} mil M`;
  if (abs.gte(1e6)) return `${prefix}${symbol} ${trimZeros(formatNumber(abs.div(1e6), 1))} M`;
  return formatMoney(d, { currency, decimals: 0 });
}

/** "3,00" → "3", "42,50" → "42,5", "100" stays "100". */
const trimZeros = (text: string) => (text.includes(',') ? text.replace(/0+$/, '').replace(/,$/, '') : text);

export interface PercentFormatOptions {
  /** Maximum decimals; trailing zeros are dropped ("3 %", "42,5 %"). */
  decimals?: number;
  sign?: 'auto' | 'always';
}

/** Rates are fractions (0.03) and show as percentages ("3 %"). Always say the period next to it (2.9). */
export function formatPercent(fraction: DecimalLike, { decimals = 2, sign = 'auto' }: PercentFormatOptions = {}): string {
  const pct = toDecimal(fraction).times(100);
  return `${signPrefix(pct, sign)}${trimZeros(formatNumber(pct, decimals))} %`;
}

/**
 * Normalizes what a person types or pastes into a plain decimal string ("1500.50"), or null if it
 * is not a number. Accepts "$ 1.500,50", "1.500", "1500.50", "1500,5", "USD 1,200.00" and spaces.
 * Rules: with both separators, the last one is the decimal separator; with only commas, the comma
 * is decimal; with only dots, a single dot followed by 1 or 2 digits is decimal, otherwise dots
 * group thousands ("1.500" is fifteen hundred).
 */
export function parseDecimalInput(raw: string, { allowNegative = false }: { allowNegative?: boolean } = {}): string | null {
  let text = raw.replace(/[\s$]|USD|ARS/gi, '').replace(MINUS, '-');
  const negative = text.startsWith('-');
  if (negative) {
    if (!allowNegative) return null;
    text = text.slice(1);
  }
  if (!/^[\d.,]+$/.test(text) || !/\d/.test(text)) return null;

  const lastDot = text.lastIndexOf('.');
  const lastComma = text.lastIndexOf(',');
  let normalized: string;
  if (lastDot >= 0 && lastComma >= 0) {
    const decimalSep = lastDot > lastComma ? '.' : ',';
    const thousandsSep = decimalSep === '.' ? ',' : '.';
    const [int, frac, ...rest] = text.split(decimalSep);
    if (rest.length) return null;
    normalized = `${int!.split(thousandsSep).join('')}.${frac}`;
  } else if (lastComma >= 0) {
    const parts = text.split(',');
    if (parts.length > 2) return null;
    normalized = parts.join('.');
  } else if (lastDot >= 0) {
    const parts = text.split('.');
    const decimalDot = parts.length === 2 && parts[1]!.length > 0 && parts[1]!.length <= 2;
    normalized = decimalDot ? text : parts.join('');
  } else {
    normalized = text;
  }
  if (!/^\d*(\.\d*)?$/.test(normalized) || normalized === '.') return null;
  const d = new Decimal(normalized.endsWith('.') ? normalized.slice(0, -1) : normalized);
  return (negative ? d.negated() : d).toString();
}
