import { useEffect, useId, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { MoneyInput } from '@/components/money/MoneyInput';
import { MoneyText } from '@/components/money/MoneyText';
import { PercentInput } from '@/components/money/PercentInput';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { SegmentedButton } from '@/components/ui/SegmentedButton';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableHeaderCell, TableRow } from '@/components/ui/Table';
import { sourceById } from '@/app/sources';
import scenarios from '@/data/scenarios.json';
import { D, purchasingPower } from '@/lib/finance';
import { formatMoney, formatNumber, formatPercent, NBSP, parseDecimalInput } from '@/lib/money';
import { cn } from '@/lib/utils';

/**
 * SIM-3 · Inflation and purchasing power (CLAUDE.md F4), with the simulator anatomy of 2.2.1:
 * data, main result, plain-language sentence, chart with its table, "Qué significa esto",
 * assumptions, compare scenarios, "Prueba cambiar…" and the legal notice. Works without a session
 * (G0) and inside the wallet (P13). Values are examples, never current rates (1.1.1).
 */
type ScenarioChoice = 'low' | 'medium' | 'high' | 'custom';

interface SavedScenario {
  id: string;
  amount: string;
  monthlyInflation: string;
  months: number;
}

const MONTHS_MIN = 1;
const MONTHS_MAX = 60;
const ANNOUNCE_DELAY = 700;

function compute(amount: string, monthlyInflation: string, months: number) {
  const r = purchasingPower({ amount, rate: monthlyInflation, periods: months });
  return { ...r, amount };
}

