import { describe, expect, it } from 'vitest';
import { annualCostRate, financedStatement, frenchInstallment, remainingPrincipal } from './credit';

describe('credit formulas (formulas.md section 17)', () => {
  it('F-29: $ 600.000 in 24 installments at 55 % TNA is $ 41.737,16 a month', () => {
    expect(frenchInstallment({ principal: '600000', tna: '0.55', months: 24 }).toFixed(2)).toBe('41737.16');
    expect(frenchInstallment({ principal: '120000', tna: '0', months: 12 }).toFixed(2)).toBe('10000.00');
  });

  it('the remaining principal of a new loan is the principal, and zero at the end', () => {
    expect(remainingPrincipal({ installment: '41737.16', tna: '0.55', remaining: 24 }).toFixed(0)).toBe('600000');
    expect(remainingPrincipal({ installment: '41737.16', tna: '0.55', remaining: 0 }).toFixed(2)).toBe('0.00');
  });

  it('F-30: receiving $ 570.000 (5 % commission) and paying 24 × $ 41.737,16 is a CFT of about 81,8 %', () => {
    const cft = annualCostRate({ received: '570000', installment: '41737.16', months: 24 });
    expect(cft.toDecimalPlaces(4).toFixed(4)).toBe('0.8178');
    // Without commission the cost is the TEA of the loan, (1 + 0,55 / 12)^12 − 1 ≈ 71,2 %.
    expect(annualCostRate({ received: '600000', installment: '41737.16', months: 24 }).toDecimalPlaces(3).toFixed(3)).toBe('0.712');
  });

  it('F-31: $ 216.000 not paid at 60 % TNA becomes $ 226.652,05 in the next statement', () => {
    expect(financedStatement({ carried: '216000', tna: '0.6' }).toFixed(2)).toBe('226652.05');
  });
});
