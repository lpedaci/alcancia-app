import { describe, expect, it } from 'vitest';
import { advanceDays, createWallet, monthBreakdown } from '@/features/wallet/engine/engine';
import { D } from '@/lib/finance';
import { buy, buyPreview, fundBrokerage, openBrokerage, portfolioValue, positions, quote, sell, withdrawBrokerage } from './engine';

/** SIM-14 (spec 5.4, D-185), cases checked by hand in docs/formulas.md section 18. */
const start = () => openBrokerage({ ...createWallet('p'), balance: '1000000.00' }, 'moderate');

describe('practice brokerage account (SIM-14)', () => {
  it('F-20 on day 0: USD 600 ÷ 20 × $ 1.500 = $ 45.000 for the example CEDEAR', () => {
    expect(quote(createWallet('p'), 'cedear-sp500', 0)).toMatchObject({ price: D('45000') });
  });

  it('after 5 months the example series is at 0,70 and the implied FX grew with inflation: $ 36.517,13', () => {
    // USD 600 × 0,70 = USD 420; FX 1.500 × 1,03^5 = 1.738,91; 420 ÷ 20 × 1.738,91 = 36.517,13.
    const q = quote(start(), 'cedear-sp500', 150);
    expect(q.usdPrice!.toFixed(2)).toBe('420.00');
    expect(q.impliedFx!.toFixed(2)).toBe('1738.91');
    expect(q.price.toFixed(2)).toBe('36517.13');
  });

  it('the practice fund grows every day with its example TNA, and the bond accrues and moves a little', () => {
    expect(quote(start(), 'mm-fund', 30).price.toFixed(2)).toBe('1025.80');
    expect(quote(start(), 'bond-example', 30).price.toFixed(2)).toBe('1038.22');
  });

  it('funding moves money from the wallet, counts as money set aside and never goes over the balance', () => {
    const s = fundBrokerage(start(), '500000');
    expect(s.balance).toBe('500000.00');
    expect(s.brokerage!.cash).toBe('500000.00');
    expect(s.movements.at(-1)).toMatchObject({ type: 'brokerage', amount: '-500000.00' });
    expect(() => fundBrokerage(s, '600000')).toThrow('insufficient_balance');
    expect(withdrawBrokerage(s, '100000').balance).toBe('600000.00');
  });

  it('buying 4 units at $ 45.000 costs $ 181.044: $ 900 of commission and $ 144 of market rights (examples)', () => {
    const p = buyPreview(fundBrokerage(start(), '500000'), 'cedear-sp500', 4);
    expect([p.gross, p.commission, p.marketFee, p.totalCost].map((d) => d.toFixed(2))).toEqual(['180000.00', '900.00', '144.00', '181044.00']);
    const s = buy(fundBrokerage(start(), '500000'), 'cedear-sp500', 4);
    expect(s.brokerage!.cash).toBe('318956.00');
    expect(positions(s)[0]).toMatchObject({ quantity: 4, settled: 4, pending: 0 });
  });

  it('with 24 hours the units are credited the next day and cannot be sold before (B-34)', () => {
    let s = buy(fundBrokerage(start(), '500000'), 'cedear-sp500', 2, '24h');
    expect(positions(s)[0]).toMatchObject({ settled: 0, pending: 2 });
    expect(() => sell(s, 'cedear-sp500', 1)).toThrow('not_enough_units');
    s = { ...s, day: 1 };
    expect(positions(s)[0]).toMatchObject({ settled: 2, pending: 0 });
  });

  it('a drop is a loss on paper until you sell; selling turns it into a real one', () => {
    let s = buy(fundBrokerage(start(), '500000'), 'cedear-sp500', 4);
    s = { ...s, day: 150 };
    const v = portfolioValue(s);
    expect(v.invested.toFixed(2)).toBe('146068.52');
    expect(v.result.lt(0)).toBe(true);
    const sold = sell(s, 'cedear-sp500', 4);
    expect(positions(sold)).toEqual([]);
    // 146.068,52 minus 0,58 % of costs: $ 730,34 + $ 116,85.
    expect(sold.brokerage!.cash).toBe(D('318956').plus('146068.52').minus('730.34').minus('116.85').toFixed(2));
  });

  it('the account lives in the wallet: time moves, the budget counts the funding as money set aside', () => {
    const s = fundBrokerage(openBrokerage(advanceDays(createWallet('p'), 1), 'moderate'), '200000');
    expect(monthBreakdown(s, 0).saved.toFixed(2)).toBe('200000.00');
  });
});
