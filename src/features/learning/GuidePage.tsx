import { AnimatePresence, motion } from 'motion/react';
import { Fragment, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
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
import { duration, easing, useShouldReduceMotion } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { useDataStore } from '@/store/data-store';
import { useCurrentUser } from '@/store/session-store';
import type { GuideProgress } from '@/types/domain';
import { CheckButton, QuestionView } from './QuestionView';
import { SourceList } from './SourceList';
import { AskTutorForm } from './Tutoring';
import { distributeTerms, introducedTerms } from '@/features/glossary/glossary';
import { GlossaryText } from '@/features/glossary/GlossaryText';
import { type Answer, feedbackFor, type Guide, type GuideBlock, guideById, isAnswered, isCorrect, moduleById } from './questions';
import { fuerteLine } from '@/features/companion/fuerte-lines';

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
function RichText({ text, terms }: { text: string; terms?: Set<string> }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  const termsOf = distributeTerms(parts, terms);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-on-surface">
            <GlossaryText text={part} terms={termsOf[i]} />
          </strong>
        ) : (
          <Fragment key={i}>
            <GlossaryText text={part} terms={termsOf[i]} />
          </Fragment>
        ),
      )}
    </>
  );
}

/** The plain text of a block, to find where each glossary term appears first (1.1.1, D-204). */
function blockText(block: GuideBlock): string {
  switch (block.type) {
    case 'hook':
    case 'objective':
    case 'takeaway':
      return block.body;
    case 'text':
      return block.body;
    case 'example':
      return block.steps.join(' ');
    default:
      return '';
  }
}

