import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { sourceById } from '@/app/sources';
import { MoneyInput } from '@/components/money/MoneyInput';
import { PercentInput } from '@/components/money/PercentInput';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { SegmentedButton } from '@/components/ui/SegmentedButton';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableHeaderCell, TableRow } from '@/components/ui/Table';
import { D } from '@/lib/finance';
import { formatCompactMoney, formatNumber, NBSP, parseDecimalInput } from '@/lib/money';
import { cn } from '@/lib/utils';
import type { SimChart, SimDef, SimField, SimOutput, SimValues } from './defs';

/**
 * The anatomy of every tool (CLAUDE.md 2.2.1 pattern 9, D-176): data on the left with help and
 * example; on the right the main result, the plain-language sentence, the chart with its conclusion
 * and "Ver como tabla", and "Qué significa esto"; assumptions always in sight with "Dónde ver los
 * valores reales"; "Prueba cambiar…"; compare two scenarios; the legal notice; and on phones the
 * result fixed while the data changes. Values are examples; nothing leaves the browser.
 */
const ANNOUNCE_DELAY = 700;
const PILL_TONE = {
  warning: 'bg-warning-container text-on-warning-container',
  success: 'bg-success-container text-on-success-container',
  info: 'bg-info-container text-on-info-container',
  neutral: 'bg-surface-container text-on-surface',
} as const;

function initialText(field: SimField, value: string): string {
  if (field.kind === 'money' || field.kind === 'usd') return formatNumber(value, D(value).isInteger() ? 0 : 2);
  if (field.kind === 'percent') return value.replace('.', ',');
  return value;
}

/** Parses the typed texts; null when any field is not valid. */
function parse(def: SimDef, texts: Record<string, string>): SimValues | null {
  const out: SimValues = {};
  for (const f of def.fields) {
    const raw = texts[f.id] ?? '';
    if (f.kind === 'choice') out[f.id] = raw;
    else if (f.kind === 'int') {
      const n = Number(raw);
      if (!Number.isInteger(n) || n < (f.min ?? 0) || n > (f.max ?? Number.MAX_SAFE_INTEGER)) return null;
      out[f.id] = String(n);
    } else {
      const parsed = parseDecimalInput(raw);
      if (parsed === null || D(parsed).lt(0)) return null;
      out[f.id] = f.kind === 'percent' ? D(parsed).div(100).toString() : parsed;
    }
  }
  return out;
}

function tickFormatter(currency: SimChart['currency']) {
  return (v: number) => {
    if (currency === 'percent') return `${formatNumber(String(v), 1)}${NBSP}%`;
    if (v === 0) return currency === 'USD' ? `USD${NBSP}0` : `$${NBSP}0`;
    if (Math.abs(v) >= 1e6) return formatCompactMoney(String(v), { currency });
    if (Math.abs(v) >= 1000) return `${currency === 'USD' ? `USD${NBSP}` : `$${NBSP}`}${formatNumber(String(Math.round(v / 1000)), 0)}${NBSP}mil`;
    return `${currency === 'USD' ? `USD${NBSP}` : `$${NBSP}`}${formatNumber(String(Math.round(v)), 0)}`;
  };
}

