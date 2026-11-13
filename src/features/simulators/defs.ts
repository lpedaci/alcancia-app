import type { TFunction } from 'i18next';
import type { IconName } from '@/components/ui/Icon';
import scenarios from '@/data/scenarios.json';
import { EXPENSE_DEFS } from '@/features/wallet/engine/profile';
import type { WalletState } from '@/features/wallet/engine/types';
import {
  accumulatedInflation,
  budgetSplit,
  cedearTheoreticalPrice,
  compoundGrowth,
  D,
  debtPayoff,
  type Decimal,
  effectiveAnnualRate,
  emergencyFundOptions,
  emergencyFundTarget,
  fixedTermDeposit,
  installmentsPresentValue,
  minimumPaymentSchedule,
  periodInflation,
  periodRate,
  proratedAguinaldo,
  realRate,
  savingsGoal,
  uvaDeposit,
} from '@/lib/finance';
import { formatMoney, formatPercent } from '@/lib/money';

/**
 * Declarative tools SIM-1, SIM-2 and SIM-4 to SIM-12 (CLAUDE.md F4, D-176). Each one defines its
 * fields, the official sources of its assumptions, an optional preset from the person's wallet
 * (F4: "sus datos se pueden precargar con los de la billetera") and a pure `compute` built on the
 * tested formulas of `src/lib/finance/`. The shared anatomy of 2.2.1 lives in `GenericSimulator`.
 * Values are always examples, never current rates (1.1.1).
 */
export type FieldKind = 'money' | 'usd' | 'percent' | 'int' | 'choice';

export interface SimField {
  id: string;
  kind: FieldKind;
  default: string;
  min?: number;
  max?: number;
  choices?: string[];
}

export interface SimPill {
  tone: 'warning' | 'success' | 'info' | 'neutral';
  icon: IconName;
  text: string;
}

export interface SimChart {
  kind: 'area' | 'bar';
  title: string;
  conclusion: string;
  xKey: string;
  series: { key: string; label: string }[];
  data: Record<string, number | string>[];
  currency: 'ARS' | 'USD' | 'percent';
}

export interface SimOutput {
  mainLabel: string;
  main: string;
  sentence: string;
  pills: SimPill[];
  chart?: SimChart;
  table: { columns: string[]; rows: string[][] };
  meaning: string;
}

/** Parsed values: money as a decimal string, percent as a fraction, int as an integer string. */
export type SimValues = Record<string, string>;

export interface SimDef {
  id: string;
  levelId: string;
  icon: IconName;
  fields: SimField[];
  sources: string[];
  preset?: (wallet: WalletState) => Partial<Record<string, string>>;
  compute: (v: SimValues, t: TFunction) => SimOutput;
}

const medium = scenarios.find((s) => s.id === 'medium')!;
const pctOf = (fraction: string) => D(fraction).times(100).toString();
const fm = (v: Decimal | string, decimals = 2) => formatMoney(v, { decimals });
const fu = (v: Decimal | string, decimals = 2) => formatMoney(v, { currency: 'USD', decimals });
const fp = (v: Decimal | string, decimals = 1) => formatPercent(v, { decimals });
const num = (v: Decimal) => Number(v.toFixed(2));
const sumNeeds = (w: WalletState, category: 'needs' | 'wants') =>
  EXPENSE_DEFS.filter((d) => d.category === category && (d.key !== 'subscription' || w.subscriptionActive)).reduce((s, d) => s.plus(w.expenses[d.key]), D(0));

