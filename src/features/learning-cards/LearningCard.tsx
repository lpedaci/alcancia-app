import { type ReactNode, useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { IconTile } from '@/components/ui/IconTile';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { Fuerte } from '@/features/companion/Fuerte';
import { SourceList } from '@/features/learning/SourceList';
import { cn } from '@/lib/utils';
import { type CardQuestion, type GuideLink, guideHref } from './cards';

/**
 * The content of a learning card (5.3, D-76), shared by the steps of a mission and the cards of the
 * free mode: concept, official source, an optional one-tap question with its explanation and the
 * exact part of the guide (D-78). The heading is given by the host (an h1 in a mission step, an h2
 * in the floating card).
 */
export function LearningCardContent({
  heading,
  body,
  sourceIds,
  question,
  guide,
  action,
  onAnswer,
  answered,
}: {
  heading: ReactNode;
  body: string;
  sourceIds?: string[];
  question?: CardQuestion;
  guide?: GuideLink;
  action?: { label: string; to: string };
  onAnswer?: (optionId: string, correct: boolean) => void;
  /** The option already chosen, when the host keeps it. */
  answered?: string;
}) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const groupId = useId();
  const [choice, setChoice] = useState<string | undefined>(answered);
  const right = question && choice === question.correct;

  return (
    <div className="flex min-w-0 flex-col gap-3">
      {heading}
      <p className="max-w-prose text-body-large text-on-surface">{body}</p>
      {question && (
        <div className="flex flex-col gap-2">
          <p id={groupId} className="text-title-small text-on-surface">
            {question.prompt}
          </p>
          {/* One tap (5.3): each option is a button; the explanation is announced right away */}
          <div role="group" aria-labelledby={groupId} className="flex flex-wrap gap-2">
            {question.options.map((option) => {
              const chosen = choice === option.id;
              return (
                <Button
                  key={option.id}
                  variant={chosen ? 'filled' : 'outlined'}
                  aria-pressed={chosen}
                  disabled={right && !chosen}
                  onClick={() => {
                    setChoice(option.id);
                    onAnswer?.(option.id, option.id === question.correct);
                  }}
                >
                  {option.text}
                </Button>
              );
            })}
          </div>
          <div aria-live="polite">
            {choice && (
              <InlineAlert tone={right ? 'success' : 'info'}>{right ? question.feedback.correct : question.feedback.incorrect}</InlineAlert>
            )}
          </div>
        </div>
      )}
      {(guide || action) && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {guide && (
            <Link to={guideHref(guide, pathname)} className="inline-flex min-h-12 items-center gap-1.5 text-label-large text-primary hover:underline md:min-h-6">
              <Icon name="menu_book" size={18} />
              {t('cards.toGuide')}
            </Link>
          )}
          {action && (
            <Link to={action.to} className="inline-flex min-h-12 items-center gap-1.5 text-label-large text-primary hover:underline md:min-h-6">
              <Icon name="arrow_forward" size={18} />
              {action.label}
            </Link>
          )}
        </div>
      )}
      {sourceIds && sourceIds.length > 0 && <SourceList codes={sourceIds} legal={false} />}
    </div>
  );
}

/**
 * The floating card of the free mode (D-76): it appears after an action, without blocking the screen.
 * The focus moves to it so keyboard and screen reader users find it; Escape or "Entendido" close it
 * and the focus goes back where it was. With Fuerte in "Silencio" it appears without the character.
 */
export function FloatingLearningCard({
  title,
  showFuerte,
  onClose,
  children,
}: {
  title: string;
  showFuerte: boolean;
  onClose: () => void;
  children: (headingId: string) => ReactNode;
}) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const headingId = useId();
  const returnTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    returnTo.current = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    return () => returnTo.current?.focus?.();
  }, []);

  return (
    <aside
      ref={ref}
      tabIndex={-1}
      aria-labelledby={headingId}
      data-learning-card
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
      className={cn(
        // Phones and tablets: under the top bar, so toasts and the bottom navigation stay free (2.7).
        'fixed inset-x-(--space-gutter) top-20 z-40 max-h-[calc(100dvh-10rem)] overflow-y-auto rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-elevation-2 focus:outline-none print:hidden',
        'medium:inset-x-auto medium:right-6 medium:w-[26rem] large:top-auto large:bottom-6 large:max-h-[calc(100dvh-3rem)]',
      )}
    >
      <div className="mb-2 flex items-start gap-3">
        {showFuerte ? <Fuerte state="thinking" size={3} className="shrink-0" /> : <IconTile icon="lightbulb" tone="tertiary" />}
        <div className="min-w-0 flex-1">
          <p className="text-label-medium text-on-surface-variant">{t('cards.kicker')}</p>
          <h2 id={headingId} className="text-title-medium text-on-surface">
            {title}
          </h2>
        </div>
        <IconButton icon="close" size="xs" label={t('cards.close')} onClick={onClose} />
      </div>
      {children(headingId)}
      <Button variant="tonal" leadingIcon="check" className="mt-3" onClick={onClose}>
        {t('cards.understood')}
      </Button>
    </aside>
  );
}