function Chart({ chart }: { chart: SimChart }) {
  const format = tickFormatter(chart.currency);
  const colors = ['var(--chart-1)', 'var(--chart-2)'];
  const common = { data: chart.data, margin: { top: 8, right: 8, bottom: 0, left: 0 } };
  const axes = (
    <>
      <CartesianGrid vertical={false} stroke="var(--md-sys-color-outline-variant)" />
      <XAxis dataKey={chart.xKey} tickLine={false} axisLine={false} tick={{ fill: 'var(--md-sys-color-on-surface-variant)', fontSize: 12 }} />
      <YAxis tickLine={false} axisLine={false} width={76} tick={{ fill: 'var(--md-sys-color-on-surface-variant)', fontSize: 12 }} tickFormatter={format} />
      <Tooltip
        cursor={{ fill: 'var(--md-sys-color-surface-container)' }}
        content={({ active, payload, label }) =>
          active && payload?.length ? (
            <div className="rounded-md bg-inverse-surface px-3 py-2 text-label-medium text-inverse-on-surface shadow-elevation-1 tabular-nums">
              <p>{label}</p>
              {payload.map((p) => (
                <p key={String(p.dataKey)}>
                  {p.name}: {format(Number(p.value))}
                </p>
              ))}
            </div>
          ) : null
        }
      />
      {chart.series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
    </>
  );
  return (
    <div className="h-60 w-full" aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        {chart.kind === 'area' ? (
          <AreaChart {...common}>
            {axes}
            {chart.series.map((s, i) => (
              <Area key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={colors[i]} strokeWidth={2} fill={colors[i]} fillOpacity={i === 0 ? 0.12 : 0.06} isAnimationActive={false} />
            ))}
          </AreaChart>
        ) : (
          <BarChart {...common}>
            {axes}
            {chart.series.map((s, i) => (
              <Bar key={s.key} dataKey={s.key} name={s.label} fill={colors[i]} radius={[6, 6, 0, 0]} isAnimationActive={false} />
            ))}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

export function GenericSimulator({ def, preset, labelledBy }: { def: SimDef; preset?: Partial<Record<string, string>>; labelledBy: string }) {
  const { t } = useTranslation();
  const k = (key: string) => `sims.${def.id}.${key}`;
  const [texts, setTexts] = useState<Record<string, string>>(() =>
    Object.fromEntries(def.fields.map((f) => [f.id, initialText(f, preset?.[f.id] ?? f.default)])),
  );
  const [showTable, setShowTable] = useState(false);
  const [saved, setSaved] = useState<{ id: string; main: string; label: string }[]>([]);

  const values = parse(def, texts);
  const output: SimOutput | null = useMemo(() => (values ? def.compute(values, t) : null), [values && JSON.stringify(values), def, t]); // eslint-disable-line react-hooks/exhaustive-deps

  const sentence = output?.sentence ?? t('sims.common.invalid');
  const [announced, setAnnounced] = useState(sentence);
  useEffect(() => {
    const timer = window.setTimeout(() => setAnnounced(sentence), ANNOUNCE_DELAY);
    return () => window.clearTimeout(timer);
  }, [sentence]);

  const assumptions = t(k('assumptions'), { returnObjects: true }) as string[];
  const sources = def.sources.map((id) => sourceById(id)).filter((s) => s !== undefined);
  const set = (id: string, value: string) => setTexts((prev) => ({ ...prev, [id]: value }));
  const summary = def.fields
    .filter((f) => f.kind !== 'choice')
    .slice(0, 3)
    .map((f) => `${t(k(`fields.${f.id}.short`), { defaultValue: t(k(`fields.${f.id}.label`)) })}: ${texts[f.id]}${f.kind === 'percent' ? `${NBSP}%` : ''}`)
    .join(' · ');

  return (
    <section aria-labelledby={labelledBy} className="@container flex min-w-0 flex-col gap-4">
      <div className="grid min-w-0 grid-cols-1 gap-4 @3xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-4 self-start">
          <form noValidate onSubmit={(e) => e.preventDefault()} aria-label={t('sims.common.data')} className="flex min-w-0 flex-col gap-5 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)">
            {def.fields.map((f) => {
              const id = `${def.id}-${f.id}`;
              const label = t(k(`fields.${f.id}.label`));
              const help = t(k(`fields.${f.id}.help`));
              if (f.kind === 'money' || f.kind === 'usd')
                return <MoneyInput key={f.id} id={id} label={label} helperText={help} currency={f.kind === 'usd' ? 'USD' : 'ARS'} value={texts[f.id]} onChange={(e) => set(f.id, e.target.value)} />;
              if (f.kind === 'percent') return <PercentInput key={f.id} id={id} label={label} helperText={help} value={texts[f.id]} onChange={(e) => set(f.id, e.target.value)} />;
              if (f.kind === 'choice')
                return (
                  <div key={f.id} className="flex flex-col gap-2">
                    <SegmentedButton label={label} value={texts[f.id]!} onValueChange={(v) => v && set(f.id, v)} options={f.choices!.map((c) => ({ value: c, label: t(k(`fields.${f.id}.choices.${c}`)) }))} className="w-full" />
                    <p className="text-body-small text-on-surface-variant">{help}</p>
                  </div>
                );
              // Integer: slider with its number field, in sync and operable with the keyboard (2.10)
              return (
                <div key={f.id} className="flex flex-col gap-2">
                  <label htmlFor={id} className="text-label-medium text-on-surface">
                    {label}
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={f.min}
                      max={f.max}
                      step={1}
                      value={Number(texts[f.id]) || f.min}
                      onChange={(e) => set(f.id, e.target.value)}
                      aria-label={t('sims.common.slider', { label })}
                      className="h-12 min-w-0 flex-1 accent-primary md:h-10"
                    />
                    <input
                      id={id}
                      type="number"
                      inputMode="numeric"
                      min={f.min}
                      max={f.max}
                      value={texts[f.id]}
                      onChange={(e) => set(f.id, e.target.value)}
                      aria-describedby={`${id}-help`}
                      className="h-12 w-20 rounded-sm border border-outline bg-surface-container-lowest px-3 text-body-large tabular-nums md:h-10 md:text-body-medium"
                    />
                  </div>
                  <p id={`${id}-help`} className="text-body-small text-on-surface-variant">
                    {help}
                  </p>
                </div>
              );
            })}
            <p className="flex items-start gap-2 rounded-md bg-info-container px-3 py-2 text-body-small text-on-info-container">
              <Icon name="lightbulb" size={18} className="mt-px text-info" />
              <span>{t(k('try'))}</span>
            </p>
          </form>
          <details className="group rounded-xl border border-outline-variant bg-surface-container-lowest">
            <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-(--space-card-padding) py-3 text-body-medium text-on-surface">
              <Icon name="info" size={20} className="text-info" />
              <span className="min-w-0 flex-1">{t('sims.common.assumptionsSummary')}</span>
              <Icon name="keyboard_arrow_down" className="transition-transform group-open:rotate-180" />
            </summary>
            <div className="flex flex-col gap-3 border-t border-outline-variant px-(--space-card-padding) py-3 text-body-medium text-on-surface">
              <ul className="list-disc space-y-1 pl-5">
                {assumptions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
                <li>{t('sims.common.examples')}</li>
              </ul>
              {sources.length > 0 && (
                <div className="flex flex-col gap-1">
                  <p className="text-title-small">{t('sims.common.whereReal')}</p>
                  <ul className="flex flex-col gap-1">
                    {sources.map((s) => (
                      <li key={s!.id}>
                        <a href={s!.url} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">
                          {s!.name}
                          <span className="sr-only"> {t('sim3.newTab')}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </details>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="@container flex min-w-0 flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)">
            {output ? (
              <>
                <p className="text-title-small text-on-surface-variant">{output.mainLabel}</p>
                <p className="text-display-small break-words text-primary tabular-nums @lg:text-display-medium">{output.main}</p>
                <p className="text-body-large text-on-surface">{output.sentence}</p>
                {output.pills.length > 0 && (
                  <ul className="flex flex-wrap gap-2">
                    {output.pills.map((p) => (
                      <li key={p.text} className={cn('inline-flex items-center gap-1 rounded-full px-3 py-1 text-label-medium', PILL_TONE[p.tone])}>
                        <Icon name={p.icon} size={16} />
                        {p.text}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <p className="text-body-large text-on-surface">{t('sims.common.invalid')}</p>
            )}
            <p className="sr-only" aria-live="polite" aria-atomic="true">
              {announced}
            </p>
          </div>

          {output && (
            <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)">
              {output.chart && (
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="text-title-medium text-on-surface">{output.chart.title}</h2>
                    <p className="text-body-medium text-on-surface-variant">{output.chart.conclusion}</p>
                  </div>
                  <Button variant="text" size="xs" leadingIcon="table_view" onClick={() => setShowTable((v) => !v)} aria-expanded={showTable}>
                    {showTable ? t('sim3.chart.hideTable') : t('sim3.chart.showTable')}
                  </Button>
                </div>
              )}
              {showTable || !output.chart ? (
                <TableContainer label={output.chart?.title ?? t('sims.common.table')}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        {output.table.columns.map((c, i) => (
                          <TableHeaderCell key={c} className={i > 0 ? 'text-right' : undefined}>
                            {c}
                          </TableHeaderCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {output.table.rows.map((row) => (
                        <TableRow key={row.join('|')}>
                          {row.map((cell, i) => (
                            <TableCell key={i} className={i > 0 ? 'text-right tabular-nums' : undefined}>
                              {cell}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Chart chart={output.chart} />
              )}
              <div className="rounded-md bg-surface-container px-4 py-3">
                <h2 className="text-title-small text-on-surface">{t('sim3.meaning.title')}</h2>
                <p className="mt-1 text-body-medium text-on-surface">{output.meaning}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="tonal"
                leadingIcon="compare_arrows"
                disabledReason={output ? undefined : t('sims.common.invalid')}
                onClick={() => output && setSaved((list) => [{ id: `${Date.now()}`, main: output.main, label: summary }, ...list].slice(0, 2))}
              >
                {t('sim3.compare.save')}
              </Button>
              <p className="text-body-small text-on-surface-variant">{t('sim3.compare.help')}</p>
            </div>
            {saved.length > 0 && (
              <ul className="grid grid-cols-1 gap-3 @xl:grid-cols-2" aria-label={t('sim3.compare.listLabel')}>
                {saved.map((s, index) => (
                  <li key={s.id} className="flex min-w-0 flex-col gap-1 rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-title-small text-on-surface">{t('sim3.compare.name', { n: saved.length - index })}</p>
                      <IconButton icon="close" size="xs" label={t('sim3.compare.remove', { n: saved.length - index })} onClick={() => setSaved((list) => list.filter((x) => x.id !== s.id))} />
                    </div>
                    <p className="text-body-small text-on-surface-variant">{s.label}</p>
                    <p className="text-title-large break-words text-on-surface">{s.main}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <p className="border-t border-outline-variant pt-3 text-body-small text-on-surface-variant">{t('sim3.legal')}</p>

      {output && (
        <div aria-hidden className="sticky bottom-20 z-10 flex items-center justify-between gap-3 rounded-lg bg-inverse-surface px-4 py-3 text-inverse-on-surface shadow-elevation-2 @3xl:hidden">
          <span className="min-w-0 truncate text-label-large">{output.mainLabel}</span>
          <span className="shrink-0 text-title-medium tabular-nums">{output.main}</span>
        </div>
      )}
    </section>
  );
}