function GuideReader({ guide }: { guide: Guide }) {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const personId = user?.personId ?? '';
  const { statuses, isOpen } = useLevels(personId);
  const markGuideDone = useDataStore((s) => s.markGuideDone);
  const alreadyDone = useDataStore((s) => s.guideProgress.some((g) => g.personId === personId && g.guideIdsDone.includes(guide.id)));
  const module = moduleById(guide.moduleId);
  // Glossary chips at each term's first appearance in the guide (1.1.1, D-204).
  const newTerms = useMemo(() => introducedTerms(guide.blocks.map(blockText)), [guide]);
  const levelId = module?.levelId ?? '';
  const level = LEVELS.find((l) => l.id === levelId);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [satisfaction, setSatisfaction] = useState<string | undefined>();
  const [finished, setFinished] = useState(false);
  const [visited, setVisited] = useState(0);
  const [direction, setDirection] = useState(1);
  const reduce = useShouldReduceMotion();
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, [index, finished]);

  const status = statuses.find((s) => s.level.id === levelId);
  if (status && !isOpen(levelId)) {
    return (
      <WalletShell section={t('wallet.nav.learn')} fuerte={{ state: 'thinking', message: fuerteLine('learn.guide.fuerte') }}>
        <div className="flex flex-col gap-6">
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

  const go = (to: number) => {
    setDirection(to > index ? 1 : -1);
    setIndex(to);
    setVisited((v) => Math.max(v, to));
  };
  const objective = guide.blocks.find((b) => b.type === 'objective');
  const slide = reduce ? 0 : 32;

  return (
    <WalletShell section={t('wallet.nav.learn')} fuerte={{ state: finished ? 'celebration' : isQuestion ? 'thinking' : 'neutral', message: finished ? fuerteLine('learn.guide.fuerteDone') : fuerteLine('learn.guide.fuerte') }}>
      {/* A guide panel (D-172): the reading on the left, the outline of the guide on the right from 1200 px */}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 large:grid-cols-[minmax(0,1fr)_22rem] large:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          <header className="flex flex-col gap-3">
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
            <motion.section
              initial={{ opacity: 0, scale: reduce ? 1 : 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: duration.long, ease: easing.emphasizedDecelerate }}
              className="flex flex-col items-start gap-5 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)"
            >
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
            </motion.section>
          ) : (
            <section aria-labelledby="block-title" className="flex flex-col gap-6 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)">
              {/* Steps slide sideways (2.6, flows by steps); with reduced motion only opacity */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: direction * slide }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -direction * slide }}
                  transition={{ duration: duration.medium, ease: easing.standard }}
                  className="flex flex-col gap-5"
                >
                  <Block
                    block={block}
                    terms={newTerms[index]}
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
                </motion.div>
              </AnimatePresence>
              <div className="flex flex-wrap items-center gap-3 border-t border-outline-variant pt-5">
                {last ? (
                  <Button leadingIcon="task_alt" onClick={finish}>
                    {alreadyDone ? t('learn.guide.finishAgain') : t('learn.guide.finish')}
                  </Button>
                ) : (
                  <Button trailingIcon="arrow_forward" disabled={!canGo} onClick={() => go(index + 1)}>
                    {t('learn.guide.next')}
                  </Button>
                )}
                {index > 0 && (
                  <Button variant="text" leadingIcon="arrow_back" onClick={() => go(index - 1)}>
                    {t('learn.guide.back')}
                  </Button>
                )}
                {!canGo && <p className="basis-full text-body-small text-on-surface-variant">{t('learn.guide.answerFirst')}</p>}
              </div>
            </section>
          )}
        </div>

        {/* Outline of the guide: where you are, what you read, and its objective, length and sources */}
        <aside aria-labelledby="outline-title" className="flex flex-col gap-5 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)">
          <div className="flex flex-col gap-1">
            <h2 id="outline-title" className="text-title-large text-on-surface">
              {t('learn.guide.outline')}
            </h2>
            <p className="text-body-small text-on-surface-variant">{t('learn.guide.outlineMeta', { parts: total, minutes: guide.minutes })}</p>
          </div>
          {objective && objective.type === 'objective' && (
            <div className="flex items-start gap-3 rounded-lg bg-primary-container p-3 text-on-primary-container">
              <Icon name="flag" size={20} className="mt-0.5 shrink-0" />
              <p className="text-body-medium">{objective.body}</p>
            </div>
          )}
          <ol className="flex flex-col gap-1">
            {guide.blocks.map((b, i) => {
              const current = !finished && i === index;
              const done = finished || (i <= visited && !current);
              const reachable = !finished && i <= visited;
              const label = outlineLabel(b, t);
              const content = (
                <>
                  <span
                    aria-hidden
                    className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-full text-label-medium tabular-nums transition-colors duration-200',
                      current ? 'bg-primary text-on-primary' : done ? 'bg-success-container text-success' : 'bg-surface-container text-on-surface-variant',
                    )}
                  >
                    {done ? <Icon name="check" size={16} /> : i + 1}
                  </span>
                  <span className={cn('min-w-0 flex-1', current ? 'text-title-small text-on-surface' : 'text-body-medium text-on-surface-variant')}>{label}</span>
                </>
              );
              return (
                <li key={i}>
                  {reachable && !current ? (
                    <button type="button" onClick={() => go(i)} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-surface-container">
                      {content}
                      <span className="sr-only">{t('learn.guide.goTo')}</span>
                    </button>
                  ) : (
                    <span aria-current={current ? 'step' : undefined} className={cn('flex items-center gap-3 rounded-lg px-2 py-2', current && 'bg-surface-container')}>
                      {content}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
          <SourceList
            className="border-t border-outline-variant pt-4"
            codes={[...guide.sourceIds, ...guide.blocks.flatMap((b) => (b.type === 'recall' || b.type === 'practice' ? b.question.sourceIds : []))]}
          />
          <AskAboutGuide personId={personId} moduleId={guide.moduleId} />
        </aside>
      </div>
    </WalletShell>
  );
}

/** Name of each part in the outline: the Gagne step or the title of the block. */
function outlineLabel(block: GuideBlock, t: (key: string) => string): string {
  if (block.type === 'text' || block.type === 'example') return block.title;
  return t(`learn.guide.${block.type}`);
}

/** The takeaway text without its "Para tu vida:" prefix, which is already the title. */
const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

function Block({
  block,
  terms,
  headingRef,
  answer,
  checked,
  onAnswer,
  onCheck,
}: {
  block: GuideBlock;
  /** Glossary terms that appear for the first time in this block (D-204). */
  terms?: Set<string>;
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
          <p className="text-body-large text-on-surface">
            <GlossaryText text={block.body} terms={terms} />
          </p>
        </>
      );
    case 'objective':
      return (
        <>
          <IconTile icon="flag" tone="primary" />
          {title(t('learn.guide.objective'))}
          <p className="text-body-large text-on-surface">
            <GlossaryText text={block.body} terms={terms} />
          </p>
        </>
      );
    case 'text':
      return (
        <>
          {title(block.title)}
          <p className="text-body-large text-on-surface-variant">
            <RichText text={block.body} terms={terms} />
          </p>
        </>
      );
    case 'example': {
      const stepTerms = distributeTerms(block.steps, terms);
      return (
        <>
          {title(block.title)}
          <ol className="flex flex-col gap-3">
            {block.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span aria-hidden className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-container text-label-large text-on-primary-container tabular-nums">
                  {i + 1}
                </span>
                <span className="pt-0.5 text-body-large text-on-surface tabular-nums">
                  <GlossaryText text={step} terms={stepTerms[i]} />
                </span>
              </li>
            ))}
          </ol>
        </>
      );
    }
    case 'takeaway':
      return (
        <>
          {title(t('learn.guide.takeaway'))}
          <div className="flex items-start gap-3 rounded-lg bg-tertiary-container p-4 text-on-tertiary-container">
            <Icon name="event_available" className="mt-0.5 shrink-0" />
            <p className="text-body-large">
              <GlossaryText text={capitalize(block.body.replace(/^Para tu vida:\s*/, ''))} terms={terms} />
            </p>
          </div>
          {block.toolId && (
            <Button asChild variant="tonal" leadingIcon="calculate" className="self-start">
              <Link to={`/app/tools/${block.toolId}`}>{t('learn.guide.openTool', { name: block.toolId === 'SIM-3' ? t('sim3.title') : t(`sims.${block.toolId}.title`) })}</Link>
            </Button>
          )}
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

/** F6: a question to the tutor about this guide's module, collapsed until asked for (D-202). */
function AskAboutGuide({ personId, moduleId }: { personId: string; moduleId: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-3 border-t border-outline-variant pt-4">
      <h3 className="text-title-small text-on-surface">{t('learn.ask.guideTitle')}</h3>
      <p className="text-body-small text-on-surface-variant">{t('learn.ask.guideIntro')}</p>
      {open ? (
        <AskTutorForm personId={personId} moduleId={moduleId} />
      ) : (
        <Button variant="tonal" leadingIcon="forum" className="self-start" onClick={() => setOpen(true)}>
          {t('learn.ask.open')}
        </Button>
      )}
    </div>
  );
}
