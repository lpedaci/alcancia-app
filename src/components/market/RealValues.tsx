import { useTranslation } from 'react-i18next';
import { sourceById } from '@/app/sources';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { D } from '@/lib/finance';
import { type MarketId, type MarketValue, marketDate, useMarket } from '@/lib/market';
import { formatMoney, formatNumber, formatPercent } from '@/lib/money';
import { cn } from '@/lib/utils';

/** A real value as it reads in the interface: percent, pesos or index. */
export function formatMarketValue(v: MarketValue): string {
  if (v.unit === 'percent') return formatPercent(v.value, { decimals: 2 });
  if (v.unit === 'ARS') return formatMoney(v.value, { decimals: 2 });
  return formatNumber(D(v.value), 4);
}

/** "Valor al 31/10/2026 · Fuente: INDEC (publicado por el BCRA)" (1.1.1). */
export function useAsOf() {
  const { t } = useTranslation();
  return (v: MarketValue) => t('market.asOf', { date: marketDate(v.date), source: t(`market.sources.${v.sourceId}`, { defaultValue: v.sourceId }) });
}

/**
 * "Valores reales de hoy" (D-79, D-264): the real values that matter on a screen, each with its date
 * and its source, and the reminder that the money is fictitious and the future is a scenario. Without
 * a snapshot it says so and the screen keeps the example scenario.
 */
export function RealValues({ ids, className, intro }: { ids: MarketId[]; className?: string; intro?: string }) {
  const { t } = useTranslation();
  const market = useMarket();
  const asOf = useAsOf();
  const values = market.status === 'ready' ? ids.map((id) => market.byId[id]).filter((v): v is MarketValue => Boolean(v)) : [];
  const sourceIds = [...new Set(values.map((v) => v.sourceId))];

  return (
    <section aria-labelledby="real-values-title" className={cn('flex min-w-0 flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)', className)}>
      <div className="flex items-center gap-3">
        <span aria-hidden className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-info-container text-on-info-container">
          <Icon name="query_stats" size={20} />
        </span>
        <h2 id="real-values-title" className="text-title-medium text-on-surface">
          {t('market.title')}
        </h2>
      </div>
      <p className="text-body-medium text-on-surface-variant">{intro ?? t('market.intro')}</p>

      {market.status === 'loading' && <p className="text-body-medium text-on-surface-variant">{t('market.loading')}</p>}

      {(market.status === 'unavailable' || (market.status === 'ready' && values.length === 0)) && (
        <p className="flex items-start gap-2 rounded-lg bg-info-container p-3 text-body-medium text-on-info-container">
          <Icon name="info" size={20} className="mt-px shrink-0 text-info" />
          {t('market.unavailable')}
        </p>
      )}

      {values.length > 0 && (
        <ul className="grid-fill-3 grid gap-3">
          {values.map((v) => (
            <li key={v.id} className="flex min-w-0 flex-col gap-1 rounded-lg bg-surface-container p-3">
              <span className="text-label-medium text-on-surface-variant">{t(`market.labels.${v.id}`, { defaultValue: v.label })}</span>
              <span className="text-title-large text-on-surface tabular-nums">{formatMarketValue(v)}</span>
              <span className="text-body-small text-on-surface-variant">{asOf(v)}</span>
              {v.stale && (
                <span className="flex items-start gap-1 text-body-small text-on-surface-variant">
                  <Icon name="schedule" size={16} className="mt-px shrink-0" />
                  {t('market.stale')}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      <p className="text-body-small text-on-surface-variant">{t('market.scenarioNote')}</p>
      {sourceIds.length > 0 && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {sourceIds.map((id) => {
            const s = sourceById(id);
            return s ? (
              <li key={id}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-label-medium text-primary underline-offset-4 hover:underline">
                  {s.name}
                  <Icon name="open_in_new" size={16} />
                  <span className="sr-only">{t('landing.newTab')}</span>
                </a>
              </li>
            ) : null;
          })}
        </ul>
      )}
    </section>
  );
}

/**
 * "Usar el último dato real" under a field of a tool (D-264): fills the field with today's real value
 * and says where it comes from. The future stays a scenario the person can edit.
 */
export function UseRealValue({ id, onUse, used }: { id: MarketId; onUse: (percentText: string) => void; used?: boolean }) {
  const { t } = useTranslation();
  const market = useMarket();
  const asOf = useAsOf();
  const v = market.status === 'ready' ? market.byId[id] : undefined;
  if (!v || v.unit !== 'percent') return null;
  const percentText = formatNumber(D(v.value).times(100), 2).replace(/,?0+$/, '').replace(/,$/, '');
  return (
    <div className="flex flex-col items-start gap-0.5">
      <Button variant="text" size="xs" leadingIcon={used ? 'check' : 'query_stats'} className="-ml-2" onClick={() => onUse(percentText)}>
        {t('market.useReal', { value: formatMarketValue(v) })}
      </Button>
      <span className="text-body-small text-on-surface-variant">{asOf(v)}</span>
    </div>
  );
}
