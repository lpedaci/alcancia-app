import { type FormEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import { DEMO_TODAY } from '@/app/config';
import { MoneyInput } from '@/components/money/MoneyInput';
import { MoneyText } from '@/components/money/MoneyText';
import { Button } from '@/components/ui/Button';
import { SourceList } from '@/features/learning/SourceList';
import { Icon, type IconName } from '@/components/ui/Icon';
import { IconTile } from '@/components/ui/IconTile';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { Select } from '@/components/ui/Select';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { UnlockCard } from '@/features/levels/UnlockCard';
import { useLevels } from '@/features/levels/use-levels';
import { WalletSectionPage } from '@/features/wallet/WalletSectionPage';
import { WalletShell } from '@/features/wallet/WalletShell';
import { pocketsTotal } from '@/features/wallet/engine/engine';
import { useDataStore } from '@/store/data-store';
import { readLocal, writeLocal } from '@/store/local-store';
import { readWallet } from '@/store/wallet-store';
import { useCurrentUser } from '@/store/session-store';
import { useWallet } from '@/store/wallet-store';
import {
  answerStep,
  canContinue,
  criteriaStatus,
  currentStep,
  type Feedback,
  fillText,
  finishMission,
  isOwnRun,
  isPlayable,
  type MissionDef,
  type MissionRun,
  type MissionStep,
  missionById,
  nextStep,
  previousStep,
  startMission,
  walletAfter,
} from './engine';
import { fuerteLine } from '@/features/companion/fuerte-lines';
import { emptyRecord, recordCard } from '@/features/learning-cards/cards';
import { LearningCardContent } from '@/features/learning-cards/LearningCard';

/**
 * P12, a mission (CLAUDE.md 5.3, flows.md 2.3): objective, steps with progress, feedback that
 * explains and a summary with the success criteria. The run is saved in the person's browser, so
 * "Salir" keeps the step. Missions whose steps are not written yet keep the placeholder page.
 */
export function MissionPage() {
  const { missionId = '' } = useParams();
  const def = missionById(missionId);
  if (!isPlayable(def)) return <WalletSectionPage area="mission" />;
  return <MissionRunner key={def.id} def={def} />;
}

/** Steps that happen to the person (events) run as soon as they are reached. */
function enter(def: MissionDef, run: MissionRun): MissionRun {
  const step = currentStep(def, run);
  return step?.kind === 'event' && !run.results[step.id]?.done ? answerStep(def, run).run : run;
}

function MissionRunner({ def }: { def: MissionDef & { steps: MissionStep[] } }) {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const personId = user?.personId ?? '';
  const { statuses, isOpen, wallet } = useLevels(personId);
  const [, setWallet] = useWallet(personId);
  const recordMission = useDataStore((s) => s.recordMission);
  const done = wallet.completedMissionIds.includes(def.id);

  // D-208: a run in the person's wallet resumes with the wallet as it is now (she may have used it meanwhile).
  const [run, setRun] = useState<MissionRun | undefined>(() => {
    const saved = readLocal(personId).missionRuns?.[def.id];
    return saved && isOwnRun(saved) && !saved.finished ? { ...saved, wallet: readWallet(personId) } : saved;
  });
  const [feedback, setFeedback] = useState<Feedback | undefined>();
  const headingRef = useRef<HTMLHeadingElement>(null);

  const save = (next: MissionRun | undefined) => {
    setRun(next);
    // In the person's wallet every step is kept as it happens, like any other action (D-77, D-208).
    if (next && isOwnRun(next) && !next.finished) setWallet(() => next.wallet);
    writeLocal(personId, (d) => {
      const runs = { ...(d.missionRuns ?? {}) };
      if (next) runs[def.id] = next;
      else delete runs[def.id];
      return { ...d, missionRuns: runs };
    });
  };

  // The focus goes to the step title when the step changes (2.10).
  const stepIndex = run?.step;
  useEffect(() => {
    if (stepIndex !== undefined) headingRef.current?.focus();
  }, [stepIndex]);

  const level = statuses.find((s) => s.level.id === def.levelId);
  const fuerteDefault = fuerteLine('wallet.mission.fuerte');

  if (level && !isOpen(def.levelId)) {
    return (
      <WalletShell section={t('wallet.nav.learn')} fuerte={{ state: 'thinking', message: fuerteDefault }}>
        <div className="flex max-w-3xl flex-col gap-6">
          <h1 className="text-headline-medium text-on-surface">{t('wallet.mission.lockedTitle', { title: def.title })}</h1>
          <UnlockCard status={level} />
        </div>
      </WalletShell>
    );
  }

  const begin = () => {
    setFeedback(undefined);
    save(enter(def, startMission(def, wallet, { replay: done, profile: readLocal(personId).investorProfile })));
  };

  // ---------- Start screen ----------
  if (!run) {
    return (
      <WalletShell section={t('wallet.nav.learn')} fuerte={{ state: 'greeting', message: fuerteDefault }}>
        <div className="flex flex-col gap-6">
          <MissionHeader def={def} />
          <section aria-labelledby="mission-plan" className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)">
            <h2 id="mission-plan" className="text-title-large text-on-surface">
              {t('wallet.mission.plan')}
            </h2>
            <ul className="flex flex-col gap-2">
              {(def.criteria ?? []).map((c) => (
                <li key={c.id} className="flex items-start gap-2 text-body-large text-on-surface">
                  <Icon name="flag" size={20} className="mt-0.5 shrink-0 text-primary" />
                  {c.description}
                </li>
              ))}
            </ul>
            <p className="text-body-medium text-on-surface-variant">
              {def.practiceOnly ? t('wallet.mission.practiceOnlyNote') : done ? t('wallet.mission.replayNote') : t('wallet.mission.ownNote')}
            </p>
            {done && <InlineAlert tone="success">{t('wallet.mission.alreadyDone')}</InlineAlert>}
            <Button className="self-end" leadingIcon={done ? 'replay' : 'play_arrow'} onClick={begin}>
              {done ? t('wallet.mission.replay') : t('wallet.mission.start')}
            </Button>
          </section>
        </div>
      </WalletShell>
    );
  }

  const step = currentStep(def, run)!;
  const result = run.results[step.id];
  const total = def.steps.length;

  const answer = (input?: string) => {
    const answered = answerStep(def, run, input);
    // D-214: in a practice scenario the wallet does not change; the decision is kept as a learning
    // event in the person's browser (never shared, D-58).
    const current = currentStep(def, run);
    if (def.practiceOnly && current?.kind === 'decision' && input && !answered.error) {
      writeLocal(personId, (d) => ({ ...d, learningEvents: [...(d.learningEvents ?? []), { verb: 'decided', object: `${def.id}/${current.id}`, response: input, day: readWallet(personId).day }] }));
    }
    save(answered.run);
    setFeedback(answered.error ? { tone: 'info', text: t(`wallet.mission.errors.${answered.error}`, { defaultValue: t('wallet.mission.errors.generic') }) } : answered.feedback);
  };
  const goNext = () => {
    setFeedback(undefined);
    save(enter(def, nextStep(def, run)));
  };
  const goBack = () => {
    setFeedback(undefined);
    save(previousStep(run));
  };
  const complete = () => {
    const finished = finishMission(def, run);
    if (!finished.finished) return;
    save(finished);
    // D-208: in the person's wallet everything was kept step by step; a practice copy is never kept.
    setWallet((current) => walletAfter(def, finished, current));
    recordMission(personId, def.id, DEMO_TODAY);
  };

  const fuerteMessage = run.finished ? fuerteLine('wallet.mission.fuerteDone') : (step.fuerte ? fillText(step.fuerte, run) : fuerteDefault);

  return (
    <WalletShell section={t('wallet.nav.learn')} fuerte={{ state: run.finished ? 'celebration' : step.kind === 'single' ? 'thinking' : 'neutral', message: fuerteMessage }}>
      {/* Mission layout (D-250): the mission on top at full width; below, the step leads and a side column
          keeps the progress, the wallet and the practice notice in sight (one column below 1200 px). */}
      <div className="flex flex-col gap-6">
        <MissionHeader def={def} compact />
        <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-(--space-bento-gap) large:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <aside aria-label={t('wallet.mission.progress')} className="flex min-w-0 flex-col gap-4 large:sticky large:top-24 large:order-2">
            <div className="flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)">
              <p className="text-label-large text-on-surface">{t('wallet.mission.progress')}</p>
              <ProgressBar
                value={Math.round(((run.finished ? total : run.step) / total) * 100)}
                label={t('wallet.mission.progress')}
                valueText={t('wallet.mission.stepOf', { step: Math.min(run.step + 1, total), total })}
              />
              {/* Only when the mission moves money: a mission about messages has nothing to show here */}
              {(isOwnRun(run) || run.wallet.movements.length > 0) && <PracticeWallet run={run} fresh={!isOwnRun(run)} />}
            </div>
            {/* D-208: a practice copy is labelled during the whole mission */}
            {!isOwnRun(run) && (
              <InlineAlert tone="info" title={t('wallet.mission.practiceBannerTitle')}>
                {run.portfolio === 'own' ? t('wallet.mission.scenarioOwn') : run.portfolio === 'example' ? t('wallet.mission.scenarioExample') : t('wallet.mission.practiceBanner')}
              </InlineAlert>
            )}
          </aside>

        <section aria-labelledby="step-title" className="flex min-w-0 flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding) large:order-1">
          <StepBody
            key={run.step}
            def={def}
            run={run}
            step={step}
            headingRef={headingRef}
            onAnswer={answer}
            onComplete={complete}
            onReplay={begin}
          />

          {/* Feedback is announced (2.10); a wrong answer is information, never an error (2.2.1, 11). */}
          <div aria-live="polite">{feedback && <InlineAlert tone={feedback.tone} title={feedback.reflect ? t('wallet.mission.reflectTitle') : undefined}>{feedback.text}</InlineAlert>}</div>

          {/* Step navigation (D-250): leaving on the left; going back and forward together on the right, forward last */}
          <div className="flex flex-wrap items-center gap-3 border-t border-outline-variant pt-4">
            <Button asChild variant="text" leadingIcon="logout">
              <Link to="/app">{run.finished ? t('wallet.placeholder.backHome') : t('wallet.mission.exit')}</Link>
            </Button>
            <span className="flex-1" />
            {run.step > 0 && !run.finished && (
              <Button variant="text" leadingIcon="arrow_back" onClick={goBack}>
                {t('wallet.mission.back')}
              </Button>
            )}
            {step.kind !== 'summary' && (
              <Button onClick={goNext} disabled={!canContinue(def, run)} trailingIcon="arrow_forward">
                {t('wallet.mission.next')}
              </Button>
            )}
          </div>
          {!result?.done && step.kind !== 'summary' && step.kind !== 'card' && (
            <p className="text-body-small text-on-surface-variant large:text-right">{t('wallet.mission.nextHint')}</p>
          )}
        </section>
        </div>
      </div>
    </WalletShell>
  );
}

