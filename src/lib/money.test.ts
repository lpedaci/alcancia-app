import { describe, expect, it } from 'vitest';
import { formatCompactMoney, formatMoney, formatNumber, formatPercent, MINUS, parseDecimalInput } from './money';

describe('formatMoney (CLAUDE.md 2.9)', () => {
  it('uses the sign, a space, dots for thousands and a comma for decimals', () => {
    expect(formatMoney('1234567.89')).toBe('$ 1.234.567,89');
    expect(formatMoney('1284958.86')).toBe('$ 1.284.958,86');
    expect(formatMoney('0')).toBe('$ 0,00');
  });

  it('rounds half up to cents, never with floating point errors', () => {
    expect(formatMoney('256991.772')).toBe('$ 256.991,77');
    expect(formatMoney('0.005')).toBe('$ 0,01');
    expect(formatMoney('0.1').replace(/\s/g, '')).toBe('$0,10');
  });

  it('shows foreign currency with its code', () => {
    expect(formatMoney('1200', { currency: 'USD', decimals: 0 })).toBe('USD 1.200');
    expect(formatMoney('1008712.49', { currency: 'USD' })).toBe('USD 1.008.712,49');
  });

  it('uses a real minus sign and, on request, a plus sign', () => {
    expect(formatMoney('-4990')).toBe(`${MINUS}$ 4.990,00`);
    expect(formatMoney('24953.66', { sign: 'always' })).toBe('+$ 24.953,66');
    expect(formatMoney('0', { sign: 'always' })).toBe('$ 0,00');
  });
});

describe('formatCompactMoney (CLAUDE.md 2.7)', () => {
  it('abbreviates millions and keeps smaller amounts whole', () => {
    expect(formatCompactMoney('12345678.90')).toBe('$ 12,3 M');
    expect(formatCompactMoney('50000000')).toBe('$ 50 M');
    expect(formatCompactMoney('2500000000')).toBe('$ 2,5 mil M');
    expect(formatCompactMoney('950000')).toBe('$ 950.000');
  });
});

describe('formatPercent', () => {
  it('drops trailing zeros and keeps a space before %', () => {
    expect(formatPercent('0.03')).toBe('3 %');
    expect(formatPercent('0.425')).toBe('42,5 %');
    expect(formatPercent('0.4258623040')).toBe('42,59 %');
    expect(formatPercent('-0.000398989', { decimals: 4 })).toBe(`${MINUS}0,0399 %`);
    expect(formatPercent('0.0154', { sign: 'always', decimals: 2 })).toBe('+1,54 %');
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
