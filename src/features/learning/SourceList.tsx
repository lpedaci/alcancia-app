import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { describeSources } from '@/app/content-sources';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';
import { SOURCE_KIND_ICON } from './source-kinds';

/**
 * "Fuentes" of a guide, a mission step or a section (D-187): short chips ("Taller", "BCRA",
 * "Cálculo F-14") with the full name for screen readers, that open Aprender > Fuentes focused on
 * that source.
 *
 * - `panel` (guides, mission steps, "¿Por qué importa?"): title, chips and the link to all sources.
 * - `footer` (bottom of a section page): a quiet strip that shows the sources exist without
 *   competing with the content: a `surface-container-high` block (one step darker than the page),
 *   the `fact_check` icon and the title in primary, smaller white chips,
 *   "Ver todas" at the end of the same line and the page's legal notice below.
 */
export function SourceList({
  codes,
  className,
  legal = true,
  variant = 'panel',
  legalText,
}: {
  codes: string[] | undefined;
  className?: string;
  legal?: boolean;
  variant?: 'panel' | 'footer';
  /** Footer only: the legal notice of the page, shown under the sources. */
  legalText?: string;
}) {
  const { t } = useTranslation();
  const sources = describeSources(codes ?? []);
  if (sources.length === 0) return null;
  const footer = variant === 'footer';

  const chips = sources.map((s) => (
    <li key={s.key}>
      <Link
        to={`/app/learn/sources?focus=${encodeURIComponent(s.key)}`}
        title={s.name}
        className={cn(
          'inline-flex items-center gap-1 rounded-full border border-outline-variant bg-surface-container-lowest text-on-surface hover:border-primary hover:text-primary',
          footer ? 'min-h-6 px-2 text-label-small' : 'min-h-7 px-2.5 py-0.5 text-label-medium',
        )}
      >
        <Icon name={SOURCE_KIND_ICON[s.kind]} size={16} className="shrink-0 text-on-surface-variant" />
        {s.short}
        {/* The full name, for screen readers: the accessible name keeps the visible label first (WCAG 2.5.3) */}
        <span className="sr-only">{t('learn.sources.chipLabel', { name: s.name })}</span>
      </Link>
    </li>
  ));

  if (footer) {
    return (
      <footer
        aria-label={t('learn.sources.title')}
        className={cn('flex flex-col gap-2 rounded-xl bg-surface-container-high px-4 py-3 text-body-small text-on-surface-variant', className)}
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <p className="inline-flex items-center gap-1.5 text-label-large text-primary">
            <Icon name="fact_check" size={16} className="shrink-0" />
            {t('learn.sources.title')}
          </p>
          <ul className="flex flex-wrap gap-1.5">{chips}</ul>
          <Link to="/app/learn/sources" className="text-label-medium text-primary underline-offset-4 hover:underline">
            {t('learn.sources.allShort')}
          </Link>
        </div>
        {legalText && <p>{legalText}</p>}
      </footer>
    );
  }

  return (
    <div className={cn('flex flex-col gap-2 text-body-small text-on-surface-variant', className)}>
      <p className="inline-flex items-center gap-1.5 text-title-small text-on-surface">
        <Icon name="fact_check" size={18} className="shrink-0 text-on-surface-variant" />
        {t('learn.sources.title')}
      </p>
      <ul className="flex flex-wrap gap-2">{chips}</ul>
      <Link to="/app/learn/sources" className="w-fit text-label-large text-primary underline-offset-4 hover:underline">
        {t('learn.sources.all')}
      </Link>
      {legal && <p className="border-t border-outline-variant pt-2">{t('learn.sources.legal')}</p>}
    </div>
  );
}