function MissionHeader({ def, compact = false }: { def: MissionDef; compact?: boolean }) {
  const { t } = useTranslation();
  return (
    <header className="flex flex-col gap-2">
      <p className="flex items-center gap-2 text-label-large text-primary">
        <Icon name="flag" size={18} />
        {t('wallet.mission.kicker', { minutes: def.minutes })}
      </p>
      {compact ? (
        <p className="text-headline-small text-on-surface">{def.title}</p>
      ) : (
        <h1 className="text-headline-medium text-on-surface">{def.title}</h1>
      )}
      {/* The objective as Gagné's second event (F3): "Al terminar vas a poder…", set apart with its icon (D-250) */}
      <div className="mt-2 flex items-start gap-3 rounded-lg bg-tertiary-container/40 px-4 py-3">
        <IconTile icon="target" tone="tertiary" size="sm" />
        <p className="min-w-0 text-body-large text-on-surface">
          <span className="block text-label-large text-on-tertiary-container">{t('wallet.mission.objectiveLead')}</span>
          {def.objective.charAt(0).toLowerCase() + def.objective.slice(1)}
        </p>
      </div>
    </header>
  );
}

/** The practice balance of the mission, so each action shows its effect (5.3). */
function PracticeWallet({ run, fresh }: { run: MissionRun; fresh: boolean }) {
  const { t } = useTranslation();
  const pockets = pocketsTotal(run.wallet);
  return (
    <div className="flex flex-col gap-2 border-t border-outline-variant pt-3" aria-live="polite">
      <span className="flex items-center gap-2 text-label-medium text-on-surface-variant">
        <Icon name="account_balance_wallet" size={18} className="text-primary" />
        {fresh ? t('wallet.mission.freshWallet') : t('wallet.mission.yourWallet')}
      </span>
      <dl className="flex flex-col gap-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
          <dt className="text-body-medium text-on-surface-variant">{t('wallet.mission.balance').replace(/:$/, '')}</dt>
          <dd><MoneyText value={run.wallet.balance} className="text-title-small tabular-nums" /></dd>
        </div>
        {pockets.gt(0) && (
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <dt className="text-body-medium text-on-surface-variant">{t('wallet.mission.pockets').replace(/:$/, '')}</dt>
            <dd><MoneyText value={pockets.toFixed(2)} className="text-title-small tabular-nums" /></dd>
          </div>
        )}
      </dl>
    </div>
  );
}

