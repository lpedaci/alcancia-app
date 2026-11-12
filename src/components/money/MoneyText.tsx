import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui/Icon';
import { type Currency, type DecimalLike, formatCompactMoney, formatMoney } from '@/lib/money';
import { cn } from '@/lib/utils';
import Decimal from 'decimal.js';

export interface MoneyTextProps {
  value: DecimalLike;
  currency?: Currency;
  decimals?: number;
  /**
   * Gains and losses (2.1.1): never only green and red. With `trend`, the amount gets a sign,
   * a trend icon and an accessible word ("aumento", "disminución").
   */
  trend?: boolean;
  /**
   * Long amounts never get cut (2.7). Below this container width the compact form ("$ 12,3 M")
   * is shown instead; the full value stays in the accessible name and in the title.
   * Needs an ancestor with `@container`.
   */
  compactBelow?: 'xs' | 'sm' | 'md';
  className?: string;
}

const COMPACT_SWAP = {
  xs: { full: 'hidden @xs:inline', compact: 'inline @xs:hidden' },
  sm: { full: 'hidden @sm:inline', compact: 'inline @sm:hidden' },
  md: { full: 'hidden @md:inline', compact: 'inline @md:hidden' },
} as const;

/** The one way to print money in the interface: tabular figures, Argentine format, no wrapping. */
export function MoneyText({ value, currency = 'ARS', decimals = 2, trend = false, compactBelow, className }: MoneyTextProps) {
  const { t } = useTranslation();
  const d = new Decimal(value instanceof Decimal ? value : value.toString());
  const full = formatMoney(d, { currency, decimals, sign: trend ? 'always' : 'auto' });
  const direction = d.isZero() ? 'flat' : d.isNegative() ? 'down' : 'up';
  const trendWord = trend ? t(`money.trend.${direction}`) : '';
  const accessible = trend ? `${full}, ${trendWord}` : full;
  // Only abbreviate when the compact form is really shorter (one million or more).
  const canCompact = compactBelow && d.abs().gte(1e6);

  return (
    <span className={cn('relative inline-flex items-center gap-1 whitespace-nowrap tabular-nums', className)} title={canCompact ? full : undefined}>
      {trend && (
        <Icon
          name={direction === 'up' ? 'trending_up' : direction === 'down' ? 'trending_down' : 'trending_flat'}
          size={18}
        />
      )}
      {canCompact ? (
        <>
          <span className="sr-only">{accessible}</span>
          <span aria-hidden className={COMPACT_SWAP[compactBelow!].full}>
            {full}
          </span>
          <span aria-hidden className={COMPACT_SWAP[compactBelow!].compact}>
            {formatCompactMoney(d, { currency })}
          </span>
        </>
      ) : (
        <>
          <span>{full}</span>
          {trend && <span className="sr-only">, {trendWord}</span>}
        </>
      )}
    </span>
  );
}