export const SIM_DEFS: SimDef[] = [
  // ------------------------------------------------------------------ SIM-1 · Presupuesto mensual
  {
    id: 'SIM-1',
    levelId: 'level-3',
    icon: 'pie_chart',
    fields: [
      { id: 'income', kind: 'money', default: '1284958.86' },
      { id: 'aguinaldo', kind: 'choice', default: 'no', choices: ['no', 'yes'] },
      { id: 'needs', kind: 'money', default: '650000' },
      { id: 'wants', kind: 'money', default: '186500' },
      { id: 'rule', kind: 'choice', default: '50/30/20', choices: ['50/30/20', '70/20/10'] },
    ],
    sources: [],
    preset: (w) => ({ income: w.salary, needs: sumNeeds(w, 'needs').toFixed(2), wants: sumNeeds(w, 'wants').toFixed(2) }),
    compute: (v, t) => {
      const income = D(v.income!).plus(v.aguinaldo === 'yes' ? proratedAguinaldo(v.income!) : 0);
      const left = income.minus(v.needs!).minus(v.wants!);
      const ref = budgetSplit({ income, rule: v.rule as '50/30/20' | '70/20/10' });
      const share = (x: Decimal | string) => (income.gt(0) ? D(x).div(income) : D(0));
      const cat = (k: string) => t(`budget.cat.${v.rule}.${k}`);
      const rows: [string, Decimal, Decimal][] = [
        ['needs', D(v.needs!), ref.needs],
        ['wants', D(v.wants!), ref.wants],
        ['savings', left, ref.savings],
      ];
      return {
        mainLabel: t('sims.SIM-1.main'),
        main: fm(left),
        sentence: left.lt(0)
          ? t('sims.SIM-1.sentenceNegative', { missing: fm(left.neg()) })
          : t('sims.SIM-1.sentence', { needs: fp(share(v.needs!), 0), wants: fp(share(v.wants!), 0), saved: fp(share(left), 0), rule: v.rule }),
        pills: left.lt(0)
          ? [{ tone: 'warning', icon: 'trending_down', text: t('sims.SIM-1.pillNegative') }]
          : [{ tone: share(left).gte(ref.savings.div(income.gt(0) ? income : 1)) ? 'success' : 'info', icon: 'savings', text: t('sims.SIM-1.pillSaved', { saved: fp(share(left), 0) }) }],
        chart: {
          kind: 'bar',
          title: t('sims.SIM-1.chartTitle'),
          conclusion: t('sims.SIM-1.chartConclusion', { rule: v.rule }),
          xKey: 'category',
          series: [
            { key: 'actual', label: t('sims.SIM-1.yours') },
            { key: 'reference', label: t('sims.SIM-1.reference') },
          ],
          data: rows.map(([k, actual, reference]) => ({ category: cat(k), actual: num(actual), reference: num(reference) })),
          currency: 'ARS',
        },
        table: {
          columns: [t('sims.common.category'), t('sims.SIM-1.yours'), '%', t('sims.SIM-1.reference')],
          rows: rows.map(([k, actual, reference]) => [cat(k), fm(actual), fp(share(actual), 0), fm(reference)]),
        },
        meaning: t('sims.SIM-1.meaning'),
      };
    },
  },
  // ------------------------------------------------------------------ SIM-2 · Fondo de emergencia
  {
    id: 'SIM-2',
    levelId: 'level-4',
    icon: 'shield',
    fields: [
      { id: 'essentials', kind: 'money', default: '650000' },
      { id: 'months', kind: 'int', default: '3', min: 3, max: 6 },
      { id: 'current', kind: 'money', default: '0' },
      { id: 'monthly', kind: 'money', default: '128495.89' },
    ],
    sources: [],
    preset: (w) => ({ essentials: sumNeeds(w, 'needs').toFixed(2), current: w.pockets.find((p) => p.isEmergencyFund)?.amount ?? '0' }),
    compute: (v, t) => {
      const r = emergencyFundTarget({ essentialMonthly: v.essentials!, months: v.months!, current: v.current!, monthlySaving: v.monthly! });
      const months = r.monthsToGoal?.toNumber() ?? null;
      const steps = Math.min(months ?? 12, 36);
      const data = Array.from({ length: steps + 1 }, (_, m) => ({
        month: m,
        saved: num(D(v.current!).plus(D(v.monthly!).times(m))),
        goal: num(r.target),
      }));
      return {
        mainLabel: t('sims.SIM-2.main', { months: v.months }),
        main: fm(r.target),
        sentence:
          r.missing.isZero()
            ? t('sims.SIM-2.sentenceDone')
            : months === null
              ? t('sims.SIM-2.sentenceNoSaving', { missing: fm(r.missing) })
              : t('sims.SIM-2.sentence', { missing: fm(r.missing), monthly: fm(v.monthly!), count: months }),
        pills: [
          { tone: r.missing.isZero() ? 'success' : 'info', icon: 'shield', text: t('sims.SIM-2.pillMissing', { missing: fm(r.missing) }) },
          ...(months !== null && months > 0 ? [{ tone: 'neutral' as const, icon: 'calendar_month' as IconName, text: t('sims.SIM-2.pillMonths', { count: months }) }] : []),
        ],
        chart: {
          kind: 'area',
          title: t('sims.SIM-2.chartTitle'),
          conclusion: months === null ? t('sims.SIM-2.sentenceNoSaving', { missing: fm(r.missing) }) : t('sims.SIM-2.chartConclusion', { count: months }),
          xKey: 'month',
          series: [
            { key: 'saved', label: t('sims.SIM-2.saved') },
            { key: 'goal', label: t('sims.SIM-2.goal') },
          ],
          data,
          currency: 'ARS',
        },
        table: {
          columns: [t('sims.common.month'), t('sims.SIM-2.saved'), t('sims.SIM-2.goal')],
          rows: data.filter((_, i) => i % Math.max(1, Math.ceil(steps / 6)) === 0 || i === steps).map((d) => [d.month === 0 ? t('sims.common.today') : String(d.month), fm(String(d.saved)), fm(String(d.goal))]),
        },
        meaning: t('sims.SIM-2.meaning'),
      };
    },
  },
  // ------------------------------------------------------------------ SIM-4 · Tasa real
  {
    id: 'SIM-4',
    levelId: 'level-6',
    icon: 'percent',
    fields: [
      { id: 'tna', kind: 'percent', default: pctOf(medium.exampleRates.fixedTerm) },
      { id: 'days', kind: 'int', default: '30', min: 1, max: 365 },
      { id: 'inflation', kind: 'percent', default: pctOf(medium.monthlyInflation) },
    ],
    sources: ['indec', 'bcra-tasas'],
    compute: (v, t) => {
      const days = Number(v.days);
      const i = periodRate(v.tna!, days);
      const pi = periodInflation(v.inflation!, days);
      const real = realRate(i, pi);
      const tea = effectiveAnnualRate(v.tna!, days);
      const wins = real.gt(0);
      return {
        mainLabel: t('sims.SIM-4.main', { days }),
        main: formatPercent(real, { decimals: 2, sign: 'always' }),
        sentence: t(wins ? 'sims.SIM-4.sentenceWins' : 'sims.SIM-4.sentenceLoses', { rate: fp(i, 2), inflation: fp(pi, 2), days }),
        pills: [{ tone: wins ? 'success' : 'warning', icon: wins ? 'trending_up' : 'trending_down', text: t(wins ? 'sims.SIM-4.pillWins' : 'sims.SIM-4.pillLoses') }],
        chart: {
          kind: 'bar',
          title: t('sims.SIM-4.chartTitle', { days }),
          conclusion: t(wins ? 'sims.SIM-4.pillWins' : 'sims.SIM-4.pillLoses'),
          xKey: 'name',
          series: [{ key: 'value', label: t('sims.SIM-4.percentOfPeriod') }],
          data: [
            { name: t('sims.SIM-4.periodRate'), value: num(i.times(100)) },
            { name: t('sims.SIM-4.periodInflation'), value: num(pi.times(100)) },
          ],
          currency: 'percent',
        },
        table: {
          columns: [t('sims.common.concept'), t('sims.common.value')],
          rows: [
            [t('sims.SIM-4.tnaRow'), fp(v.tna!, 2)],
            [t('sims.SIM-4.periodRate'), fp(i, 2)],
            [t('sims.SIM-4.teaRow'), fp(tea, 2)],
            [t('sims.SIM-4.periodInflation'), fp(pi, 2)],
            [t('sims.SIM-4.realRow'), formatPercent(real, { decimals: 2, sign: 'always' })],
          ],
        },
        meaning: t('sims.SIM-4.meaning'),
      };
    },
  },
  // ------------------------------------------------------------------ SIM-5 · Plazo fijo tradicional o UVA
  {
    id: 'SIM-5',
    levelId: 'level-6',
    icon: 'account_balance',
    fields: [
      { id: 'amount', kind: 'money', default: '1000000' },
      { id: 'days', kind: 'int', default: '180', min: 30, max: 365 },
      { id: 'tna', kind: 'percent', default: pctOf(medium.exampleRates.fixedTerm) },
      { id: 'uvaExtra', kind: 'percent', default: pctOf(medium.exampleRates.uvaExtra) },
      { id: 'inflation', kind: 'percent', default: pctOf(medium.monthlyInflation) },
    ],
    sources: ['bcra-a8407', 'indec'],
    compute: (v, t) => {
      const days = Number(v.days);
      const trad = fixedTermDeposit({ amount: v.amount!, tna: v.tna!, days });
      const uva = uvaDeposit({ amount: v.amount!, monthlyInflation: v.inflation!, extraTna: v.uvaExtra!, days });
      const factor = D(1).plus(periodInflation(v.inflation!, days));
      const tradPower = trad.final.div(factor);
      const uvaPower = uva.final.div(factor);
      const uvaBetter = uva.final.gt(trad.final);
      return {
        mainLabel: t('sims.SIM-5.main', { days }),
        main: uvaBetter ? t('sims.SIM-5.uvaHigher') : t('sims.SIM-5.tradHigher'),
        sentence: t('sims.SIM-5.sentence', { trad: fm(trad.final), uva: fm(uva.final), days }),
        pills: [
          ...(days < 90 ? [{ tone: 'info' as const, icon: 'info' as IconName, text: t('sims.SIM-5.pillMinimum') }] : []),
          { tone: 'neutral', icon: 'price_change', text: t('sims.SIM-5.pillPower', { trad: fm(tradPower), uva: fm(uvaPower) }) },
        ],
        chart: {
          kind: 'bar',
          title: t('sims.SIM-5.chartTitle'),
          conclusion: t('sims.SIM-5.chartConclusion'),
          xKey: 'name',
          series: [
            { key: 'pesos', label: t('sims.SIM-5.inPesos') },
            { key: 'power', label: t('sims.SIM-5.inPower') },
          ],
          data: [
            { name: t('sims.SIM-5.trad'), pesos: num(trad.final), power: num(tradPower) },
            { name: t('sims.SIM-5.uva'), pesos: num(uva.final), power: num(uvaPower) },
          ],
          currency: 'ARS',
        },
        table: {
          columns: [t('sims.common.option'), t('sims.SIM-5.inPesos'), t('sims.SIM-5.inPower')],
          rows: [
            [t('sims.SIM-5.trad'), fm(trad.final), fm(tradPower)],
            [t('sims.SIM-5.uva'), fm(uva.final), fm(uvaPower)],
          ],
        },
        meaning: t('sims.SIM-5.meaning'),
      };
    },
  },
  // ------------------------------------------------------------------ SIM-6 · Cuotas o contado
  {
    id: 'SIM-6',
    levelId: 'level-5',
    icon: 'shopping_bag',
    fields: [
      { id: 'price', kind: 'money', default: '120000' },
      { id: 'count', kind: 'int', default: '12', min: 1, max: 36 },
      { id: 'discount', kind: 'percent', default: '15' },
      { id: 'inflation', kind: 'percent', default: pctOf(medium.monthlyInflation) },
      { id: 'first', kind: 'choice', default: 'next', choices: ['next', 'today'] },
    ],
    sources: ['indec'],
    compute: (v, t) => {
      const count = Number(v.count);
      const installment = D(v.price!).div(count);
      const pv = installmentsPresentValue({ installment, count, monthlyInflation: v.inflation!, firstPaymentToday: v.first === 'today' });
      const cash = D(v.price!).times(D(1).minus(v.discount!));
      const cashBetter = cash.lt(pv);
      return {
        mainLabel: t('sims.SIM-6.main'),
        main: cashBetter ? t('sims.SIM-6.cash') : t('sims.SIM-6.installments'),
        sentence: t(cashBetter ? 'sims.SIM-6.sentenceCash' : 'sims.SIM-6.sentenceInstallments', { cash: fm(cash), pv: fm(pv), count, installment: fm(installment) }),
        pills: [{ tone: 'info', icon: 'info', text: t('sims.SIM-6.pillScenario') }],
        chart: {
          kind: 'bar',
          title: t('sims.SIM-6.chartTitle'),
          conclusion: t(cashBetter ? 'sims.SIM-6.chartCash' : 'sims.SIM-6.chartInstallments'),
          xKey: 'name',
          series: [{ key: 'value', label: t('sims.SIM-6.inToday') }],
          data: [
            { name: t('sims.SIM-6.cashBar'), value: num(cash) },
            { name: t('sims.SIM-6.pvBar'), value: num(pv) },
            { name: t('sims.SIM-6.nominalBar'), value: num(D(v.price!)) },
          ],
          currency: 'ARS',
        },
        table: {
          columns: [t('sims.common.concept'), t('sims.common.value')],
          rows: [
            [t('sims.SIM-6.cashBar'), fm(cash)],
            [t('sims.SIM-6.installmentRow', { count }), fm(installment)],
            [t('sims.SIM-6.pvBar'), fm(pv)],
            [t('sims.SIM-6.nominalBar'), fm(v.price!)],
          ],
        },
        meaning: t('sims.SIM-6.meaning'),
      };
    },
  },
  // ------------------------------------------------------------------ SIM-7 · Tarjeta de crédito
  {
    id: 'SIM-7',
    levelId: 'level-5',
    icon: 'credit_card',
    fields: [
      { id: 'balance', kind: 'money', default: '240000' },
      { id: 'tna', kind: 'percent', default: pctOf(medium.exampleRates.card) },
      { id: 'cft', kind: 'percent', default: '95' },
      { id: 'minimum', kind: 'percent', default: '10' },
    ],
    sources: ['bcra-tasas', 'gob-usuarios-financieros', 'ley-25065'],
    compute: (v, t) => {
      const r = minimumPaymentSchedule({ balance: v.balance!, tna: v.tna!, minimumRate: v.minimum! });
      const step = Math.max(1, Math.ceil(r.schedule.length / 24));
      const data = [{ month: 0, balance: num(D(v.balance!)) }, ...r.schedule.filter((_, i) => i % step === step - 1 || i === r.schedule.length - 1).map((s) => ({ month: s.month, balance: num(s.balance) }))];
      return {
        mainLabel: t('sims.SIM-7.main'),
        main: fm(r.totalInterest),
        sentence: r.paidOff ? t('sims.SIM-7.sentence', { count: r.months, interest: fm(r.totalInterest), total: fm(r.totalPaid), balance: fm(v.balance!) }) : t('sims.SIM-7.sentenceNever'),
        pills: [
          { tone: 'warning', icon: 'schedule', text: t('sims.SIM-7.pillMonths', { count: r.months }) },
          { tone: 'neutral', icon: 'info', text: t('sims.SIM-7.pillCft', { cft: fp(v.cft!, 1), tna: fp(v.tna!, 1) }) },
        ],
        chart: {
          kind: 'area',
          title: t('sims.SIM-7.chartTitle'),
          conclusion: t('sims.SIM-7.chartConclusion', { count: r.months }),
          xKey: 'month',
          series: [{ key: 'balance', label: t('sims.SIM-7.balance') }],
          data,
          currency: 'ARS',
        },
        table: {
          columns: [t('sims.common.concept'), t('sims.SIM-7.payMinimum'), t('sims.SIM-7.payTotal')],
          rows: [
            [t('sims.SIM-7.paid'), fm(r.totalPaid), fm(v.balance!)],
            [t('sims.SIM-7.interest'), fm(r.totalInterest), fm('0')],
            [t('sims.SIM-7.time'), t('sims.SIM-7.months', { count: r.months }), t('sims.SIM-7.now')],
          ],
        },
        meaning: t('sims.SIM-7.meaning'),
      };
    },
  },
  // ------------------------------------------------------------------ SIM-8 · Meta de ahorro con inflación
  {
    id: 'SIM-8',
    levelId: 'level-4',
    icon: 'flag',
    fields: [
      { id: 'price', kind: 'money', default: '1500000' },
      { id: 'months', kind: 'int', default: '12', min: 1, max: 60 },
      { id: 'inflation', kind: 'percent', default: pctOf(medium.monthlyInflation) },
      { id: 'return', kind: 'percent', default: '0' },
    ],
    sources: ['indec'],
    compute: (v, t) => {
      const months = Number(v.months);
      const r = savingsGoal({ currentPrice: v.price!, months, monthlyInflation: v.inflation!, monthlyReturn: v.return! });
      const data = Array.from({ length: months + 1 }, (_, m) => {
        const saved = D(v.return!).isZero() ? r.monthlySaving.times(m) : r.monthlySaving.times(D(1).plus(v.return!).pow(m).minus(1)).div(v.return!);
        return { month: m, price: num(D(v.price!).times(D(1).plus(v.inflation!).pow(m))), saved: num(saved) };
      });
      return {
        mainLabel: t('sims.SIM-8.main'),
        main: fm(r.monthlySaving),
        sentence: t('sims.SIM-8.sentence', { price: fm(v.price!), future: fm(r.futurePrice), count: months, monthly: fm(r.monthlySaving) }),
        pills: [{ tone: 'warning', icon: 'trending_up', text: t('sims.SIM-8.pillFuture', { future: fm(r.futurePrice) }) }],
        chart: {
          kind: 'area',
          title: t('sims.SIM-8.chartTitle'),
          conclusion: t('sims.SIM-8.chartConclusion', { count: months }),
          xKey: 'month',
          series: [
            { key: 'price', label: t('sims.SIM-8.priceSeries') },
            { key: 'saved', label: t('sims.SIM-8.savedSeries') },
          ],
          data,
          currency: 'ARS',
        },
        table: {
          columns: [t('sims.common.month'), t('sims.SIM-8.priceSeries'), t('sims.SIM-8.savedSeries')],
          rows: data.filter((_, i) => i % Math.max(1, Math.ceil(months / 6)) === 0 || i === months).map((d) => [d.month === 0 ? t('sims.common.today') : String(d.month), fm(String(d.price)), fm(String(d.saved))]),
        },
        meaning: t('sims.SIM-8.meaning'),
      };
    },
  },
  // ------------------------------------------------------------------ SIM-9 · Bola de nieve o avalancha
  {
    id: 'SIM-9',
    levelId: 'level-5',
    icon: 'stacked_line_chart',
    fields: [
      { id: 'b1', kind: 'money', default: '40000' },
      { id: 'r1', kind: 'percent', default: '150' },
      { id: 'm1', kind: 'money', default: '4000' },
      { id: 'b2', kind: 'money', default: '15000' },
      { id: 'r2', kind: 'percent', default: '110' },
      { id: 'm2', kind: 'money', default: '1500' },
      { id: 'b3', kind: 'money', default: '200000' },
      { id: 'r3', kind: 'percent', default: '80' },
      { id: 'm3', kind: 'money', default: '10000' },
      { id: 'extra', kind: 'money', default: '20000' },
    ],
    sources: [],
    compute: (v, t) => {
      const debts = [1, 2, 3].map((n) => ({ id: `d${n}`, name: t(`sims.SIM-9.debt${n}`), balance: v[`b${n}`]!, tna: v[`r${n}`]!, minimumPayment: v[`m${n}`]! }));
      const snow = debtPayoff({ debts, extra: v.extra!, method: 'snowball' });
      const aval = debtPayoff({ debts, extra: v.extra!, method: 'avalanche' });
      const saving = snow.totalInterest.minus(aval.totalInterest);
      const firstSnow = snow.paidOff[0]?.month ?? 0;
      const firstAval = aval.paidOff[0]?.month ?? 0;
      return {
        mainLabel: t('sims.SIM-9.main'),
        main: fm(saving.abs()),
        sentence: t('sims.SIM-9.sentence', { saving: fm(saving.abs()), count: Math.max(0, firstAval - firstSnow) }),
        pills: [
          { tone: 'neutral', icon: 'schedule', text: t('sims.SIM-9.pillSnow', { count: snow.months }) },
          { tone: 'neutral', icon: 'schedule', text: t('sims.SIM-9.pillAval', { count: aval.months }) },
        ],
        chart: {
          kind: 'bar',
          title: t('sims.SIM-9.chartTitle'),
          conclusion: t('sims.SIM-9.chartConclusion'),
          xKey: 'name',
          series: [{ key: 'interest', label: t('sims.SIM-9.interest') }],
          data: [
            { name: t('sims.SIM-9.snowball'), interest: num(snow.totalInterest) },
            { name: t('sims.SIM-9.avalanche'), interest: num(aval.totalInterest) },
          ],
          currency: 'ARS',
        },
        table: {
          columns: [t('sims.common.method'), t('sims.SIM-9.order'), t('sims.SIM-9.monthsCol'), t('sims.SIM-9.interest')],
          rows: [
            [t('sims.SIM-9.snowball'), snow.paidOff.map((p) => p.name).join(' → '), String(snow.months), fm(snow.totalInterest)],
            [t('sims.SIM-9.avalanche'), aval.paidOff.map((p) => p.name).join(' → '), String(aval.months), fm(aval.totalInterest)],
          ],
        },
        meaning: t('sims.SIM-9.meaning'),
      };
    },
  },
  // ------------------------------------------------------------------ SIM-10 · Interés compuesto
  {
    id: 'SIM-10',
    levelId: 'level-7',
    icon: 'trending_up',
    fields: [
      { id: 'currency', kind: 'choice', default: 'USD', choices: ['USD', 'ARS'] },
      { id: 'initial', kind: 'money', default: '0' },
      { id: 'monthly', kind: 'money', default: '200' },
      { id: 'rate', kind: 'percent', default: '12' },
      { id: 'years', kind: 'int', default: '33', min: 1, max: 50 },
    ],
    sources: [],
    compute: (v, t) => {
      const years = Number(v.years);
      const money = v.currency === 'USD' ? fu : fm;
      const r = compoundGrowth({ initial: v.initial!, monthly: v.monthly!, annualRate: v.rate!, years });
      const data = Array.from({ length: years + 1 }, (_, y) => {
        const g = compoundGrowth({ initial: v.initial!, monthly: v.monthly!, annualRate: v.rate!, years: y });
        return { year: y, final: num(g.final), contributed: num(g.contributed) };
      });
      return {
        mainLabel: t('sims.SIM-10.main', { count: years }),
        main: money(r.final, 0),
        sentence: t('sims.SIM-10.sentence', { monthly: money(v.monthly!, 0), rate: fp(v.rate!, 1), count: years, final: money(r.final, 0), interest: money(r.interest, 0) }),
        pills: [
          { tone: 'neutral', icon: 'savings', text: t('sims.SIM-10.pillContributed', { amount: money(r.contributed, 0) }) },
          { tone: 'info', icon: 'trending_up', text: t('sims.SIM-10.pillInterest', { amount: money(r.interest, 0) }) },
        ],
        chart: {
          kind: 'area',
          title: t('sims.SIM-10.chartTitle'),
          conclusion: t('sims.SIM-10.chartConclusion'),
          xKey: 'year',
          series: [
            { key: 'final', label: t('sims.SIM-10.finalSeries') },
            { key: 'contributed', label: t('sims.SIM-10.contributedSeries') },
          ],
          data,
          currency: v.currency === 'USD' ? 'USD' : 'ARS',
        },
        table: {
          columns: [t('sims.common.year'), t('sims.SIM-10.contributedSeries'), t('sims.SIM-10.finalSeries')],
          rows: data.filter((_, i) => i % Math.max(1, Math.ceil(years / 6)) === 0 || i === years).map((d) => [String(d.year), money(String(d.contributed), 0), money(String(d.final), 0)]),
        },
        meaning: t('sims.SIM-10.meaning'),
      };
    },
  },
  // ------------------------------------------------------------------ SIM-11 · CEDEAR
  {
    id: 'SIM-11',
    levelId: 'level-7',
    icon: 'currency_exchange',
    fields: [
      { id: 'usdPrice', kind: 'usd', default: '600' },
      { id: 'ratio', kind: 'int', default: '20', min: 1, max: 500 },
      { id: 'fx', kind: 'money', default: '1500' },
    ],
    sources: ['byma-cedears', 'cajval-cedears'],
    compute: (v, t) => {
      const base = cedearTheoreticalPrice({ usdPrice: v.usdPrice!, ratio: v.ratio!, impliedFx: v.fx! });
      const up = (x: string) => D(x).times('1.1').toString();
      const stock = cedearTheoreticalPrice({ usdPrice: up(v.usdPrice!), ratio: v.ratio!, impliedFx: v.fx! });
      const fx = cedearTheoreticalPrice({ usdPrice: v.usdPrice!, ratio: v.ratio!, impliedFx: up(v.fx!) });
      const both = cedearTheoreticalPrice({ usdPrice: up(v.usdPrice!), ratio: v.ratio!, impliedFx: up(v.fx!) });
      return {
        mainLabel: t('sims.SIM-11.main'),
        main: fm(base),
        sentence: t('sims.SIM-11.sentence', { usd: fu(v.usdPrice!), ratio: v.ratio, fx: fm(v.fx!), price: fm(base) }),
        pills: [{ tone: 'info', icon: 'info', text: t('sims.SIM-11.pillExample') }],
        chart: {
          kind: 'bar',
          title: t('sims.SIM-11.chartTitle'),
          conclusion: t('sims.SIM-11.chartConclusion'),
          xKey: 'name',
          series: [{ key: 'value', label: t('sims.SIM-11.priceSeries') }],
          data: [
            { name: t('sims.SIM-11.base'), value: num(base) },
            { name: t('sims.SIM-11.stockUp'), value: num(stock) },
            { name: t('sims.SIM-11.fxUp'), value: num(fx) },
            { name: t('sims.SIM-11.bothUp'), value: num(both) },
          ],
          currency: 'ARS',
        },
        table: {
          columns: [t('sims.common.scenario'), t('sims.SIM-11.priceSeries')],
          rows: [
            [t('sims.SIM-11.base'), fm(base)],
            [t('sims.SIM-11.stockUp'), fm(stock)],
            [t('sims.SIM-11.fxUp'), fm(fx)],
            [t('sims.SIM-11.bothUp'), fm(both)],
          ],
        },
        meaning: t('sims.SIM-11.meaning'),
      };
    },
  },
  // ------------------------------------------------------------------ SIM-12 · ¿Dónde guardo mi fondo?
  {
    id: 'SIM-12',
    levelId: 'level-6',
    icon: 'account_balance_wallet',
    fields: [
      { id: 'amount', kind: 'money', default: '3000000' },
      { id: 'days', kind: 'int', default: '30', min: 1, max: 365 },
      { id: 'inflation', kind: 'percent', default: pctOf(medium.monthlyInflation) },
      { id: 'remunerated', kind: 'percent', default: pctOf(medium.exampleRates.remunerated) },
      { id: 'fixedTerm', kind: 'percent', default: pctOf(medium.exampleRates.fixedTerm) },
      { id: 'moneyMarket', kind: 'percent', default: pctOf(medium.exampleRates.moneyMarket) },
    ],
    sources: ['bcra-a6885', 'bcra-a8407', 'gob-fci', 'indec'],
    preset: (w) => {
      const fund = w.pockets.find((p) => p.isEmergencyFund);
      return fund && D(fund.amount).gt(0) ? { amount: fund.amount } : {};
    },
    compute: (v, t) => {
      const days = Number(v.days);
      const options = emergencyFundOptions({
        amount: v.amount!,
        days,
        monthlyInflation: v.inflation!,
        options: [
          { id: 'remunerated', tna: v.remunerated!, accrual: 'daily' },
          { id: 'fixedTerm', tna: v.fixedTerm!, accrual: 'at_maturity' },
          { id: 'moneyMarket', tna: v.moneyMarket!, accrual: 'daily' },
        ],
      });
      const name = (id: string) => t(`sims.SIM-12.options.${id}`);
      const beating = options.filter((o) => o.realRate.gt(0)).length;
      return {
        mainLabel: t('sims.SIM-12.main', { days }),
        main: t('sims.SIM-12.beating', { count: beating }),
        sentence: t('sims.SIM-12.sentence', { inflation: fp(accumulatedInflation(v.inflation!, D(days).div(30)), 2), days }),
        pills: [{ tone: 'info', icon: 'info', text: t('sims.SIM-12.pillNotAdvice') }],
        chart: {
          kind: 'bar',
          title: t('sims.SIM-12.chartTitle', { days }),
          conclusion: t('sims.SIM-12.chartConclusion'),
          xKey: 'name',
          series: [
            { key: 'final', label: t('sims.SIM-12.finalSeries') },
            { key: 'power', label: t('sims.SIM-12.powerSeries') },
          ],
          data: options.map((o) => ({ name: name(o.id), final: num(o.final), power: num(o.purchasingPower) })),
          currency: 'ARS',
        },
        table: {
          columns: [t('sims.common.option'), t('sims.SIM-12.finalSeries'), t('sims.SIM-12.realCol'), t('sims.SIM-12.liquidity'), t('sims.SIM-12.guarantee')],
          rows: options.map((o) => [name(o.id), fm(o.final), formatPercent(o.realRate, { decimals: 2, sign: 'always' }), t(`sims.SIM-12.liquidityOf.${o.id}`), t(`sims.SIM-12.guaranteeOf.${o.id}`)]),
        },
        meaning: t('sims.SIM-12.meaning'),
      };
    },
  },
];

export const simById = (id: string) => SIM_DEFS.find((s) => s.id === id);

/** All tools in order, including SIM-3, which keeps its own component. */
export const TOOL_IDS = ['SIM-1', 'SIM-2', 'SIM-3', 'SIM-4', 'SIM-5', 'SIM-6', 'SIM-7', 'SIM-8', 'SIM-9', 'SIM-10', 'SIM-11', 'SIM-12'];
export const TOOL_LEVEL: Record<string, string> = { ...Object.fromEntries(SIM_DEFS.map((s) => [s.id, s.levelId])), 'SIM-3': 'level-6' };
