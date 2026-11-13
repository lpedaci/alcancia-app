import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import { DEMO_TODAY } from '@/app/config';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { IconTile } from '@/components/ui/IconTile';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatusPill } from '@/components/ui/StatusPill';
import { LEVEL_ROUTE, UnlockCard } from '@/features/levels/UnlockCard';
import { LEVELS, useLevels } from '@/features/levels/use-levels';
import { NotFoundPage } from '@/features/system/NotFoundPage';
import { WalletShell } from '@/features/wallet/WalletShell';
import { NBSP } from '@/lib/money';
import { cn } from '@/lib/utils';
import { useDataStore } from '@/store/data-store';
import { useCurrentUser } from '@/store/session-store';
import { QuestionView } from './QuestionView';
import {
  type Answer,
  type AttemptScore,
  type ChallengeDef,
  challengeById,
  drawChallenge,
  feedbackFor,
  isAnswered,
  isCorrect,
  type LearningQuestion,
  moduleById,
  scoreAttempt,
  startingOrder,
} from './questions';

/**
 * P11, a level challenge or a mastery challenge ("Ya sé esto", D-57, 5.1): questions drawn from the
 * banks of the level's modules, one per screen, no time limit (WCAG 2.2.1). The best attempt counts
 * for passing; the first one shows what the person knew. When the attempts run out nothing is
 * lost: the unlock goes to the tutor.
 */
export function ChallengePage() {
  const { challengeId = '' } = useParams();
  const challenge = challengeById(challengeId);
  if (!challenge) return <NotFoundPage />;
  return <ChallengeRunner key={challenge.id} challenge={challenge} />;
}

const pct = (n: number) => `${Math.round(n * 100)}${NBSP}%`;