export function InflationSimulator({
  headingLevel: Heading = 'h2',
  title,
  idPrefix,
}: {
  headingLevel?: 'h1' | 'h2' | 'h3';
  /** Optional visible title; the page version passes it as its h1. */
  title?: string;
  idPrefix?: string;
}) {
  const { t } = useTranslation();
  const autoId = useId();
  const uid = idPrefix ?? autoId;

  const [amountText, setAmountText] = useState('100.000');
  const [scenario, setScenario] = useState<ScenarioChoice>('medium');
  const [customText, setCustomText] = useState('3');
  const [months, setMonths] = useState(12);
  const [showTable, setShowTable] = useState(false);
  const [saved, setSaved] = useState<SavedScenario[]>([]);

  const amount = parseDecimalInput(amountText);
  const monthlyInflation =
    scenario === 'custom'
      ? (() => {
          const pct = parseDecimalInput(customText);
          return pct === null || D(pct).gt(50) ? null : D(pct).div(100).toString();
        })()
      : (scenarios.find((s) => s.id === scenario)?.monthlyInflation ?? '0.03');

  const valid = amount !== null && D(amount).gt(0) && monthlyInflation !== null;
  const result = useMemo(
    () => (valid ? compute(amount!, monthlyInflation!, months) : null),
    [valid, amount, monthlyInflation, months],
  );

  const sentence = result
    ? t('sim3.sentence', {
        inflation: formatPercent(monthlyInflation!, { decimals: 2 }),
        months,
        amount: formatMoney(amount!, { decimals: 0 }),
        power: formatMoney(result.purchasingPower),
        loss: formatPercent(result.loss, { decimals: 1 }),
      })
    : t('sim3.invalid');

  // Announce the result once the person stops typing (2.10), not on every key.
  const [announced, setAnnounced] = useState(sentence);
  useEffect(() => {
    const timer = window.setTimeout(() => setAnnounced(sentence), ANNOUNCE_DELAY);
    return () => window.clearTimeout(timer);
  }, [sentence]);

  const chartData = useMemo(() => {
    if (!result) return [];
    return Array.from({ length: months + 1 }, (_, m) => {
      const value = purchasingPower({ amount: amount!, rate: monthlyInflation!, periods: m }).purchasingPower;
      return { month: m, value: Number(value.toFixed(2)), label: formatMoney(value) };
    });
  }, [result, months, amount, monthlyInflation]);

  const tableRows = chartData.filter((p) => p.month === 0 || p.month % Math.max(1, Math.ceil(months / 6)) === 0 || p.month === months);
  const scenarioLabel =
    scenario === 'custom' ? t('sim3.scenario.custom') : t(`sim3.scenario.${scenario}`);
  const indec = sourceById('indec');

  const saveScenario = () => {
    if (!result) return;
    setSaved((list) => [{ id: `${Date.now()}`, amount: amount!, monthlyInflation: monthlyInflation!, months }, ...list].slice(0, 2));
  };

  return (
    <section aria-labelledby={`${uid}-title`} className="@container flex min-w-0 flex-col gap-4">
      {title ? (
        <Heading id={`${uid}-title`} className="text-headline-small text-on-surface">
          {title}
        </Heading>
      ) : (
        <Heading id={`${uid}-title`} className="sr-only">
          {t('sim3.title')}
        </Heading>
      )}

      <div className="grid min-w-0 grid-cols-1 gap-4 @3xl:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        {/* Data */}
        <form
          className="flex min-w-0 flex-col gap-5 self-start rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)"
          onSubmit={(e) => e.preventDefault()}
          aria-label={t('sim3.dataLabel')}
        >
          <MoneyInput
            label={t('sim3.amount.label')}
            helperText={t('sim3.amount.help')}
            value={amountText}
            onChange={(e) => setAmountText(e.target.value)}
            id={`${uid}-amount`}
          />
          <div className="flex flex-col gap-2">
            <SegmentedButton
              label={t('sim3.scenario.label')}
              value={scenario}
              onValueChange={setScenario}
              options={[
                { value: 'low', label: t('sim3.scenario.lowShort') },
                { value: 'medium', label: t('sim3.scenario.mediumShort') },
                { value: 'high', label: t('sim3.scenario.highShort') },
                { value: 'custom', label: t('sim3.scenario.customShort') },
              ]}
              className="w-full"
            />
            <p className="text-body-small text-on-surface-variant">{t('sim3.scenario.help', { scenario: scenarioLabel })}</p>
          </div>
          {scenario === 'custom' && (
            <PercentInput
              label={t('sim3.custom.label')}
              helperText={t('sim3.custom.help')}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              id={`${uid}-custom`}
            />
          )}
          <div className="flex flex-col gap-2">
            <label htmlFor={`${uid}-months`} className="text-label-medium text-on-surface">
              {t('sim3.months.label')}
            </label>
            <div className="flex items-center gap-3">
              <input
                id={`${uid}-months-range`}
                type="range"
                min={MONTHS_MIN}
                max={MONTHS_MAX}
                step={1}
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                aria-label={t('sim3.months.sliderLabel')}
                aria-valuetext={t('sim3.months.valueText', { count: months })}
                className="h-12 min-w-0 flex-1 accent-primary md:h-10"
              />
              <input
                id={`${uid}-months`}
                type="number"
                inputMode="numeric"
                min={MONTHS_MIN}
                max={MONTHS_MAX}
                value={months}
                onChange={(e) => {
                  const n = Math.round(Number(e.target.value));
                  if (Number.isFinite(n)) setMonths(Math.min(MONTHS_MAX, Math.max(MONTHS_MIN, n)));
                }}
                aria-describedby={`${uid}-months-help`}
                className="h-12 w-20 rounded-sm border border-outline bg-surface-container-lowest px-3 text-body-large tabular-nums md:h-10 md:text-body-medium"
              />
            </div>
            <p id={`${uid}-months-help`} className="text-body-small text-on-surface-variant">
              {t('sim3.months.help')}
            </p>
          </div>
          <p className="flex items-start gap-2 rounded-md bg-info-container px-3 py-2 text-body-small text-on-info-container">
            <Icon name="lightbulb" size={18} className="mt-px text-info" />
            <span>{t('sim3.tryChanging')}</span>
          </p>
        </form>

        {/* Result */}
        <div className="flex min-w-0 flex-col gap-4">
          <div className="@container flex min-w-0 flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)">
            <p className="text-title-small text-on-surface-variant">
              {t('sim3.resultLabel', { months })}
            </p>
            {result ? (
              <>
                <p className="text-display-small text-primary @lg:text-display-medium">
                  <MoneyText value={result.purchasingPower} compactBelow="xs" />
                </p>
                <p className="max-w-prose text-body-large text-on-surface">{sentence}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-warning-container px-3 py-1 text-label-medium text-on-warning-container">
                    <Icon name="trending_down" size={16} className="text-warning" />
                    {t('sim3.lossPill', { loss: formatPercent(result.loss, { decimals: 1 }) })}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-3 py-1 text-label-medium text-on-surface">
                    <Icon name="price_change" size={16} className="text-on-surface-variant" />
                    {t('sim3.futurePrice', { price: formatMoney(result.futurePrice) })}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-body-large text-on-surface">{t('sim3.invalid')}</p>
            )}
            <p className="sr-only" aria-live="polite" aria-atomic="true">
              {announced}
            </p>
          </div>

          {result && (
            <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-title-medium text-on-surface">{t('sim3.chart.title')}</h3>
                  <p className="text-body-medium text-on-surface-variant">
                    {t('sim3.chart.conclusion', { loss: formatPercent(result.loss, { decimals: 1 }), months })}
                  </p>
                </div>
                <Button variant="text" size="xs" leadingIcon="table_view" onClick={() => setShowTable((v) => !v)} aria-expanded={showTable}>
                  {showTable ? t('sim3.chart.hideTable') : t('sim3.chart.showTable')}
                </Button>
              </div>
              {showTable ? (
                <TableContainer label={t('sim3.chart.tableLabel')}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>{t('sim3.chart.month')}</TableHeaderCell>
                        <TableHeaderCell className="text-right">{t('sim3.chart.power')}</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tableRows.map((row) => (
                        <TableRow key={row.month}>
                          <TableCell>{row.month === 0 ? t('sim3.chart.today') : t('sim3.chart.monthN', { count: row.month })}</TableCell>
                          <TableCell className="text-right tabular-nums">{row.label}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <div className="h-56 w-full" aria-hidden>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                      <CartesianGrid vertical={false} stroke="var(--md-sys-color-outline-variant)" />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: 'var(--md-sys-color-on-surface-variant)', fontSize: 12 }}
                        tickFormatter={(m: number) => (m === 0 ? t('sim3.chart.todayShort') : `${m}`)}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        width={72}
                        tick={{ fill: 'var(--md-sys-color-on-surface-variant)', fontSize: 12 }}
                        tickFormatter={(v: number) => `$${NBSP}${formatNumber(String(Math.round(v / 1000)), 0)}${NBSP}mil`}
                      />
                      <Tooltip
                        cursor={{ stroke: 'var(--md-sys-color-outline)' }}
                        content={({ active, payload }) =>
                          active && payload?.[0] ? (
                            <div className="rounded-md bg-inverse-surface px-3 py-2 text-label-medium text-inverse-on-surface shadow-elevation-1 tabular-nums">
                              {t('sim3.chart.monthN', { count: Number(payload[0].payload.month) })}: {payload[0].payload.label}
                            </div>
                          ) : null
                        }
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="var(--chart-1)"
                        strokeWidth={2}
                        fill="var(--chart-1)"
                        fillOpacity={0.12}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="rounded-md bg-surface-container px-4 py-3">
                <h3 className="text-title-small text-on-surface">{t('sim3.meaning.title')}</h3>
                <p className="mt-1 max-w-prose text-body-medium text-on-surface">{t('sim3.meaning.body')}</p>
              </div>
            </div>
          )}

          {/* Assumptions: always visible in summary, expandable */}
          <details className="group rounded-xl border border-outline-variant bg-surface-container-lowest">
            <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-(--space-card-padding) py-3 text-body-medium text-on-surface">
              <Icon name="info" size={20} className="text-info" />
              <span className="min-w-0 flex-1">
                {t('sim3.assumptions.summary', {
                  scenario: scenarioLabel,
                  inflation: monthlyInflation ? formatPercent(monthlyInflation, { decimals: 2 }) : t('sim3.notSet'),
                })}
              </span>
              <Icon name="keyboard_arrow_down" className="transition-transform group-open:rotate-180" />
            </summary>
            <div className="flex flex-col gap-2 border-t border-outline-variant px-(--space-card-padding) py-3 text-body-medium text-on-surface">
              <ul className="list-disc space-y-1 pl-5">
                <li>{t('sim3.assumptions.constant')}</li>
                <li>{t('sim3.assumptions.noInterest')}</li>
                <li>{t('sim3.assumptions.examples')}</li>
              </ul>
              {indec && (
                <p>
                  {t('sim3.assumptions.whereReal')}{' '}
                  <a href={indec.url} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">
                    {t('sim3.assumptions.indec')}
                    <span className="sr-only"> {t('sim3.newTab')}</span>
                  </a>
                </p>
              )}
            </div>
          </details>

          {/* Compare scenarios */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="tonal" size="s" leadingIcon="compare_arrows" onClick={saveScenario} disabledReason={result ? undefined : t('sim3.invalid')}>
                {t('sim3.compare.save')}
              </Button>
              <p className="text-body-small text-on-surface-variant">{t('sim3.compare.help')}</p>
            </div>
            {saved.length > 0 && (
              <ul className="grid grid-cols-1 gap-3 @xl:grid-cols-2" aria-label={t('sim3.compare.listLabel')}>
                {saved.map((s, index) => {
                  const r = compute(s.amount, s.monthlyInflation, s.months);
                  return (
                    <li key={s.id} className="flex min-w-0 flex-col gap-1 rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-title-small text-on-surface">{t('sim3.compare.name', { n: saved.length - index })}</p>
                        <IconButton
                          icon="close"
                          size="xs"
                          label={t('sim3.compare.remove', { n: saved.length - index })}
                          onClick={() => setSaved((list) => list.filter((x) => x.id !== s.id))}
                        />
                      </div>
                      <p className="text-body-small text-on-surface-variant">
                        {t('sim3.compare.detail', {
                          amount: formatMoney(s.amount, { decimals: 0 }),
                          inflation: formatPercent(s.monthlyInflation, { decimals: 2 }),
                          months: s.months,
                        })}
                      </p>
                      <p className="text-title-large text-on-surface">
                        <MoneyText value={r.purchasingPower} />
                      </p>
                      <p className="text-body-small text-on-surface-variant">
                        {t('sim3.lossPill', { loss: formatPercent(r.loss, { decimals: 1 }) })}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      <p className="border-t border-outline-variant pt-3 text-body-small text-on-surface-variant">
        {t('sim3.legal')}
      </p>

      {/* Phones: the result stays visible while the data changes (2.2.1, pattern 9) */}
      {result && (
        <div
          aria-hidden
          className={cn(
            'sticky bottom-3 z-10 flex items-center justify-between gap-3 rounded-lg bg-inverse-surface px-4 py-3 text-inverse-on-surface shadow-elevation-2 @3xl:hidden',
          )}
        >
          <span className="text-label-large">{t('sim3.stickyLabel', { months })}</span>
          <span className="text-title-medium tabular-nums">{formatMoney(result.purchasingPower)}</span>
        </div>
      )}
    </section>
  );
}
