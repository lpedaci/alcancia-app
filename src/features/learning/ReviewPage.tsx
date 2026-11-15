import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router';
import { DEMO_TODAY } from '@/app/config';
import { Button } from '@/components/ui/Button';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { toast } from '@/components/ui/toast-store';
import { fuerteLine } from '@/features/companion/fuerte-lines';
import { WalletShell } from '@/features/wallet/WalletShell';
import { drawReview, REVIEW_ROUNDS, type ReviewRound } from '@/lib/spaced-review';
import { useDataStore } from '@/store/data-store';
import { readLocal, writeLocal } from '@/store/local-store';
import { useCurrentUser } from '@/store/session-store';
import { type Answer, feedbackFor, isAnswered, isCorrect, moduleById } from './questions';
import { CheckButton, QuestionView } from './QuestionView';

/**
 * Spaced review (CLAUDE.md F19, D-273): 3 short questions of a module, 7 and 30 days after its guide.
 * Formative, like the practice in the guides: immediate feedback, unlimited retries and no score.
 * The review is saved only in this browser.
 */
export function ReviewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { moduleId = '' } = useParams();
  const user = useCurrentUser();
  const personId = user?.personId ?? '';
  const module = moduleById(moduleId);
  const guide = useDataStore((s) => s.guideProgress.find((g) => g.personId === personId && g.moduleId === moduleId && g.guideIdsDone.length > 0));
  const done = readLocal(personId).reviews ?? [];
  const round: ReviewRound | undefined = REVIEW_ROUNDS.find((r) => !done.some((d) => d.moduleId === moduleId && d.round === r));
  const questions = round ? drawReview(moduleId, round) : [];
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const shell = (children: React.ReactNode) => (
    <WalletShell section={t('wallet.nav.learn')} fuerte={{ state: 'thinking', message: fuerteLine('learn.review.fuerte') }}>
      <div className="flex flex-col gap-6">{children}</div>
    </WalletShell>
  );

  if (!module || !guide || !round || questions.length === 0) {
    return shell(
      <>
        <h1 className="text-headline-medium text-on-surface">{t('learn.review.titleShort')}</h1>
        <InlineAlert tone="info">{!guide ? t('learn.review.notYet') : t('learn.review.allDone')}</InlineAlert>
        <Button asChild variant="tonal" leadingIcon="arrow_back" className="self-start">
          <Link to="/app/learn">{t('learn.challenge.leaveToLearn')}</Link>
        </Button>
      </>,
    );
  }

  const question = questions[index]!;
  const answer = answers[question.id];
  const last = index === questions.length - 1;
  const finish = () => {
    writeLocal(personId, (d) => ({ ...d, reviews: [...(d.reviews ?? []), { moduleId, round, at: DEMO_TODAY }] }));
    toast.success(t('learn.review.saved'));
    navigate('/app/learn');
  };

  return shell(
    <>
      <header className="flex flex-col gap-2">
        <p className="text-label-large text-primary">{t('learn.review.eyebrow', { count: round })}</p>
        <h1 className="text-headline-medium text-on-surface">{t('learn.review.title', { n: module.order, title: module.title })}</h1>
        <p className="text-body-large text-on-surface-variant">{t('learn.review.intro', { count: round })}</p>
      </header>

      <section aria-labelledby="review-step" className="flex flex-col gap-5 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)">
        <p id="review-step" className="text-label-large text-on-surface-variant">
          {t('learn.review.step', { n: index + 1, total: questions.length })}
        </p>
        <QuestionView
          key={question.id}
          question={question}
          value={answer}
          onChange={(a) => {
            setAnswers((prev) => ({ ...prev, [question.id]: a }));
            setChecked((prev) => ({ ...prev, [question.id]: false }));
          }}
          idPrefix={`review-${round}`}
        />
        <CheckButton onClick={() => setChecked((prev) => ({ ...prev, [question.id]: true }))} disabled={!isAnswered(question, answer)} />
        <div aria-live="polite">
          {checked[question.id] && (
            <InlineAlert tone={isCorrect(question, answer) ? 'success' : 'info'}>
              {feedbackFor(question, answer)}
              {!isCorrect(question, answer) && <span className="block pt-1">{t('learn.guide.tryAgain')}</span>}
            </InlineAlert>
          )}
        </div>

        {/* Step navigation (D-250, D-266): leave on the left; previous and next together on the right */}
        <div className="flex flex-wrap items-center gap-3 border-t border-outline-variant pt-4">
          <Button asChild variant="text" leadingIcon="logout">
            <Link to="/app/learn">{t('learn.guide.exit')}</Link>
          </Button>
          <span className="flex-1" />
          {index > 0 && (
            <Button variant="text" leadingIcon="arrow_back" onClick={() => setIndex(index - 1)}>
              {t('learn.guide.back')}
            </Button>
          )}
          {last ? (
            <Button leadingIcon="check" onClick={finish} disabled={!checked[question.id]}>
              {t('learn.review.finish')}
            </Button>
          ) : (
            <Button trailingIcon="arrow_forward" onClick={() => setIndex(index + 1)} disabled={!checked[question.id]}>
              {t('learn.guide.next')}
            </Button>
          )}
        </div>
      </section>
    </>,
  );
}