function Sources({ ids }: { ids?: string[] }) {
  if (!ids?.length) return null;
  return <SourceList codes={ids} legal={false} variant="footer" />;
}

function StepBody({
  def,
  run,
  step,
  headingRef,
  onAnswer,
  onComplete,
  onReplay,
}: {
  def: MissionDef;
  run: MissionRun;
  step: MissionStep;
  headingRef: React.RefObject<HTMLHeadingElement>;
  onAnswer: (input?: string) => void;
  onComplete: () => void;
  onReplay: () => void;
}) {
  const { t } = useTranslation();
  const result = run.results[step.id];
  const [choice, setChoice] = useState<string>(result?.answer ?? '');
  const [amount, setAmount] = useState('');
  const [tried, setTried] = useState(false);
  const [classified, setClassified] = useState<Record<string, string>>({});
  /** Question-like steps (D-250): the kind of step as a small heading with its icon; the question itself leads. */
  const kicker = (icon: IconName, text: string) => (
    <h1 id="step-title" ref={headingRef} tabIndex={-1} className="flex items-center gap-2 text-label-large text-primary focus:outline-none">
      <Icon name={icon} size={18} />
      {text}
    </h1>
  );

  switch (step.kind) {
    case 'card':
    case 'event':
      return (
        <>
          {/* Same layout as the question steps (D-250): the kind of step as a small label, the title, the text,
              the action on the right and the sources at the foot */}
          <p className="flex items-center gap-2 text-label-large text-primary">
            <Icon name={step.kind === 'event' ? 'notifications' : 'lightbulb'} size={18} />
            {step.kind === 'event' ? t('wallet.mission.eventKicker') : t('wallet.mission.cardKicker')}
          </p>
          {/* The same card content as the free mode (D-76): missions and free mode share component and record */}
          <LearningCardContent
            heading={
              <h1 id="step-title" ref={headingRef} tabIndex={-1} className="text-title-large text-on-surface focus:outline-none">
                {step.title}
              </h1>
            }
            body={fillText(step.body, run)}
          />
          {step.kind === 'card' && !result?.done && (
            <Button
              variant="tonal"
              className="self-end"
              leadingIcon="check"
              onClick={() => {
                const personId = run.wallet.personId;
                writeLocal(personId, (d) => ({ ...d, learningCards: recordCard(d.learningCards ?? emptyRecord(), `${def.id}:${step.id}`) }));
                onAnswer();
              }}
            >
              {t('wallet.mission.understood')}
            </Button>
          )}
          <Sources ids={step.sourceIds} />
        </>
      );
    case 'action':
      return (
        <>
          {kicker('touch_app', t('wallet.mission.actionTitle'))}
          <p className="text-title-large text-on-surface">{fillText(step.instruction, run)}</p>
          {!result?.done && (
            <Button className="self-end" leadingIcon="touch_app" onClick={() => onAnswer()}>
              {step.button}
            </Button>
          )}
        </>
      );
    case 'single':
    case 'decision': {
      // A decision in the person's wallet is final (D-77): it is reverted in the simulation, not here.
      const locked = (step.kind === 'single' && result?.correct) || (step.kind === 'decision' && isOwnRun(run) && result?.done);
      const submit = (event: FormEvent) => {
        event.preventDefault();
        setTried(true);
        if (choice) onAnswer(choice);
      };
      return (
        <form noValidate onSubmit={submit} className="flex flex-col gap-4">
          {kicker(step.kind === 'single' ? 'help' : 'route', step.kind === 'single' && step.title ? step.title : step.kind === 'single' ? t('wallet.mission.questionTitle') : t('wallet.mission.decisionTitle'))}
          {step.kind === 'single' && step.body && <p className="text-body-large text-on-surface-variant">{fillText(step.body, run)}</p>}
          <RadioGroup
            name={`${def.id}-${step.id}`}
            legend={fillText(step.prompt, run)}
            legendClassName="mb-3 text-title-large"
            variant="cards"
            required
            disabled={locked}
            error={tried && !choice ? t('wallet.mission.choose') : undefined}
            options={step.options.map((o) => ({ value: o.id, label: fillText(o.text, run) }))}
            value={choice}
            onChange={(e) => setChoice(e.target.value)}
          />
          {step.kind === 'decision' && locked && <p className="text-body-medium text-on-surface-variant">{t('wallet.mission.decisionFinal')}</p>}
          {!locked && (
            <Button type="submit" variant={result?.done ? 'outlined' : 'filled'} className="self-end" leadingIcon="check">
              {step.kind === 'decision' && result?.done ? t('wallet.mission.change') : t('wallet.mission.answer')}
            </Button>
          )}
          <Sources ids={step.sourceIds} />
        </form>
      );
    }
    case 'numeric': {
      const submit = (event: FormEvent) => {
        event.preventDefault();
        setTried(true);
        if (amount.trim()) onAnswer(amount);
      };
      return (
        <form noValidate onSubmit={submit} className="flex flex-col gap-4">
          {kicker('calculate', t('wallet.mission.calcTitle'))}
          <MoneyInput
            label={fillText(step.prompt, run)}
            helperText={step.help}
            required
            disabled={result?.correct}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={tried && !amount.trim() ? t('wallet.mission.amountMissing') : undefined}
          />
          {!result?.correct && (
            <Button type="submit" className="self-end" leadingIcon="calculate">
              {t('wallet.mission.check')}
            </Button>
          )}
          <Sources ids={step.sourceIds} />
        </form>
      );
    }
    case 'classify': {
      // One select per item: the accessible alternative to dragging into columns (5.1, 2.10)
      const answer = (() => {
        try {
          return result?.answer ? (JSON.parse(result.answer) as Record<string, string>) : {};
        } catch {
          return {};
        }
      })();
      const [current, setCurrent] = [classified, setClassified];
      const values = { ...answer, ...current };
      const complete = step.items.every((i) => values[i.id]);
      const submit = (event: FormEvent) => {
        event.preventDefault();
        setTried(true);
        if (complete) onAnswer(JSON.stringify(values));
      };
      return (
        <form noValidate onSubmit={submit} className="flex flex-col gap-4">
          {kicker('checklist', t('wallet.mission.classifyTitle'))}
          <fieldset className="flex flex-col gap-3" disabled={result?.correct}>
            <legend className="mb-3 text-title-large text-on-surface">{fillText(step.prompt, run)}</legend>
            {step.items.map((item) => (
              <Select
                key={item.id}
                label={item.text}
                helperText={t('wallet.mission.classifyHelp')}
                value={values[item.id] ?? ''}
                error={tried && !values[item.id] ? t('wallet.mission.choose') : undefined}
                onChange={(e) => setCurrent((prev) => ({ ...prev, [item.id]: e.target.value }))}
                options={[{ value: '', label: t('learn.q.choose') }, ...step.categories.map((c) => ({ value: c.id, label: c.label }))]}
              />
            ))}
          </fieldset>
          {!result?.correct && (
            <Button type="submit" className="self-end" leadingIcon="check">
              {t('wallet.mission.answer')}
            </Button>
          )}
          <Sources ids={step.sourceIds} />
        </form>
      );
    }
    case 'summary': {
      const status = criteriaStatus(def, run);
      const allMet = status.every((s) => s.met);
      return (
        <>
          {kicker(run.finished ? 'task_alt' : 'fact_check', run.finished ? t('wallet.mission.doneTitle') : t('wallet.mission.summaryTitle'))}
          <ul className="flex flex-col gap-2" aria-label={t('wallet.mission.criteria')}>
            {status.map(({ criterion, met }) => (
              <li key={criterion.id} className="flex items-start gap-2 text-body-large text-on-surface">
                <Icon name={met ? 'check_circle' : 'radio_button_unchecked'} size={20} filled={met} className={met ? 'mt-0.5 shrink-0 text-success' : 'mt-0.5 shrink-0 text-on-surface-variant'} />
                <span>
                  {criterion.description}
                  <span className="sr-only">: {met ? t('wallet.mission.met') : t('wallet.mission.notMet')}</span>
                </span>
              </li>
            ))}
          </ul>
          {run.finished ? (
            <>
              <p className="text-body-large text-on-surface">{t('wallet.mission.doneBody')}</p>
              <Button variant="outlined" className="self-end" leadingIcon="replay" onClick={onReplay}>
                {t('wallet.mission.replay')}
              </Button>
            </>
          ) : allMet ? (
            <Button className="self-end" leadingIcon="task_alt" onClick={onComplete}>
              {t('wallet.mission.complete')}
            </Button>
          ) : (
            <p className="text-body-medium text-on-surface-variant">{t('wallet.mission.missing')}</p>
          )}
        </>
      );
    }
  }
}
