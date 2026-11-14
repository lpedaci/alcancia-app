import { Fragment, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { describeSources } from '@/app/content-sources';
import { Icon } from '@/components/ui/Icon';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import { findTerms, type GlossaryEntry, glossaryById } from './glossary';

/**
 * A glossary term as a chip (CLAUDE.md 1.1.1, RF-47, D-204): the word stays in the sentence and opens
 * its definition, with the full name and the official source. Keyboard: Enter or Space opens it,
 * Escape closes it and the focus returns to the chip (Radix Popover).
 */
export function GlossaryChip({ entry, children }: { entry: GlossaryEntry; children: ReactNode }) {
  const { t } = useTranslation();
  const sources = describeSources(entry.sourceIds);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t('glossary.open', { term: entry.term })}
          className="inline-flex items-baseline gap-0.5 rounded-sm bg-info-container px-1 text-on-info-container underline decoration-dotted underline-offset-4 hover:decoration-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {children}
          <Icon name="dictionary" size={16} className="self-center" />
        </button>
      </PopoverTrigger>
      <PopoverContent label={t('glossary.label', { term: entry.term })} align="start">
        <div className="flex flex-col gap-2">
          <p className="text-label-medium text-on-surface-variant">{t('glossary.chip')}</p>
          <p className="text-title-medium text-on-surface">
            {entry.term} · {entry.name}
          </p>
          <p className="text-body-medium text-on-surface">{entry.definition}</p>
          {sources.length > 0 && (
            <p className="text-body-small text-on-surface-variant">
              {t('glossary.source')}{' '}
              {sources.map((s, i) => (
                <Fragment key={s.key}>
                  {i > 0 && ' · '}
                  {s.url ? (
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
                      {s.name}
                    </a>
                  ) : (
                    s.name
                  )}
                </Fragment>
              ))}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Plain text where the given terms (ids) become chips at their first appearance in this text. */
export function GlossaryText({ text, terms }: { text: string; terms?: Set<string> }) {
  if (!terms || terms.size === 0) return <>{text}</>;
  const pending = new Set(terms);
  const parts: ReactNode[] = [];
  let last = 0;
  for (const { entry, index, length } of findTerms(text)) {
    if (!pending.has(entry.id)) continue;
    pending.delete(entry.id);
    parts.push(text.slice(last, index));
    parts.push(
      <GlossaryChip key={index} entry={glossaryById(entry.id) ?? entry}>
        {text.slice(index, index + length)}
      </GlossaryChip>,
    );
    last = index + length;
  }
  parts.push(text.slice(last));
  return <>{parts}</>;
}
