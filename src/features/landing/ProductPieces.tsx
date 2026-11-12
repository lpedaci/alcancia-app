import { useTranslation } from 'react-i18next';
import { MoneyText } from '@/components/money/MoneyText';
import { Icon } from '@/components/ui/Icon';
import { IconTile } from '@/components/ui/IconTile';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Fuerte } from '@/features/companion/Fuerte';
import { installmentsPresentValue, purchasingPower, savingsGoal } from '@/lib/finance';
import { formatMoney, formatPercent } from '@/lib/money';
import { cn } from '@/lib/utils';

/**
 * Real pieces of the product, drawn with the same components and formulas (CLAUDE.md F0): the
 * landing never shows fake screenshots. Decorative copies are hidden from assistive tech where
 * they repeat information already in the text.
 */
const card = 'rounded-xl border border-outline-variant bg-surface-container-lowest p-4';

/** SIM-3 result: $ 100.000 with 3 % monthly inflation for 12 months (F-05). */
export function PieceSimResult({ className }: { className?: string }) {
  const { t } = useTranslation();
  const r = purchasingPower({ amount: '100000', rate: '0.03', periods: 12 });
  return (
    <div className={cn(card, 'flex flex-col gap-2', className)}>
      <p className="text-label-medium text-on-surface-variant">{t('landing.pieces.simLabel')}</p>
      <p className="text-headline-small text-primary">
        <MoneyText value={r.purchasingPower} />
      </p>
      <span className="inline-flex w-fit items-center gap-1 rounded-full bg-warning-container px-2 py-0.5 text-label-medium text-on-warning-container">
        <Icon name="trending_down" size={16} className="text-warning" />
        {t('landing.pieces.simLoss', { loss: formatPercent(r.loss, { decimals: 1 }) })}
      </span>
    </div>
  );
}

/** A goal card adjusted by inflation (2.2.1, pattern 13; SIM-8, F-22). */
export function PieceGoal({ className }: { className?: string }) {
  const { t } = useTranslation();
  const goal = savingsGoal({ currentPrice: '1500000', months: 12, monthlyInflation: '0.03', monthlyReturn: '0.025' });
  return (
    <div className={cn(card, 'flex flex-col gap-3', className)}>
      <div className="flex items-center gap-3">
        <IconTile icon="target" tone="tertiary" size="sm" />
        <div className="min-w-0">
          <p className="text-title-small text-on-surface">{t('landing.pieces.goalName')}</p>
          <p className="text-body-small text-on-surface-variant">
            {t('landing.pieces.goalTarget', { amount: formatMoney(goal.futurePrice, { decimals: 0 }) })}
          </p>
        </div>
      </div>
      <ProgressBar value={42} label={t('landing.pieces.goalProgress')} valueText="42 %" tone="tertiary" />
    </div>
  );
}

/** A learning KPI with a variation pill (2.2.1, pattern 3). */
export function PieceKpi({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <div className={cn(card, 'flex flex-col gap-1', className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-label-medium text-on-surface-variant">{t('landing.pieces.kpiLabel')}</p>
        <IconTile icon="school" size="sm" />
      </div>
      <p className="text-display-small text-on-surface tabular-nums">68 %</p>
      <span className="inline-flex w-fit items-center gap-1 rounded-full bg-success-container px-2 py-0.5 text-label-medium text-on-success-container">
        <Icon name="trending_up" size={16} className="text-success" />
        {t('landing.pieces.kpiTrend')}
      </span>
    </div>
  );
}

/** Problem scene 1: does my salary last the month? A budget split. */
export function SceneBudget() {
  const { t } = useTranslation();
  const rows = [
    { key: 'needs', pct: 51, tone: 'bg-chart-1' },
    { key: 'wants', pct: 15, tone: 'bg-chart-3' },
    { key: 'savings', pct: 20, tone: 'bg-chart-2' },
  ] as const;
  return (
    <div className="flex flex-col gap-2" aria-hidden>
      {rows.map((r) => (
        <div key={r.key} className="flex items-center gap-2 text-body-small text-on-surface">
          <span className="w-20 shrink-0">{t(`landing.problem.budget.${r.key}`)}</span>
          <span className="h-2 min-w-0 flex-1 rounded-full bg-surface-container">
            <span className={cn('block h-2 rounded-full', r.tone)} style={{ width: `${r.pct}%` }} />
          </span>
          <span className="w-9 shrink-0 text-right tabular-nums">{r.pct} %</span>
        </div>
      ))}
    </div>
  );
}

/** Problem scene 2: inflation eats savings. */
export function SceneInflation() {
  const { t } = useTranslation();
  const r = purchasingPower({ amount: '100000', rate: '0.03', periods: 12 });
  return (
    <div className="flex items-end justify-between gap-3" aria-hidden>
      <div>
        <p className="text-body-small text-on-surface-variant">{t('landing.problem.inflation.today')}</p>
        <p className="text-title-medium tabular-nums">{formatMoney('100000', { decimals: 0 })}</p>
      </div>
      <Icon name="arrow_forward" className="mb-1 text-on-surface-variant" />
      <div className="text-right">
        <p className="text-body-small text-on-surface-variant">{t('landing.problem.inflation.later')}</p>
        <p className="text-title-medium text-warning tabular-nums">{formatMoney(r.purchasingPower, { decimals: 0 })}</p>
      </div>
    </div>
  );
}

/** Problem scene 3: what does the card cost? Installments in present value (F-10). */
export function SceneCard() {
  const { t } = useTranslation();
  const pv = installmentsPresentValue({ installment: '10000', count: 12, monthlyInflation: '0.03' });
  return (
    <dl className="grid grid-cols-2 gap-2 text-body-small" aria-hidden>
      <div className="rounded-md bg-surface-container p-2">
        <dt className="text-on-surface-variant">{t('landing.problem.card.cash')}</dt>
        <dd className="text-title-small tabular-nums">{formatMoney('102000', { decimals: 0 })}</dd>
      </div>
      <div className="rounded-md bg-surface-container p-2">
        <dt className="text-on-surface-variant">{t('landing.problem.card.installments')}</dt>
        <dd className="text-title-small tabular-nums">{formatMoney(pv, { decimals: 0 })}</dd>
      </div>
    </dl>
  );
}

/** Small level map (2.2.1, pattern 8) for the solution bento. */
export function PieceLevelMap() {
  const { t } = useTranslation();
  const levels = [
    { n: 1, state: 'done' },
    { n: 2, state: 'done' },
    { n: 3, state: 'current' },
    { n: 4, state: 'locked' },
  ] as const;
  return (
    <ol className="flex flex-col gap-2" aria-hidden>
      {levels.map((l) => (
        <li key={l.n} className="flex items-center gap-2 text-body-small">
          <Icon
            name={l.state === 'done' ? 'check_circle' : l.state === 'current' ? 'radio_button_unchecked' : 'lock'}
            size={18}
            filled={l.state === 'done'}
            className={l.state === 'done' ? 'text-success' : l.state === 'current' ? 'text-primary' : 'text-on-surface-variant'}
          />
          <span className={cn('text-on-surface', l.state === 'current' && 'text-label-large text-primary')}>
            {t(`landing.solution.levels.l${l.n}`)}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function PieceFuerte() {
  return <Fuerte state="greeting" lights={3} size={6} />;
}
