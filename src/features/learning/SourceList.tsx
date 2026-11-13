import { useTranslation } from 'react-i18next';
import { type ContentSource, describeSources } from '@/app/content-sources';
import { Icon, type IconName } from '@/components/ui/Icon';
import { StatusPill } from '@/components/ui/StatusPill';
import { formatDate } from '@/lib/dates';
import { cn } from '@/lib/utils';

const KIND_ICON: Record<ContentSource['kind'], IconName> = {
  workshop: 'school',
  presentation: 'menu_book',
  official: 'account_balance',
  formula: 'calculate',
};

/**
 * "Fuentes" of a guide or a mission step, with full names (review of 13/11/2026): each one with a
 * chip of its kind (workshop, presentation, official source, hand-checked calculation), its name
 * (a link when it has one) and, for official sources, the verification date in a success chip.
 * External links open safely (8.2).
 */
export function SourceList({ codes, className, legal = true }: { codes: string[] | undefined; className?: string; legal?: boolean }) {
  const { t } = useTranslation();
  const sources = describeSources(codes ?? []);
  if (sources.length === 0) return null;
  return (
    <div className={cn('flex flex-col gap-3 text-body-small text-on-surface-variant', className)}>
      <p className="text-title-small text-on-surface">{t('learn.sources.title')}</p>
      <ul className="flex flex-col gap-3">
        {sources.map((s) => (
          <li key={s.key} className="flex flex-col items-start gap-1.5">
            <StatusPill tone="neutral" icon={KIND_ICON[s.kind]} label={t(`learn.sources.kind.${s.kind}`)} />
            {s.url ? (
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-body-small text-primary underline underline-offset-2">
                {s.name}
                <Icon name="open_in_new" size={16} className="ml-0.5 inline align-[-3px]" />
                <span className="sr-only"> {t('learn.sources.newTab')}</span>
              </a>
            ) : (
              <span className="text-body-small text-on-surface">{s.name}</span>
            )}
            {s.verifiedAt && <StatusPill tone="success" icon="check_circle" label={t('learn.sources.verified', { date: formatDate(s.verifiedAt) })} />}
          </li>
        ))}
      </ul>
      {legal && <p className="border-t border-outline-variant pt-3">{t('learn.sources.legal')}</p>}
    </div>
  );
}
