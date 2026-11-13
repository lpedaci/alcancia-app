import { type FormEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import { DEMO_TODAY } from '@/app/config';
import { MoneyInput } from '@/components/money/MoneyInput';
import { MoneyText } from '@/components/money/MoneyText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
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

  const [run, setRun] = useState<MissionRun | undefined>(() => readLocal(personId).missionRuns?.[def.id]);
  const [feedback, setFeedback] = useState<Feedback | undefined>();
  const headingRef = useRef<HTMLHeadingElement>(null);

  const save = (next: MissionRun | undefined) => {
    setRun(next);
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
  const fuerteDefault = t('wallet.mission.fuerte');

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
    save(enter(def, startMission(def, wallet)));
  };

  // ---------- Start screen ----------
  if (!run) {
    return (
      <WalletShell section={t('wallet.nav.learn')} fuerte={{ state: 'greeting', message: fuerteDefault }}>
        <div className="flex max-w-3xl flex-col gap-6">
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
              {def.initial === 'current' ? t('wallet.mission.currentNote') : def.initial === 'salary' ? t('wallet.mission.salaryNote') : t('wallet.mission.freshNote')}
            </p>
            {done && <InlineAlert tone="success">{t('wallet.mission.alreadyDone')}</InlineAlert>}
            <Button className="self-start" leadingIcon={done ? 'replay' : 'play_arrow'} onClick={begin}>
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
    save(answered.run);
    setFeedback(answered.feedback);
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
    // A `current` mission keeps its settings; a `fresh` one only records the completion (D-166).
    setWallet((current) => walletAfter(def, finished, current));
    recordMission(personId, def.id, DEMO_TODAY);
  };

  const fuerteMessage = run.finished ? t('wallet.mission.fuerteDone') : (step.fuerte ?? fuerteDefault);

  return (
    <WalletShell section={t('wallet.nav.learn')} fuerte={{ state: run.finished ? 'celebration' : step.kind === 'single' ? 'thinking' : 'neutral', message: fuerteMessage }}>
      <div className="flex max-w-3xl flex-col gap-6">
        <MissionHeader def={def} compact />
        <ProgressBar
          value={Math.round(((run.finished ? total : run.step) / total) * 100)}
          label={t('wallet.mission.progress')}
          valueText={t('wallet.mission.stepOf', { step: Math.min(run.step + 1, total), total })}
        />

        {/* Only when the mission moves money: a mission about messages has nothing to show here */}
        {(def.initial === 'current' || run.wallet.movements.length > 0) && <PracticeWallet run={run} fresh={def.initial !== 'current'} />}

        <section aria-labelledby="step-title" className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)">
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
          <div aria-live="polite">{feedback && <InlineAlert tone={feedback.tone}>{feedback.text}</InlineAlert>}</div>

          <div className="flex flex-wrap items-center gap-3 border-t border-outline-variant pt-4">
            {step.kind !== 'summary' && (
              <Button onClick={goNext} disabled={!canContinue(def, run)} trailingIcon="arrow_forward">
                {t('wallet.mission.next')}
              </Button>
            )}
            {run.step > 0 && !run.finished && (
              <Button variant="text" leadingIcon="arrow_back" onClick={goBack}>
                {t('wallet.mission.back')}
              </Button>
            )}
            <span className="flex-1" />
            <Button asChild variant="text" leadingIcon="logout">
              <Link to="/app">{run.finished ? t('wallet.placeholder.backHome') : t('wallet.mission.exit')}</Link>
            </Button>
          </div>
          {!result?.done && step.kind !== 'summary' && step.kind !== 'card' && (
            <p className="text-body-small text-on-surface-variant">{t('wallet.mission.nextHint')}</p>
          )}
        </section>
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
        <p className="text-title-large text-on-surface">{def.title}</p>
      ) : (
        <h1 className="text-headline-medium text-on-surface">{def.title}</h1>
      )}
      <p className="text-body-large text-on-surface-variant">
        <span className="font-medium text-on-surface">{t('wallet.mission.objective')}</span> {def.objective}
      </p>
    </header>
  );
}

/** The practice balance of the mission, so each action shows its effect (5.3). */
function PracticeWallet({ run, fresh }: { run: MissionRun; fresh: boolean }) {
  const { t } = useTranslation();
  const pockets = pocketsTotal(run.wallet);
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg bg-surface-container px-4 py-3" aria-live="polite">
      <span className="flex items-center gap-2 text-label-medium text-on-surface-variant">
        <Icon name="account_balance_wallet" size={18} className="text-primary" />
        {fresh ? t('wallet.mission.freshWallet') : t('wallet.mission.yourWallet')}
      </span>
      <span className="text-body-medium text-on-surface">
        {t('wallet.mission.balance')} <MoneyText value={run.wallet.balance} className="text-title-small tabular-nums" />
      </span>
      {pockets.gt(0) && (
        <span className="text-body-medium text-on-surface">
          {t('wallet.mission.pockets')} <MoneyText value={pockets.toFixed(2)} className="text-title-small tabular-nums" />
        </span>
      )}
    </div>
  );
}

