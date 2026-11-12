import { describe, expect, it } from 'vitest';
import { formatCompactMoney, formatMoney, formatNumber, formatPercent, MINUS, NBSP, parseDecimalInput } from './money';

/** Tests are written with readable spaces; the formatter uses non-breaking ones (D-68). */
const nb = (text: string) => text.replace(/ /g, NBSP);

describe('formatMoney (CLAUDE.md 2.9)', () => {
  it('uses the sign, a space, dots for thousands and a comma for decimals', () => {
    expect(formatMoney('1234567.89')).toBe(nb('$ 1.234.567,89'));
    expect(formatMoney('1284958.86')).toBe(nb('$ 1.284.958,86'));
    expect(formatMoney('0')).toBe(nb('$ 0,00'));
  });

  it('rounds half up to cents, never with floating point errors', () => {
    expect(formatMoney('256991.772')).toBe(nb('$ 256.991,77'));
    expect(formatMoney('0.005')).toBe(nb('$ 0,01'));
    expect(formatMoney('0.1').replace(/\s/g, '')).toBe(nb('$0,10'));
  });

  it('shows foreign currency with its code', () => {
    expect(formatMoney('1200', { currency: 'USD', decimals: 0 })).toBe(nb('USD 1.200'));
    expect(formatMoney('1008712.49', { currency: 'USD' })).toBe(nb('USD 1.008.712,49'));
  });

  it('uses a real minus sign and, on request, a plus sign', () => {
    expect(formatMoney('-4990')).toBe(nb(`${MINUS}$ 4.990,00`));
    expect(formatMoney('24953.66', { sign: 'always' })).toBe(nb('+$ 24.953,66'));
    expect(formatMoney('0', { sign: 'always' })).toBe(nb('$ 0,00'));
  });
});

describe('non-breaking spaces (D-68)', () => {
  it('never leaves the currency, the minus or the % sign alone at the end of a line', () => {
    for (const text of [formatMoney('-4990'), formatMoney('1200', { currency: 'USD' }), formatCompactMoney('12345678'), formatPercent('0.03')]) {
      expect(text).not.toMatch(/ /);
      expect(text).toContain(NBSP);
    }
  });
});

describe('formatCompactMoney (CLAUDE.md 2.7)', () => {
  it('abbreviates millions and keeps smaller amounts whole', () => {
    expect(formatCompactMoney('12345678.90')).toBe(nb('$ 12,3 M'));
    expect(formatCompactMoney('50000000')).toBe(nb('$ 50 M'));
    expect(formatCompactMoney('2500000000')).toBe(nb('$ 2,5 mil M'));
    expect(formatCompactMoney('950000')).toBe(nb('$ 950.000'));
  });
});

describe('formatPercent', () => {
  it('drops trailing zeros and keeps a space before %', () => {
    expect(formatPercent('0.03')).toBe(nb('3 %'));
    expect(formatPercent('0.425')).toBe(nb('42,5 %'));
    expect(formatPercent('0.4258623040')).toBe(nb('42,59 %'));
    expect(formatPercent('-0.000398989', { decimals: 4 })).toBe(nb(`${MINUS}0,0399 %`));
    expect(formatPercent('0.0154', { sign: 'always', decimals: 2 })).toBe(nb('+1,54 %'));
  });
});

describe('formatNumber', () => {
  it('groups thousands', () => {
    expect(formatNumber('1000', 0)).toBe('1.000');
    expect(formatNumber('999', 0)).toBe('999');
  });
});

describe('parseDecimalInput (CLAUDE.md 2.10: paste "$ 1.500,50" or "1500.50")', () => {
  it.each([
    ['$ 1.500,50', '1500.5'],
    ['1500.50', '1500.5'],
    ['1.500', '1500'],
    ['1.500.000', '1500000'],
    ['150000', '150000'],
    ['1500,5', '1500.5'],
    ['USD 1,200.00', '1200'],
    ['  12 345 ', '12345'],
    ['1,', '1'],
  ])('%s → %s', (raw, expected) => {
    expect(parseDecimalInput(raw)).toBe(expected);
  });

  it('rejects text that is not a number', () => {
    expect(parseDecimalInput('')).toBeNull();
    expect(parseDecimalInput('abc')).toBeNull();
    expect(parseDecimalInput('1,2,3')).toBeNull();
    expect(parseDecimalInput('$')).toBeNull();
  });

  it('accepts negatives only when allowed (percentages)', () => {
    expect(parseDecimalInput('-1,2')).toBeNull();
    expect(parseDecimalInput('-1,2', { allowNegative: true })).toBe('-1.2');
    expect(parseDecimalInput(`${MINUS}3`, { allowNegative: true })).toBe('-3');
  });
});
