import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import { Icon } from '@/components/ui/Icon';
import { ListLinkRow } from '@/components/ui/ListLinkRow';
import { PrintButton } from '@/components/ui/PrintButton';
import { GLOSSARY } from '@/features/glossary/glossary';
import { NotFoundPage } from '@/features/system/NotFoundPage';
import { WalletShell } from '@/features/wallet/WalletShell';
import { guideOfModule, MODULES } from './questions';
import { SourceList } from './SourceList';

/**
 * The library (F10, step 34, D-321): a printable one-page summary of each module, built from its
 * first guide (objective, key ideas, worked example and "Para tu vida") and the glossary terms it
 * studies, with its sources. Printed or saved as a PDF with the browser; the wallet navigation is
 * hidden when printing and the "dinero ficticio" notice stays.
 */
export function LibraryPage() {
  const { t } = useTranslation();
  const modules = [...MODULES].sort((a, b) => a.order - b.order);
  return (
    <WalletShell section={t('library.title')} fuerte={{ state: 'neutral', message: t('library.fuerte') }}>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-(--space-section)">
        <header className="flex flex-col gap-2">
          <Link to="/app/learn" className="flex w-fit items-center gap-1 text-label-large text-primary underline-offset-4 hover:underline">
            <Icon name="arrow_back" size={18} />
            {t('escape.backToLearn')}
          </Link>
          <h1 className="text-headline-medium text-on-surface">{t('library.title')}</h1>
          <p className="max-w-prose text-body-large text-on-surface-variant">{t('library.intro')}</p>
        </header>
        <ul className="grid grid-cols-[minmax(0,1fr)] gap-2 medium:grid-cols-2">
          {modules.map((m) => (
            <li key={m.id}>
              <ListLinkRow to={`/app/learn/library/${m.id}`} icon="print" title={t('learn.challenge.module', { n: m.order, title: m.title })} detail={t('library.summary')} />
            </li>
          ))}
        </ul>
      </div>
    </WalletShell>
  );
}

export function ModuleSummaryPage() {
  const { moduleId = '' } = useParams();
  const { t } = useTranslation();
  const module = MODULES.find((m) => m.id === moduleId);
  const guide = guideOfModule(moduleId);
  if (!module || !guide) return <NotFoundPage />;
  const objective = guide.blocks.find((b) => b.type === 'objective');
  const texts = guide.blocks.filter((b) => b.type === 'text');
  const example = guide.blocks.find((b) => b.type === 'example');
  const takeaway = guide.blocks.find((b) => b.type === 'takeaway');
  const terms = GLOSSARY.filter((g) => g.moduleId === module.id);
  const sources = [...new Set([...guide.sourceIds, ...terms.flatMap((g) => g.sourceIds)])];
  const strip = (text: string) => text.replace(/\*\*/g, '');

  return (
    <WalletShell section={t('library.title')} fuerte={{ state: 'neutral', message: t('library.fuerte') }}>
      <article aria-labelledby="summary-title" className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <Link to="/app/learn/library" className="flex w-fit items-center gap-1 text-label-large text-primary underline-offset-4 hover:underline print:hidden">
            <Icon name="arrow_back" size={18} />
            {t('library.back')}
          </Link>
          <p className="text-label-large text-primary">{t('library.kicker', { n: module.order })}</p>
          <h1 id="summary-title" className="text-headline-medium text-on-surface">
            {module.title}
          </h1>
          {objective && objective.type === 'objective' && <p className="text-body-large text-on-surface">{objective.body}</p>}
        </header>
        <PrintButton label={t('library.print')} className="w-full medium:w-auto medium:self-start" />
        <section aria-labelledby="ideas-title" className="flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding) print:border-on-surface">
          <h2 id="ideas-title" className="text-title-large text-on-surface">
            {t('library.ideas')}
          </h2>
          <ul className="flex flex-col gap-3">
            {texts.map((b) =>
              b.type === 'text' ? (
                <li key={b.title} className="flex flex-col gap-1">
                  <span className="text-title-small text-on-surface">{b.title}</span>
                  <span className="text-body-medium text-on-surface-variant">{strip(b.body)}</span>
                </li>
              ) : null,
            )}
          </ul>
        </section>
        {example && example.type === 'example' && (
          <section aria-labelledby="example-title" className="flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding) print:border-on-surface">
            <h2 id="example-title" className="text-title-large text-on-surface">
              {/^ejemplo/i.test(example.title) ? example.title : t('library.example', { title: example.title })}
            </h2>
            <ol className="flex flex-col gap-2">
              {example.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span aria-hidden className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-container text-label-large text-on-primary-container tabular-nums">
                    {i + 1}
                  </span>
                  <span className="pt-0.5 text-body-medium text-on-surface tabular-nums">{step}</span>
                </li>
              ))}
            </ol>
          </section>
        )}
        {terms.length > 0 && (
          <section aria-labelledby="terms-title" className="flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding) print:border-on-surface">
            <h2 id="terms-title" className="text-title-large text-on-surface">
              {t('library.terms')}
            </h2>
            <dl className="flex flex-col gap-2">
              {terms.map((g) => (
                <div key={g.id} className="flex flex-col">
                  <dt className="text-title-small text-on-surface">{g.term}</dt>
                  <dd className="text-body-medium text-on-surface-variant">{g.definition}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
        {takeaway && takeaway.type === 'takeaway' && (
          <div className="flex items-start gap-3 rounded-lg bg-tertiary-container p-4 text-on-tertiary-container">
            <Icon name="event_available" className="mt-0.5 shrink-0" />
            <p className="text-body-large">{takeaway.body}</p>
          </div>
        )}
        <SourceList codes={sources} legal />
        <p className="text-body-small text-on-surface-variant">{t('library.footer')}</p>
      </article>
    </WalletShell>
  );
}
