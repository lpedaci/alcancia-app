import { Fragment, type ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import { DEMO_TODAY } from '@/app/config';
import { Button } from '@/components/ui/Button';
import { ChoiceGroup } from '@/components/ui/ChoiceGroup';
import { Icon } from '@/components/ui/Icon';
import { IconTile } from '@/components/ui/IconTile';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { UnlockCard } from '@/features/levels/UnlockCard';
import { LEVELS, useLevels } from '@/features/levels/use-levels';
import { NotFoundPage } from '@/features/system/NotFoundPage';
import { WalletShell } from '@/features/wallet/WalletShell';
import { useDataStore } from '@/store/data-store';
import { useCurrentUser } from '@/store/session-store';
import type { GuideProgress } from '@/types/domain';
import { CheckButton, QuestionView } from './QuestionView';
import { type Answer, feedbackFor, type Guide, type GuideBlock, guideById, isAnswered, isCorrect, moduleById } from './questions';

/**
 * P10, a guide (F3, 2.2.1 pattern 10): one short block per screen with progress on top, following
 * Gagné: situation, objective, what you already know, content, a worked example, practice with
 * immediate feedback and "Para tu vida". At the end, satisfaction from 1 to 5 (Kirkpatrick 1).
 */
export function GuidePage() {
  const { guideId = '' } = useParams();
  const guide = guideById(guideId);
  if (!guide) return <NotFoundPage />;
  return <GuideReader key={guide.id} guide={guide} />;
}

/** Bold text written as **this** in the content, without injecting HTML (8.2). */
function RichText({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="font-semibold text-on-surface">{part}</strong> : <Fragment key={i}>{part}</Fragment>))}
    </>
  );
}

function GuideReader({ guide }: { guide: Guide }) {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const personId = user?.personId ?? '';
  const { statuses, isOpen } = useLevels(personId);
  const markGuideDone = useDataStore((s) => s.markGuideDone);
  const alreadyDone = useDataStore((s) => s.guideProgress.some((g) => g.personId === personId && g.guideIdsDone.includes(guide.id)));
  const module = moduleById(guide.moduleId);
  const levelId = module?.levelId ?? '';
  const level = LEVELS.find((l) => l.id === levelId);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [satisfaction, setSatisfaction] = useState<string | undefined>();
  const [finished, setFinished] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, [index, finished]);

  const status = statuses.find((s) => s.level.id === levelId);
  if (status && !isOpen(levelId)) {
    return (
      <WalletShell section={t('wallet.nav.learn')} fuerte={{ state: 'thinking', message: t('learn.guide.fuerte') }}>
        <div className="flex max-w-3xl flex-col gap-6">
          <h1 className="text-headline-medium text-on-surface">{t('learn.guide.locked', { title: guide.title })}</h1>
          <UnlockCard status={status} />
        </div>
      </WalletShell>
    );
  }

  const total = guide.blocks.length;
  const block = guide.blocks[index]!;
  const isQuestion = block.type === 'recall' || block.type === 'practice';
  // Recall only needs an answer; practice needs to be checked once (feedback first, 5.1).
  const canGo = !isQuestion || checked[index];
  const last = index === total - 1;

  const finish = () => {
    markGuideDone(personId, guide.moduleId, guide.id, DEMO_TODAY, satisfaction ? (Number(satisfaction) as GuideProgress['satisfaction']) : undefined);
    setFinished(true);
  };

  const challengeId = level?.challengeId;

  return (
    <WalletShell section={t('wallet.nav.learn')} fuerte={{ state: finished ? 'celebration' : isQuestion ? 'thinking' : 'neutral', message: finished ? t('learn.guide.fuerteDone') : t('learn.guide.fuerte') }}>
      <div className="flex max-w-3xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <p className="flex flex-wrap items-center gap-x-2 text-label-large text-primary">
            <Icon name="menu_book" size={18} />
            {t('learn.guide.kicker', { module: module?.order, minutes: guide.minutes })}
          </p>
          {finished ? (
            <h1 ref={headingRef} tabIndex={-1} className="text-headline-medium text-on-surface focus:outline-none">
              {t('learn.guide.doneTitle')}
            </h1>
          ) : (
            <p className="text-title-large text-on-surface">{guide.title}</p>
          )}
          {!finished && (
            <ProgressBar value={((index + 1) / total) * 100} label={t('learn.guide.progress')} valueText={t('learn.guide.blockOf', { n: index + 1, total })} />
          )}
        </header>

        {finished ? (
          <section className="flex flex-col items-start gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)">
            <IconTile icon="task_alt" tone="tertiary" />
            <p className="text-body-large text-on-surface">{t('learn.guide.doneBody', { title: guide.title })}</p>
            <div className="flex flex-wrap gap-3">
              {challengeId && (
                <Button asChild trailingIcon="arrow_forward">
                  <Link to={`/app/learn/challenges/${challengeId}`}>{t('learn.guide.toChallenge', { level: level?.order })}</Link>
                </Button>
              )}
              <Button asChild variant="outlined" leadingIcon="school">
                <Link to="/app/learn">{t('learn.guide.backToLearn')}</Link>
              </Button>
            </div>
          </section>
        ) : (
          <section aria-labelledby="block-title" className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)">
            <Block
              block={block}
              headingRef={headingRef}
              answer={answers[index]}
              checked={checked[index] ?? false}
              onAnswer={(a) => {
                setAnswers((prev) => ({ ...prev, [index]: a }));
                setChecked((prev) => ({ ...prev, [index]: false }));
              }}
              onCheck={() => setChecked((prev) => ({ ...prev, [index]: true }))}
            />
            {last && (
              <ChoiceGroup
                legend={t('learn.guide.satisfaction')}
                helperText={t('learn.guide.satisfactionHelp')}
                layout="scale"
                value={satisfaction}
                onChange={setSatisfaction}
                choices={['1', '2', '3', '4', '5'].map((v) => ({ value: v, label: v }))}
              />
            )}
            <div className="flex flex-wrap items-center gap-3 border-t border-outline-variant pt-4">
              {last ? (
                <Button leadingIcon="task_alt" onClick={finish}>
                  {alreadyDone ? t('learn.guide.finishAgain') : t('learn.guide.finish')}
                </Button>
              ) : (
                <Button trailingIcon="arrow_forward" disabled={!canGo} onClick={() => setIndex(index + 1)}>
                  {t('learn.guide.next')}
                </Button>
              )}
              {index > 0 && (
                <Button variant="text" leadingIcon="arrow_back" onClick={() => setIndex(index - 1)}>
                  {t('learn.guide.back')}
                </Button>
              )}
            </div>
            {!canGo && <p className="text-body-small text-on-surface-variant">{t('learn.guide.answerFirst')}</p>}
          </section>
        )}
        <p className="text-body-small text-on-surface-variant">{t('learn.guide.sources', { ids: guide.sourceIds.join(', ') })}</p>
      </div>
    </WalletShell>
  );
}