function ChallengeRunner({ challenge }: { challenge: ChallengeDef }) {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const personId = user?.personId ?? '';
  const { statuses, isOpen } = useLevels(personId);
  const maxAttempts = useDataStore((s) => s.program.maxAttempts);
  const passing = useDataStore((s) => s.program.passingScore ?? challenge.passingScore);
  const allAttempts = useDataStore((s) => s.challengeAttempts);
  const attempts = allAttempts.filter((a) => a.personId === personId && a.challengeId === challenge.id);
  const addAttempt = useDataStore((s) => s.addChallengeAttempt);
  const level = LEVELS.find((l) => l.id === challenge.levelId)!;
  const status = statuses.find((s) => s.level.id === level.id);
  const section = t(`wallet.sections.${level.id}`);

  const [questions, setQuestions] = useState<LearningQuestion[] | undefined>();
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<AttemptScore | undefined>();
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, [index, questions, result]);

  const best = attempts.reduce((m, a) => Math.max(m, a.score), 0);
  const passed = attempts.length > 0 && best >= passing;
  const remaining = Math.max(0, maxAttempts - attempts.length);
  const title = challenge.mastery ? t('learn.challenge.masteryTitle', { section }) : t('learn.challenge.title', { level: level.order, section });

  // A level challenge is taken inside its level; a mastery challenge is the way in (5.0).
  if (!challenge.mastery && status && !isOpen(level.id)) {
    return (
      <WalletShell section={t('wallet.nav.learn')} fuerte={{ state: 'thinking', message: t('learn.challenge.fuerte') }}>
        <div className="flex max-w-3xl flex-col gap-6">
          <h1 className="text-headline-medium text-on-surface">{t('learn.challenge.locked', { title })}</h1>
          <UnlockCard status={status} />
        </div>
      </WalletShell>
    );
  }

  const start = () => {
    const drawn = drawChallenge(challenge);
    const initial: Record<string, Answer> = {};
    for (const q of drawn) if (q.type === 'ordering') initial[q.id] = startingOrder(q);
    setQuestions(drawn);
    setAnswers(initial);
    setIndex(0);
    setResult(undefined);
  };

  const submit = () => {
    if (!questions) return;
    const score = scoreAttempt(questions, answers);
    addAttempt({
      personId,
      challengeId: challenge.id,
      number: attempts.length + 1,
      score: score.score,
      moduleScores: score.moduleScores,
      startedAt: `${DEMO_TODAY}T09:00:00.000Z`,
      finishedAt: `${DEMO_TODAY}T09:10:00.000Z`,
    }, questions.map((q) => ({
      personId,
      challengeId: challenge.id,
      questionId: q.id,
      correct: isCorrect(q, answers[q.id]),
      ...(q.type === 'single' && typeof answers[q.id] === 'string' ? { optionIds: [answers[q.id] as string] } : {}),
    })));
    setResult(score);
  };

  const fuerteMessage = result ? (result.score >= passing ? t('learn.challenge.fuertePassed') : t('learn.challenge.fuerteRetry')) : t('learn.challenge.fuerte');

  return (
    <WalletShell section={t('wallet.nav.learn')} fuerte={{ state: result ? (result.score >= passing ? 'celebration' : 'thinking') : 'neutral', message: fuerteMessage }}>
      <div className="flex max-w-3xl flex-col gap-6">
        {/* ---------- Intro ---------- */}
        {!questions && (
          <>
            <header className="flex flex-col gap-2">
              <p className="flex items-center gap-2 text-label-large text-primary">
                <Icon name="quiz" size={18} />
                {challenge.mastery ? t('learn.challenge.masteryKicker') : t('learn.challenge.kicker')}
              </p>
              <h1 ref={headingRef} tabIndex={-1} className="text-headline-medium text-on-surface focus:outline-none">
                {title}
              </h1>
              <p className="text-body-large text-on-surface-variant">
                {challenge.mastery ? t('learn.challenge.masteryIntro', { section }) : t('learn.challenge.intro')}
              </p>
            </header>
            <section className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)">
              <ul className="flex flex-col gap-3">
                {[
                  ['quiz', t('learn.challenge.rule.questions', { count: Object.values(challenge.questionsPerModule).reduce((a, b) => a + b, 0) })],
                  ['flag', t('learn.challenge.rule.passing', { score: pct(passing) })],
                  ['military_tech', t('learn.challenge.rule.best')],
                  ['schedule', t('learn.challenge.rule.time')],
                  ['replay', t('learn.challenge.rule.attempts', { used: attempts.length, max: maxAttempts })],
                ].map(([icon, text]) => (
                  <li key={text} className="flex items-start gap-3 text-body-large text-on-surface">
                    <Icon name={icon as 'quiz'} size={20} className="mt-0.5 shrink-0 text-primary" />
                    {text}
                  </li>
                ))}
              </ul>
              {attempts.length > 0 && (
                <p className="flex flex-wrap items-center gap-2 text-body-medium text-on-surface">
                  {t('learn.challenge.best', { score: pct(best) })}
                  <StatusPill tone={passed ? 'success' : 'info'} icon={passed ? 'check_circle' : 'pending'} label={passed ? t('learn.challenge.passed') : t('learn.challenge.notYet')} />
                </p>
              )}
              {remaining === 0 && !passed ? (
                <InlineAlert tone="info">{t('learn.challenge.exhausted')}</InlineAlert>
              ) : (
                <Button className="self-start" leadingIcon={attempts.length ? 'replay' : 'play_arrow'} onClick={start} disabled={remaining === 0}>
                  {attempts.length ? t('learn.challenge.again') : t('learn.challenge.start')}
                </Button>
              )}
              {remaining === 0 && passed && <p className="text-body-small text-on-surface-variant">{t('learn.challenge.noMore')}</p>}
            </section>
          </>
        )}

        {/* ---------- Questions ---------- */}
        {questions && !result && (
          <>
            <header className="flex flex-col gap-2">
              <p className="text-label-large text-primary">{title}</p>
              <ProgressBar
                value={((index + 1) / questions.length) * 100}
                label={t('learn.challenge.progress')}
                valueText={t('learn.challenge.of', { n: index + 1, total: questions.length })}
              />
            </header>
            <section aria-labelledby="question-title" className="flex flex-col gap-5 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)">
              <h1 id="question-title" ref={headingRef} tabIndex={-1} className="text-headline-medium text-on-surface focus:outline-none">
                {t('learn.challenge.question', { n: index + 1 })}
              </h1>
              <QuestionView
                key={questions[index]!.id}
                question={questions[index]!}
                value={answers[questions[index]!.id]}
                onChange={(a) => setAnswers((prev) => ({ ...prev, [questions[index]!.id]: a }))}
                idPrefix="challenge"
              />
              <div className="flex flex-wrap items-center gap-3 border-t border-outline-variant pt-4">
                {index < questions.length - 1 ? (
                  <Button trailingIcon="arrow_forward" disabled={!isAnswered(questions[index]!, answers[questions[index]!.id])} onClick={() => setIndex(index + 1)}>
                    {t('learn.challenge.next')}
                  </Button>
                ) : (
                  <Button leadingIcon="task_alt" disabled={!questions.every((q) => isAnswered(q, answers[q.id]))} onClick={submit}>
                    {t('learn.challenge.submit')}
                  </Button>
                )}
                {index > 0 && (
                  <Button variant="text" leadingIcon="arrow_back" onClick={() => setIndex(index - 1)}>
                    {t('learn.challenge.back')}
                  </Button>
                )}
              </div>
              <p className="text-body-small text-on-surface-variant">{t('learn.challenge.noTimer')}</p>
            </section>
          </>
        )}

        {/* ---------- Result ---------- */}
        {questions && result && (
          <>
            <header className="flex flex-col gap-2">
              <p className="text-label-large text-primary">{title}</p>
              <h1 ref={headingRef} tabIndex={-1} className="text-headline-medium text-on-surface focus:outline-none">
                {result.score >= passing ? t('learn.challenge.resultPassed') : t('learn.challenge.resultRetry')}
              </h1>
            </header>
            <section className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)" aria-live="polite">
              <div className="flex flex-wrap items-center gap-4">
                <IconTile icon={result.score >= passing ? 'military_tech' : 'school'} tone={result.score >= passing ? 'tertiary' : 'primary'} />
                <p className="text-display-small text-on-surface tabular-nums">{pct(result.score)}</p>
                <p className="text-body-large text-on-surface-variant">{t('learn.challenge.right', { right: result.right, total: result.total })}</p>
              </div>
              <p className="text-body-large text-on-surface">
                {result.score >= passing
                  ? challenge.mastery
                    ? t('learn.challenge.masteryPassedBody', { section })
                    : t('learn.challenge.passedBody', { score: pct(passing) })
                  : remaining > 0
                    ? t('learn.challenge.retryBody', { score: pct(passing), count: remaining })
                    : t('learn.challenge.exhausted')}
              </p>
              <ul className="flex flex-col gap-2" aria-label={t('learn.challenge.byModule')}>
                {Object.entries(result.moduleScores).map(([moduleId, score]) => {
                  const badge = score >= passing;
                  return (
                    <li key={moduleId} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface-container px-4 py-3">
                      <span className="text-title-small text-on-surface">{t('learn.challenge.module', { n: moduleById(moduleId)?.order, title: moduleById(moduleId)?.title })}</span>
                      <span className="flex items-center gap-2">
                        <span className="text-label-large text-on-surface tabular-nums">{pct(score)}</span>
                        {badge && <StatusPill tone="success" icon="military_tech" label={t('learn.challenge.badge')} />}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <div className="flex flex-wrap gap-3">
                {result.score >= passing ? (
                  <Button asChild trailingIcon="arrow_forward">
                    <Link to={LEVEL_ROUTE[level.id] ?? '/app/learn'}>{t('learn.challenge.goSection', { section })}</Link>
                  </Button>
                ) : (
                  remaining > 0 && (
                    <Button leadingIcon="replay" onClick={start}>
                      {t('learn.challenge.again')}
                    </Button>
                  )
                )}
                <Button asChild variant="outlined" leadingIcon="school">
                  <Link to="/app/learn">{t('learn.guide.backToLearn')}</Link>
                </Button>
              </div>
            </section>
            <section aria-labelledby="review-title" className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)">
              <h2 id="review-title" className="text-title-large text-on-surface">
                {t('learn.challenge.review')}
              </h2>
              <ol className="flex flex-col gap-3">
                {questions.map((q, i) => {
                  const ok = isCorrect(q, answers[q.id]);
                  return (
                    <li key={q.id} className={cn('flex flex-col gap-1 rounded-lg px-4 py-3', ok ? 'bg-success-container text-on-success-container' : 'bg-info-container text-on-info-container')}>
                      <p className="flex items-start gap-2 text-title-small">
                        <Icon name={ok ? 'check_circle' : 'info'} size={20} className={cn('mt-0.5 shrink-0', ok ? 'text-success' : 'text-info')} />
                        <span>
                          <span className="sr-only">{ok ? t('welcome.result.right') : t('welcome.result.toReview')}: </span>
                          {i + 1}. {q.prompt}
                        </span>
                      </p>
                      <p className="pl-7 text-body-medium">{feedbackFor(q, answers[q.id])}</p>
                    </li>
                  );
                })}
              </ol>
            </section>
          </>
        )}
      </div>
    </WalletShell>
  );
}
