import { describe, expect, it } from 'vitest';
import i18n from '@/app/i18n';
import es from '@/locales/es.json';
import { SIM_DEFS, simById, type SimValues, TOOL_IDS } from './defs';

const t = i18n.getFixedT('es');
/** Runs a tool with its defaults plus some values (percents already as fractions, like the UI parses them). */
function run(id: string, values: SimValues = {}) {
  const def = simById(id)!;
  const defaults = Object.fromEntries(def.fields.map((f) => [f.id, f.kind === 'percent' ? String(Number(f.default) / 100) : f.default]));
  return def.compute({ ...defaults, ...values }, t);
}
const plain = (text: string) => text.replace(/ /g, ' ');

describe('tools SIM-1 to SIM-12 (F4, D-176)', () => {
  it('there are 12 tools and every declarative one has its texts', () => {
    expect(TOOL_IDS).toHaveLength(12);
    const sims = es.sims as Record<string, Record<string, unknown>>;
    for (const def of SIM_DEFS) {
      expect(sims[def.id]?.title, def.id).toBeTruthy();
      for (const f of def.fields) expect((sims[def.id]!.fields as Record<string, { label: string }>)[f.id]?.label, `${def.id}.${f.id}`).toBeTruthy();
      const out = run(def.id);
      expect(out.sentence, def.id).not.toMatch(/sims\.|\{\{/);
      expect(out.table.rows.length, def.id).toBeGreaterThan(0);
    }
  });

  it('SIM-2 · F-23: $ 600.000 × 3 = $ 1.800.000, and $ 1.400.000 missing at $ 150.000 a month is 10 months', () => {
    const out = run('SIM-2', { essentials: '600000', months: '3', current: '400000', monthly: '150000' });
    expect(plain(out.main)).toBe('$ 1.800.000,00');
    expect(plain(out.sentence)).toContain('10 meses');
  });

  it('SIM-6 · F-10: 12 installments of $ 10.000 at 3 % are worth $ 99.540,04 today; cash with 15 % off is $ 102.000', () => {
    const out = run('SIM-6');
    expect(out.table.rows.map((r) => plain(r[1]!))).toEqual(['$ 102.000,00', '$ 10.000,00', '$ 99.540,04', '$ 120.000,00']);
    expect(out.main).toBe(es.sims['SIM-6'].installments);
  });

  it('SIM-7 · F-14: $ 100.000 at 60 % TNA paying a 10 % minimum takes 55 months and $ 83.880,36 of interest', () => {
    const out = run('SIM-7', { balance: '100000' });
    expect(plain(out.main)).toBe('$ 83.880,36');
    expect(plain(out.sentence)).toContain('55 meses');
  });

  it('SIM-8 · F-22: $ 1.500.000, 12 months, 3 % inflation and 2,5 % return need $ 155.023,97 a month', () => {
    expect(plain(run('SIM-8', { return: '0.025' }).main)).toBe('$ 155.023,97');
  });

  it('SIM-10 · F-19 (A-55): USD 200 a month at 12 % for 33 years is about USD 1.008.712', () => {
    expect(plain(run('SIM-10').main)).toBe('USD 1.008.712');
  });

  it('SIM-11 · F-20: USD 600 ÷ 20 × $ 1.500 = $ 45.000', () => {
    expect(plain(run('SIM-11').main)).toBe('$ 45.000,00');
  });

  it('SIM-4 · F-03: 36 % TNA for 30 days against 3 % inflation loses purchasing power', () => {
    const out = run('SIM-4', { tna: '0.36' });
    expect(out.pills[0]?.tone).toBe('warning');
    expect(plain(out.main)).toBe('−0,04 %');
  });

  it('SIM-9 · the avalanche never pays more interest than the snowball', () => {
    const out = run('SIM-9');
    const [snow, aval] = out.chart!.data.map((d) => Number(d.interest));
    expect(aval!).toBeLessThanOrEqual(snow!);
  });
});