/** The takeaway text without its "Para tu vida:" prefix, which is already the title. */
const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

function Block({
  block,
  headingRef,
  answer,
  checked,
  onAnswer,
  onCheck,
}: {
  block: GuideBlock;
  headingRef: React.RefObject<HTMLHeadingElement>;
  answer: Answer | undefined;
  checked: boolean;
  onAnswer: (a: Answer) => void;
  onCheck: () => void;
}) {
  const { t } = useTranslation();
  const title = (text: ReactNode) => (
    <h1 id="block-title" ref={headingRef} tabIndex={-1} className="text-headline-medium text-on-surface focus:outline-none">
      {text}
    </h1>
  );
  switch (block.type) {
    case 'hook':
      return (
        <>
          <IconTile icon="lightbulb" tone="tertiary" />
          {title(t('learn.guide.hook'))}
          <p className="max-w-prose text-body-large text-on-surface">{block.body}</p>
        </>
      );
    case 'objective':
      return (
        <>
          <IconTile icon="flag" tone="primary" />
          {title(t('learn.guide.objective'))}
          <p className="max-w-prose text-body-large text-on-surface">{block.body}</p>
        </>
      );
    case 'text':
      return (
        <>
          {title(block.title)}
          <p className="max-w-prose text-body-large text-on-surface-variant">
            <RichText text={block.body} />
          </p>
        </>
      );
    case 'example':
      return (
        <>
          {title(block.title)}
          <ol className="flex max-w-prose flex-col gap-3">
            {block.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span aria-hidden className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-container text-label-large text-on-primary-container tabular-nums">
                  {i + 1}
                </span>
                <span className="pt-0.5 text-body-large text-on-surface tabular-nums">{step}</span>
              </li>
            ))}
          </ol>
        </>
      );
    case 'takeaway':
      return (
        <>
          {title(t('learn.guide.takeaway'))}
          <div className="flex items-start gap-3 rounded-lg bg-tertiary-container p-4 text-on-tertiary-container">
            <Icon name="event_available" className="mt-0.5 shrink-0" />
            <p className="max-w-prose text-body-large">{capitalize(block.body.replace(/^Para tu vida:\s*/, ''))}</p>
          </div>
        </>
      );
    case 'recall':
    case 'practice': {
      const right = isCorrect(block.question, answer);
      return (
        <>
          {title(block.type === 'recall' ? t('learn.guide.recall') : t('learn.guide.practice'))}
          <QuestionView question={block.question} value={answer} onChange={onAnswer} idPrefix={block.type} />
          <CheckButton onClick={onCheck} disabled={!isAnswered(block.question, answer)} />
          <div aria-live="polite">
            {checked && (
              <InlineAlert tone={right || block.type === 'recall' ? 'success' : 'info'}>
                {feedbackFor(block.question, answer)}
                {!right && block.type === 'practice' && <span className="block pt-1">{t('learn.guide.tryAgain')}</span>}
              </InlineAlert>
            )}
          </div>
        </>
      );
    }
  }
}
