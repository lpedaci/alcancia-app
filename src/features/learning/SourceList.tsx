import { useTranslation } from 'react-i18next';
import { describeSources } from '@/app/content-sources';
import { Icon } from '@/components/ui/Icon';
import { formatDate } from '@/lib/dates';
import { cn } from '@/lib/utils';

/**
 * "Fuentes" of a guide or a mission step, with full names (review of 13/11/2026): the workshop with
 * its link, the presentation of Lic. Kevin Giampieri with its slides, each official source with its
 * verification date and the hand-checked formula cases. External links open safely (8.2).
 */
export function SourceList({ codes, className, legal = true }: { codes: string[] | undefined; className?: string; legal?: boolean }) {
  const { t } = useTranslation();
  const sources = describeSources(codes ?? []);
  if (sources.length === 0) return null;
  return (
    <div className={cn('flex flex-col gap-1 text-body-small text-on-surface-variant', className)}>
      <p className="text-label-medium text-on-surface">{t('learn.sources.title')}</p>
      <ul className="flex flex-col gap-1">
        {sources.map((s) => (
          <li key={s.key}>
            {s.url ? (
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
                {s.name}
                <Icon name="open_in_new" size={16} className="ml-0.5 inline align-[-3px]" />
                <span className="sr-only"> {t('learn.sources.newTab')}</span>
              </a>
            ) : (
              s.name
            )}
            {s.verifiedAt && <span> · {t('learn.sources.verified', { date: formatDate(s.verifiedAt) })}</span>}
          </li>
        ))}
      </ul>
      {legal && <p>{t('learn.sources.legal')}</p>}
    </div>
  );
}
