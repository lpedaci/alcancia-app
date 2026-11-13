import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router';
import { allOfficialSources, type ContentSource, FORMULAS_URL, WORKSHOP_URL } from '@/app/content-sources';
import { Icon } from '@/components/ui/Icon';
import { IconTile } from '@/components/ui/IconTile';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { StatusPill } from '@/components/ui/StatusPill';
import { WalletShell } from '@/features/wallet/WalletShell';
import { formatDate } from '@/lib/dates';
import { cn } from '@/lib/utils';
import { SOURCE_KIND_ICON } from './source-kinds';

/**
 * Aprender > Fuentes (pedido de Lourdes, D-187): every source of the content in one place, with its
 * full name, its link and, for official sources, the date it was checked. The compact chips of
 * guides, missions and sections open this page focused on their source (`?focus=`).
 */
const card = 'flex min-w-0 flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)';

function SourceRow({ source, focused }: { source: ContentSource & { body?: string }; focused: boolean }) {
  const { t } = useTranslation();
  const ref = useRef<HTMLLIElement>(null);
  useEffect(() => {
    if (focused) ref.current?.scrollIntoView({ block: 'center' });
  }, [focused]);
  return (
    <li ref={ref} className={cn('flex items-start gap-3 rounded-lg p-3', focused ? 'bg-primary-container text-on-primary-container' : '')} aria-current={focused ? 'true' : undefined}>
      <Icon name={SOURCE_KIND_ICON[source.kind]} className="mt-0.5 shrink-0 text-primary" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {source.url ? (
          <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-body-medium text-primary underline underline-offset-2">
            {source.name}
            <Icon name="open_in_new" size={16} className="ml-0.5 inline align-[-3px]" />
            <span className="sr-only"> {t('learn.sources.newTab')}</span>
          </a>
        ) : (
          <span className="text-body-medium text-on-surface">{source.name}</span>
        )}
        {source.body && <p className="text-body-small text-on-surface-variant">{source.body}</p>}
        {source.verifiedAt && <StatusPill tone="success" icon="check_circle" label={t('learn.sources.verified', { date: formatDate(source.verifiedAt) })} className="self-start" />}
      </div>
    </li>
  );
}

export function SourcesPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const focus = params.get('focus') ?? '';
  const official = allOfficialSources();
  const base: (ContentSource & { body: string })[] = [
    { key: 'T', kind: 'workshop', short: '', name: t('learn.sources.page.workshop'), url: WORKSHOP_URL, body: t('learn.sources.page.workshopBody') },
    { key: 'A', kind: 'presentation', short: '', name: t('learn.sources.page.presentation'), body: t('learn.sources.page.presentationBody') },
  ];
  const formula: ContentSource & { body: string } = { key: 'F', kind: 'formula', short: '', name: t('learn.sources.page.formulas'), url: FORMULAS_URL, body: t('learn.sources.page.formulasBody') };

  return (
    <WalletShell section={t('wallet.nav.learn')} fuerte={{ state: 'neutral', message: t('learn.sources.page.fuerte') }}>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-headline-medium text-on-surface">{t('learn.sources.page.title')}</h1>
          <p className="text-body-large text-on-surface-variant">{t('learn.sources.page.intro')}</p>
        </header>
        {/* Bento: the short cards next to the base content on top; the long list of official sources below, full width (D-187) */}
        <div className="grid grid-cols-[minmax(0,1fr)] gap-(--space-bento-gap) large:grid-cols-2 large:items-stretch">
          <section aria-labelledby="base-title" className={card}>
            <div className="flex items-center gap-3">
              <IconTile icon="school" tone="tertiary" />
              <h2 id="base-title" className="text-title-large text-on-surface">
                {t('learn.sources.page.baseTitle')}
              </h2>
            </div>
            <ul className="flex flex-col gap-1">
              {base.map((s) => (
                <SourceRow key={s.key} source={s} focused={focus === s.key} />
              ))}
            </ul>
            <InlineAlert tone="info" live="none">
              {t('learn.sources.page.extensions')}
            </InlineAlert>
          </section>
          <div className="flex min-w-0 flex-col gap-(--space-bento-gap)">
            <section aria-labelledby="formulas-title" className={card}>
              <div className="flex items-center gap-3">
                <IconTile icon="calculate" tone="secondary" />
                <h2 id="formulas-title" className="text-title-large text-on-surface">
                  {t('learn.sources.page.formulasTitle')}
                </h2>
              </div>
              <ul className="flex flex-col gap-1">
                <SourceRow source={formula} focused={focus === 'F'} />
              </ul>
            </section>
            <section aria-labelledby="sheets-title" className={cn(card, 'flex-1')}>
              <div className="flex items-center gap-3">
                <IconTile icon="description" tone="secondary" />
                <h2 id="sheets-title" className="text-title-large text-on-surface">
                  {t('learn.sources.page.sheetsTitle')}
                </h2>
              </div>
              <p className="text-body-medium text-on-surface-variant">{t('learn.sources.page.sheetsBody')}</p>
              <Link to="/app/invest" className="w-fit text-label-large text-primary underline-offset-4 hover:underline">
                {t('learn.sources.page.brokers')}
              </Link>
            </section>
          </div>
          <section aria-labelledby="official-title" className={cn(card, '@container large:col-span-2')}>
            <div className="flex items-center gap-3">
              <IconTile icon="account_balance" tone="primary" />
              <h2 id="official-title" className="text-title-large text-on-surface">
                {t('learn.sources.page.officialTitle')}
              </h2>
            </div>
            <p className="text-body-medium text-on-surface-variant">{t('learn.sources.page.officialBody')}</p>
            <ul className="grid grid-cols-[minmax(0,1fr)] gap-1 @2xl:grid-cols-2 @5xl:grid-cols-3">
              {official.map((s) => (
                <SourceRow key={s.key} source={s} focused={focus === s.key} />
              ))}
            </ul>
          </section>
        </div>
        <p className="text-body-small text-on-surface-variant">{t('learn.sources.legal')}</p>
      </div>
    </WalletShell>
  );
}
