import { describe, expect, it } from 'vitest';
import { dateField, emailField, moneyField, otpField, parseDisplayDate, percentField } from './validation';

const firstError = (result: { success: boolean; error?: { issues: { message: string }[] } }) =>
  result.success ? null : result.error?.issues[0]?.message;

describe('parseDisplayDate', () => {
  it('converts valid dates to ISO', () => {
    expect(parseDisplayDate('16/11/2026')).toBe('2026-11-16');
    expect(parseDisplayDate('29/02/2028')).toBe('2028-02-29');
  });

  it('rejects dates that do not exist', () => {
    expect(parseDisplayDate('31/02/2026')).toBeNull();
    expect(parseDisplayDate('29/02/2026')).toBeNull();
    expect(parseDisplayDate('13/13/2026')).toBeNull();
  });
});

describe('field schemas', () => {
  it('date: required, format and real date', () => {
    expect(firstError(dateField.safeParse(''))).toBe('validation.required');
    expect(firstError(dateField.safeParse('16/11'))).toBe('validation.dateFormat');
    expect(firstError(dateField.safeParse('31/02/2026'))).toBe('validation.dateInvalid');
    expect(dateField.safeParse('16/11/2026').success).toBe(true);
  });

  it('email: required and well formed', () => {
    expect(firstError(emailField.safeParse(''))).toBe('validation.required');
    expect(firstError(emailField.safeParse('mariana@'))).toBe('validation.email');
    expect(emailField.safeParse('mariana.lopez@andina.demo').success).toBe(true);
  });

  it('verification code: six digits', () => {
    expect(firstError(otpField.safeParse('12345'))).toBe('validation.otp');
    expect(otpField.safeParse('246810').success).toBe(true);
  });

  it('money: accepts Argentine and pasted formats, checks the range', () => {
    const field = moneyField({ min: '1', max: '100000000' });
    expect(firstError(field.safeParse(''))).toBe('validation.required');
    expect(firstError(field.safeParse('abc'))).toBe('validation.amount');
    expect(firstError(field.safeParse('0'))).toBe('validation.amountRange');
    expect(field.safeParse('$ 1.500,50').success).toBe(true);
    expect(field.safeParse('1500.50').success).toBe(true);
  });

  it('percent: decimals with comma, negatives and range', () => {
    const field = percentField({ min: '-10', max: '50' });
    expect(field.safeParse('3').success).toBe(true);
    expect(field.safeParse('42,5').success).toBe(true);
    expect(field.safeParse('-1,2').success).toBe(true);
    expect(firstError(field.safeParse('60'))).toBe('validation.percentRange');
    expect(firstError(field.safeParse('tres'))).toBe('validation.percent');
  });
});
