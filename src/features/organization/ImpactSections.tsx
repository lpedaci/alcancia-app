import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { IconTile } from '@/components/ui/IconTile';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatusPill } from '@/components/ui/StatusPill';
import { formatNumber, formatPercent } from '@/lib/money';
import { cn } from '@/lib/utils';
import { behavior, challengeResults, learning, type OrgMetricsData, reaction, weeklyDone } from './org-data';

/**
 * Impact sections shared by the admin's panel (O1) and the sponsor's report (D1), D-195: Kirkpatrick
 * levels 1 to 3 and level 4 as a future line. Every block says what it measures, shows its
 * conclusion in words and offers the same data as a table (2.10). Groups below the threshold show
 * "Datos insuficientes" (F7).
 */
const card = 'flex min-w-0 flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding) break-inside-avoid';

function Header({ level, icon, id }: { level: 1 | 2 | 3 | 4; icon: Parameters<typeof IconTile>[0]['icon']; id: string }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-start gap-3">
      <IconTile icon={icon} tone={level === 4 ? 'secondary' : 'primary'} />
      <div className="min-w-0">
        <p className="text-label-medium text-on-surface-variant">{t('org.k.level', { n: level })}</p>
        <h2 id={id} className="text-title-large text-on-surface">
          {t(`org.k.l${level}.title`)}
        </h2>
      </div>
    </div>
  );
}

function Insufficient() {
  const { t } = useTranslation();
  return (
    <InlineAlert tone="info" live="none">
      {t('org.insufficient')}
    </InlineAlert>
  );
}

