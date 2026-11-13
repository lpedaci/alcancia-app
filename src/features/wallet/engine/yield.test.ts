import { describe, expect, it } from 'vitest';
import { D } from '@/lib/finance';
import { activeDeposits, advanceDays, createWallet, depositQuote, makeDeposit, monthBreakdown, moneyMarketFactor, setYieldMode, tnaOf, yieldOfMonth } from './engine';
import series from '@/data/money-market-series.json';

/** wallet-engine.md section 6, formulas.md F-08, F-09 and F-21. */
const paid = () => advanceDays(createWallet('p'), 1);

describe('practice money market fund (section 6)', () => {
  it('its daily factor stays between 0,95 and 1,05 and averages 1 over the series', () => {
    const factors = series.dailyFactors.map((f) => D(f));
    expect(factors.every((f) => f.gte('0.95') && f.lte('1.05'))).toBe(true);
    expect(factors.reduce((a, b) => a.plus(b), D(0)).div(factors.length).toFixed(4)).toBe('1.0000');
    expect(tnaOf({ scenarioId: 'medium' }, 'money_market', 1)).toBe(D('0.31').times(moneyMarketFactor(1)).toString());
  });

  it('credits a different yield each day, unlike the remunerated account', () => {
    const fund = advanceDays(setYieldMode(paid(), 'money_market'), 3).movements.filter((m) => m.type === 'yield').map((m) => m.amount);
    const account = advanceDays(setYieldMode(paid(), 'remunerated'), 3).movements.filter((m) => m.type === 'yield');
    expect(new Set(fund).size).toBeGreaterThan(1);
    expect(account).toHaveLength(3);
  });
});

describe('practice fixed-term deposits (section 6)', () => {
  it('F-08: $ 1.000.000 for 30 days at the 34 % example TNA pays $ 1.027.945,21', () => {
    expect(depositQuote({ scenarioId: 'medium' }, 'traditional', '1000000', 30).final.toFixed(2)).toBe('1027945.21');
  });

  it('F-09: a UVA deposit of $ 1.000.000 for 90 days with 3 % inflation and 1 % extra pays $ 1.095.421,40', () => {
    expect(depositQuote({ scenarioId: 'medium' }, 'uva', '1000000', 90).final.toFixed(2)).toBe('1095421.40');
  });

  it('leaves the balance when made, counts as money set aside and comes back with its interest at maturity', () => {
    let s = makeDeposit(paid(), 'traditional', '100000', 30);
    expect(s.movements.at(-1)).toMatchObject({ type: 'term_deposit', amount: '-100000.00', suggestedCategory: 'savings' });
    expect(monthBreakdown(s, 0).saved.toFixed(2)).toBe('100000.00');
    expect(activeDeposits(s)[0]).toMatchObject({ maturityDay: 31, final: '102794.52' });
    s = advanceDays(s, 30);
    expect(activeDeposits(s)).toEqual([]);
    const back = s.movements.filter((m) => m.day === 31 && (m.type === 'term_deposit' || m.type === 'yield'));
    expect(back.map((m) => m.amount)).toEqual(['100000.00', '2794.52']);
    expect(yieldOfMonth(s, 1).toFixed(2)).toBe('2794.52');
  });

  it('only offers the practice terms and never goes over the balance', () => {
    expect(() => makeDeposit(paid(), 'uva', '100000', 30)).toThrow('invalid_term');
    expect(() => makeDeposit(paid(), 'traditional', '99999999', 30)).toThrow('insufficient_balance');
  });
});
