import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router';
import { Icon } from '@/components/ui/Icon';
import { TextField } from '@/components/ui/TextField';
import { MODULES, guideOfModule } from '@/features/learning/questions';
import { SourceList } from '@/features/learning/SourceList';
import { WalletShell } from '@/features/wallet/WalletShell';
import { cn } from '@/lib/utils';
import { fold, GLOSSARY, searchGlossary } from './glossary';

/**
 * The full glossary (F10, step 34, D-321): every term with its definition, the module where it is
 * studied and its sources, with a search that ignores accents and case. The chips of the guides
 * explain a term in place; this page gathers them all. `?term=` opens on one term.
 */
export function GlossaryPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const focus = params.get('term') ?? '';
  const [query, setQuery] = useState('');
  const results = searchGlossary(query);
  const groups = new Map<string, typeof results>();
  for (const entry of results) {
    const letter = fold(entry.term).charAt(0).toUpperCase();
    groups.set(letter, [...(groups.get(letter) ?? []), entry]);
  }

  return (
    <WalletShell section={t('glossaryPage.title')} fuerte={{ state: 'neutral', message: t('glossaryPage.fuerte') }}>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-(--space-section)">
        <header className="flex flex-col gap-2">
          <Link to="/app/learn" className="flex w-fit items-center gap-1 text-label-large text-primary underline-offset-4 hover:underline">
            <Icon name="arrow_back" size={18} />
            {t('escape.backToLearn')}
          </Link>
          <h1 className="text-headline-medium text-on-surface">{t('glossaryPage.title')}</h1>
          <p className="max-w-prose text-body-large text-on-surface-variant">{t('glossaryPage.intro', { count: GLOSSARY.length })}</p>
        </header>
        <div className="flex flex-col gap-2">
          <TextField type="search" label={t('glossaryPage.search')} helperText={t('glossaryPage.searchHelp')} value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" />
          <p aria-live="polite" className="text-body-small text-on-surface-variant">
            {query.trim() ? t('glossaryPage.results', { count: results.length }) : ''}
          </p>
        </div>
        {results.length === 0 ? (
          <p className="text-body-large text-on-surface-variant">{t('glossaryPage.empty', { query })}</p>
        ) : (
          [...groups.entries()].map(([letter, entries]) => (
            <section key={letter} aria-labelledby={`letter-${letter}`} className="flex flex-col gap-3">
              <h2 id={`letter-${letter}`} className="text-title-large text-primary">
                {letter}
              </h2>
              <ul className="flex flex-col gap-3">
                {entries.map((g) => {
                  const module = MODULES.find((m) => m.id === g.moduleId);
                  const guide = g.moduleId ? guideOfModule(g.moduleId) : undefined;
                  return (
                    <li
                      key={g.id}
                      id={`term-${g.id}`}
                      className={cn(
                        'flex scroll-mt-24 flex-col gap-2 rounded-xl border bg-surface-container-lowest p-(--space-card-padding)',
                        focus === g.id ? 'border-primary ring-2 ring-primary ring-inset' : 'border-outline-variant',
                      )}
                    >
                      <h3 className="flex flex-wrap items-baseline gap-x-2 text-title-medium text-on-surface">
                        {g.term}
                        {g.name !== g.term && <span className="text-body-medium text-on-surface-variant">{g.name}</span>}
                      </h3>
                      <p className="max-w-prose text-body-large text-on-surface">{g.definition}</p>
                      {module && guide && (
                        <Link to={`/app/learn/guides/${guide.id}`} className="w-fit text-label-large text-primary underline-offset-4 hover:underline">
                          {t('glossaryPage.studied', { n: module.order, title: module.title })}
                        </Link>
                      )}
                      <SourceList codes={g.sourceIds} legal={false} />
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </div>
    </WalletShell>
  );
}