export function ReactionSection({ data }: { data: OrgMetricsData }) {
  const { t } = useTranslation();
  const r = reaction(data);
  return (
    <section aria-labelledby="k1" className={card}>
      <Header level={1} icon="sentiment_satisfied" id="k1" />
      <p className="text-body-medium text-on-surface-variant">{t('org.k.l1.what')}</p>
      {r.status !== 'ok' ? (
        <Insufficient />
      ) : (
        <>
          <p className="flex flex-wrap items-baseline gap-2">
            <span className="text-display-small text-on-surface tabular-nums">{formatNumber(r.value.average.toFixed(1), 1)}</span>
            <span className="text-body-medium text-on-surface-variant">{t('org.k.l1.of5', { count: r.count })}</span>
          </p>
          <ul className="flex flex-col gap-2" aria-label={t('org.k.l1.distribution')}>
            {[5, 4, 3, 2, 1].map((n) => (
              <li key={n} className="grid grid-cols-[4.5rem_minmax(0,1fr)_3rem] items-center gap-3 text-body-small">
                <span className="text-on-surface">{t('org.k.l1.stars', { count: n })}</span>
                <span className="h-2 overflow-hidden rounded-full bg-surface-container" aria-hidden>
                  <span
                    className={cn('block h-full rounded-full', n >= 4 ? 'bg-tertiary' : 'bg-outline')}
                    style={{
                      width: `${Math.round(r.value.distribution[n - 1]! * 100)}%`,
                    }}
                  />
                </span>
                <span className="text-right tabular-nums text-on-surface-variant">{formatPercent(r.value.distribution[n - 1]!, { decimals: 0 })}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

export function LearningSection({ data }: { data: OrgMetricsData }) {
  const { t } = useTranslation();
  const [table, setTable] = useState(false);
  const l = learning(data);
  const results = challengeResults(data);
  return (
    <section aria-labelledby="k2" className={cn(card, '@container')}>
      <Header level={2} icon="school" id="k2" />
      <p className="text-body-medium text-on-surface-variant">{t('org.k.l2.what')}</p>
      {l.status !== 'ok' ? (
        <Insufficient />
      ) : (
        <>
          <p className="text-body-large text-on-surface">
            {t('org.k.l2.conclusion', {
              points: formatNumber(((average(l.value.byDimension.map((d) => d.after - d.before)) ?? 0) * 100).toFixed(0), 0),
              count: l.value.people,
            })}
          </p>
          {table ? (
            <table className="w-full text-body-small tabular-nums">
              <thead>
                <tr className="text-left text-on-surface-variant">
                  <th className="py-1 font-medium">{t('org.k.l2.dimension')}</th>
                  <th className="py-1 text-right font-medium">{t('org.k.l2.before')}</th>
                  <th className="py-1 text-right font-medium">{t('org.k.l2.after')}</th>
                </tr>
              </thead>
              <tbody>
                {l.value.byDimension.map((d) => (
                  <tr key={d.dimension} className="border-t border-outline-variant">
                    <td className="py-1.5">{t(`welcome.dimensions.${d.dimension}`)}</td>
                    <td className="py-1.5 text-right">{formatPercent(d.before, { decimals: 0 })}</td>
                    <td className="py-1.5 text-right">{formatPercent(d.after, { decimals: 0 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <ul className="flex flex-col gap-3" aria-label={t('org.k.l2.chart')}>
              {l.value.byDimension.map((d) => (
                <li key={d.dimension} className="flex flex-col gap-1">
                  <span className="flex flex-wrap items-baseline justify-between gap-2 text-body-small">
                    <span className="text-on-surface">{t(`welcome.dimensions.${d.dimension}`)}</span>
                    <span className="tabular-nums text-on-surface-variant">
                      {formatPercent(d.before, { decimals: 0 })} → <span className="text-on-surface">{formatPercent(d.after, { decimals: 0 })}</span>
                    </span>
                  </span>
                  <span className="relative h-3 overflow-hidden rounded-full bg-surface-container" aria-hidden>
                    <span className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${Math.round(d.after * 100)}%` }} />
                    <span className="absolute inset-y-0 left-0 rounded-full bg-[var(--chart-3)]" style={{ width: `${Math.round(d.before * 100)}%` }} />
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-body-small text-on-surface-variant" aria-hidden={table}>
              <li className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-[var(--chart-3)]" />
                {t('org.k.l2.before')}
              </li>
              <li className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-primary" />
                {t('org.k.l2.after')}
              </li>
            </ul>
            <Button variant="text" size="xs" leadingIcon="table_view" onClick={() => setTable((v) => !v)} aria-expanded={table} className="print:hidden">
              {table ? t('org.hideTable') : t('org.showTable')}
            </Button>
          </div>
        </>
      )}
      <div className="flex flex-col gap-3 border-t border-outline-variant pt-4">
        <h3 className="text-title-medium text-on-surface">{t('org.k.l2.challenges')}</h3>
        <ul className="grid grid-cols-[minmax(0,1fr)] gap-2 @2xl:grid-cols-2">
          {results.map(({ levelId, result }) => (
            <li key={levelId} className="flex flex-col gap-1.5 rounded-lg bg-surface-container p-3">
              <span className="text-label-large text-on-surface">
                {t('org.k.l2.level', {
                  name: t(`wallet.sections.${levelId}`),
                  n: levelId.replace('level-', ''),
                })}
              </span>
              {result.status === 'ok' ? (
                <span className="text-body-small text-on-surface-variant">
                  {t('org.k.l2.passRates', {
                    first: formatPercent(result.value.firstPass, {
                      decimals: 0,
                    }),
                    passed: formatPercent(result.value.passed, { decimals: 0 }),
                    count: result.count,
                  })}
                </span>
              ) : (
                <StatusPill tone="neutral" icon="visibility_off" label={t('org.insufficientShort')} className="self-start" />
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function BehaviorSection({ data }: { data: OrgMetricsData }) {
  const { t } = useTranslation();
  const b = behavior(data);
  const w = weeklyDone(data);
  return (
    <section aria-labelledby="k3" className={card}>
      <Header level={3} icon="task_alt" id="k3" />
      <p className="text-body-medium text-on-surface-variant">{t('org.k.l3.what')}</p>
      {b.status !== 'ok' ? (
        <Insufficient />
      ) : (
        <>
          <p className="text-body-small text-on-surface-variant">{t('org.k.l3.respondents', { count: b.value.people })}</p>
          {(['budget', 'emergencyFund', 'fullCardPayment'] as const).map((k) => (
            <div key={k} className="flex flex-col gap-1.5">
              <span className="text-body-small text-on-surface" aria-hidden>
                {t(`org.k.l3.${k}`)}
              </span>
              <ProgressBar value={b.value[k] * 100} label={t(`org.k.l3.${k}`)} valueText={formatPercent(b.value[k], { decimals: 0 })} tone="tertiary" />
            </div>
          ))}
        </>
      )}
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-outline-variant pt-4">
        <span className="text-label-large text-on-surface">{t('org.k.l3.weekly')}</span>
        <span className="text-title-medium text-on-surface tabular-nums">{w.status === 'ok' ? formatPercent(w.value, { decimals: 0 }) : t('org.insufficientShort')}</span>
      </div>
    </section>
  );
}

export function ResultsSection() {
  const { t } = useTranslation();
  return (
    <section aria-labelledby="k4" className={cn(card, 'bg-surface-container')}>
      <Header level={4} icon="monitoring" id="k4" />
      <p className="text-body-medium text-on-surface-variant">{t('org.k.l4.body')}</p>
      <StatusPill tone="neutral" icon="schedule" label={t('org.k.l4.future')} className="self-start" />
    </section>
  );
}

const average = (values: number[]) => (values.length ? values.reduce((s, v) => s + v, 0) / values.length : null);