function Sources({ ids }: { ids?: string[] }) {
  const { t } = useTranslation();
  if (!ids?.length) return null;
  return <p className="text-body-small text-on-surface-variant">{t('wallet.mission.sources', { ids: ids.join(', ') })}</p>;
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
  const title = (text: string) => (
    <h1 id="step-title" ref={headingRef} tabIndex={-1} className="text-headline-medium text-on-surface focus:outline-none">
      {text}
    </h1>
  );

  switch (step.kind) {
    case 'card':
    case 'event':
      return (
        <>
          <IconTile icon={step.kind === 'event' ? 'notifications' : 'lightbulb'} tone={step.kind === 'event' ? 'warning' : 'tertiary'} />
          {title(step.title)}
          <p className="max-w-prose text-body-large text-on-surface">{step.body}</p>
          <Sources ids={step.sourceIds} />
          {step.kind === 'card' && !result?.done && (
            <Button variant="tonal" className="self-start" leadingIcon="check" onClick={() => onAnswer()}>
              {t('wallet.mission.understood')}
            </Button>
          )}
        </>
      );
    case 'action':
      return (
        <>
          {title(t('wallet.mission.actionTitle'))}
          <p className="max-w-prose text-body-large text-on-surface">{fillText(step.instruction, run)}</p>
          {!result?.done && (
            <Button className="self-start" leadingIcon="touch_app" onClick={() => onAnswer()}>
              {step.button}
            </Button>
          )}
        </>
      );
    case 'single':
    case 'decision': {
      const locked = step.kind === 'single' && result?.correct;
      const submit = (event: FormEvent) => {
        event.preventDefault();
        setTried(true);
        if (choice) onAnswer(choice);
      };
      return (
        <form noValidate onSubmit={submit} className="flex flex-col gap-4">
          {step.kind === 'single' && step.title ? title(step.title) : title(step.kind === 'single' ? t('wallet.mission.questionTitle') : t('wallet.mission.decisionTitle'))}
          {step.kind === 'single' && step.body && <p className="max-w-prose text-body-large text-on-surface">{step.body}</p>}
          <RadioGroup
            name={`${def.id}-${step.id}`}
            legend={step.prompt}
            required
            disabled={locked}
            error={tried && !choice ? t('wallet.mission.choose') : undefined}
            options={step.options.map((o) => ({ value: o.id, label: o.text }))}
            value={choice}
            onChange={(e) => setChoice(e.target.value)}
          />
          <Sources ids={step.sourceIds} />
          {!locked && (
            <Button type="submit" variant={result?.done ? 'outlined' : 'filled'} className="self-start" leadingIcon="check">
              {step.kind === 'decision' && result?.done ? t('wallet.mission.change') : t('wallet.mission.answer')}
            </Button>
          )}
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
          {title(t('wallet.mission.calcTitle'))}
          <MoneyInput
            label={step.prompt}
            helperText={step.help}
            required
            disabled={result?.correct}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={tried && !amount.trim() ? t('wallet.mission.amountMissing') : undefined}
          />
          <Sources ids={step.sourceIds} />
          {!result?.correct && (
            <Button type="submit" className="self-start" leadingIcon="calculate">
              {t('wallet.mission.check')}
            </Button>
          )}
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
          {title(t('wallet.mission.classifyTitle'))}
          <fieldset className="flex flex-col gap-3" disabled={result?.correct}>
            <legend className="mb-1 text-title-small text-on-surface">{step.prompt}</legend>
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
          <Sources ids={step.sourceIds} />
          {!result?.correct && (
            <Button type="submit" className="self-start" leadingIcon="check">
              {t('wallet.mission.answer')}
            </Button>
          )}
        </form>
      );
    }
    case 'summary': {
      const status = criteriaStatus(def, run);
      const allMet = status.every((s) => s.met);
      return (
        <>
          {title(run.finished ? t('wallet.mission.doneTitle') : t('wallet.mission.summaryTitle'))}
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
              <Button variant="outlined" className="self-start" leadingIcon="replay" onClick={onReplay}>
                {t('wallet.mission.replay')}
              </Button>
            </>
          ) : allMet ? (
            <Button className="self-start" leadingIcon="task_alt" onClick={onComplete}>
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
