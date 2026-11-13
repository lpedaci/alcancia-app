import missionsJson from '@/data/wallet-missions.json';
import { D, roundCents, toMoneyString } from '@/lib/finance';
import { formatMoney, parseDecimalInput } from '@/lib/money';
import {
  advanceDays,
  chargeSurpriseSubscription,
  completeMission,
  createPocket,
  createWallet,
  moveToPocket,
  setDailyLimit,
  setSubscription,
  setTwoFactor,
} from '@/features/wallet/engine/engine';
import { POCKET_SAVINGS } from '@/features/wallet/engine/demo';
import type { WalletState } from '@/features/wallet/engine/types';

/**
 * Declarative mission engine (CLAUDE.md 5.3, D-166). A mission is data in `wallet-missions.json`:
 * its starting point, its steps and its success criteria. The engine is pure: it takes a run and
 * an answer and gives the next run and the feedback, so L&D can add missions without code (F14)
 * and every rule has a test. Text with `{{salary}}`, `{{expected}}` or `{{amount}}` is filled in
 * with the run's numbers.
 *
 * Errors are allowed and always end in feedback that explains (tone `info`, never `error`, 2.2.1
 * pattern 11). Each answer is recorded as an xAPI-like statement (started, answered, passed,
 * completed) for F21.
 */

export type ActionId = 'receive_salary' | 'enable_two_factor' | 'set_daily_limit' | 'charge_subscription' | 'cancel_subscription' | 'save_to_savings';
export type CheckId = 'two_factor_on' | 'daily_limit_set' | 'step_correct' | 'step_done' | 'salary_received' | 'savings_percent';

interface StepBase {
  id: string;
  /** Short line of Fuerte for this step (5.0.1): two sentences at most. */
  fuerte?: string;
  sourceIds?: string[];
}
export interface Option {
  id: string;
  text: string;
  feedback: string;
  action?: ActionId;
  value?: string;
}
export type MissionStep =
  | (StepBase & { kind: 'card'; title: string; body: string })
  | (StepBase & { kind: 'event'; title: string; body: string; action: ActionId })
  | (StepBase & { kind: 'action'; instruction: string; button: string; action: ActionId; done: string })
  | (StepBase & { kind: 'decision'; prompt: string; options: Option[] })
  | (StepBase & { kind: 'single'; prompt: string; options: Option[]; correct: string; title?: string; body?: string })
  | (StepBase & {
      kind: 'numeric';
      prompt: string;
      help: string;
      expected: 'salary_percent';
      param: string;
      tolerance: string;
      onCorrect?: ActionId;
      hint: string;
      feedback: string;
    })
  | (StepBase & { kind: 'summary' });

export interface Criterion {
  id: string;
  description: string;
  check: CheckId;
  param?: string;
}

export interface MissionDef {
  id: string;
  levelId: string;
  title: string;
  minutes: number;
  objective: string;
  /** `fresh`: a practice account at day 0. `current`: a copy of the person's wallet, kept on completion. */
  initial?: 'fresh' | 'current';
  steps?: MissionStep[];
  criteria?: Criterion[];
}

export const MISSION_DEFS = missionsJson.missions as MissionDef[];
export const missionById = (id: string) => MISSION_DEFS.find((m) => m.id === id);
/** Missions whose steps are written (the rest arrive with their level, steps 7 to 9). */
export const isPlayable = (def: MissionDef | undefined): def is MissionDef & { steps: MissionStep[] } => Boolean(def?.steps?.length);

export interface StepResult {
  /** The chosen option id or the typed amount. */
  answer?: string;
  correct?: boolean;
  attempts: number;
  /** The step can be left: an action done, a decision taken or a right answer. */
  done: boolean;
}

export interface MissionStatement {
  verb: 'started' | 'answered' | 'passed' | 'completed' | 'acted';
  object: string;
  result?: { success?: boolean; response?: string };
}

export interface MissionRun {
  missionId: string;
  step: number;
  wallet: WalletState;
  results: Record<string, StepResult>;
  statements: MissionStatement[];
  /** Wallet before each decision, so changing your mind replays from there. */
  snapshots: Record<string, WalletState>;
  finished: boolean;
}

export interface Feedback {
  tone: 'success' | 'info';
  text: string;
}

const percentOfSalary = (wallet: WalletState, fraction: string) => roundCents(D(wallet.salary).times(fraction));

/** Fills `{{salary}}`, `{{expected}}` and `{{amount}}` with formatted amounts. */
export function fillText(text: string, run: MissionRun, extra: { expected?: string; amount?: string } = {}): string {
  return text
    .replaceAll('{{salary}}', formatMoney(run.wallet.salary))
    .replaceAll('{{expected}}', extra.expected ? formatMoney(extra.expected) : '')
    .replaceAll('{{amount}}', extra.amount ? formatMoney(extra.amount) : '');
}

export function expectedAmount(step: Extract<MissionStep, { kind: 'numeric' }>, run: MissionRun): string {
  return toMoneyString(percentOfSalary(run.wallet, step.param));
}

function applyAction(wallet: WalletState, action: ActionId, value?: string): WalletState {
  switch (action) {
    case 'receive_salary':
      // Day 0 → day 1: the engine credits the net salary first thing (D-158).
      return wallet.day === 0 ? advanceDays(wallet, 1) : wallet;
    case 'enable_two_factor':
      return setTwoFactor(wallet, true);
    case 'set_daily_limit':
      return setDailyLimit(wallet, value);
    case 'charge_subscription':
      return chargeSurpriseSubscription(wallet);
    case 'cancel_subscription':
      return setSubscription(wallet, false);
    case 'save_to_savings': {
      const withPocket = createPocket(wallet, { id: POCKET_SAVINGS, name: 'Ahorro' });
      return moveToPocket(withPocket, POCKET_SAVINGS, value ?? '0');
    }
  }
}

export function startMission(def: MissionDef, current: WalletState): MissionRun {
  const wallet = def.initial === 'fresh' ? createWallet(current.personId, current.scenarioId) : structuredClone(current);
  return { missionId: def.id, step: 0, wallet, results: {}, statements: [{ verb: 'started', object: def.id }], snapshots: {}, finished: false };
}

export const currentStep = (def: MissionDef, run: MissionRun): MissionStep | undefined => def.steps?.[run.step];

/**
 * Answers the current step. `input` is the option id (single, decision) or the typed amount
 * (numeric); cards, events and actions need none. The run does not move: call `nextStep` when the
 * step is done, so the person reads the feedback first.
 */
export function answerStep(def: MissionDef, run: MissionRun, input?: string): { run: MissionRun; feedback?: Feedback } {
  const step = currentStep(def, run);
  if (!step || run.finished) return { run };
  const previous = run.results[step.id] ?? { attempts: 0, done: false };
  const record = (result: StepResult, statement: MissionStatement, wallet = run.wallet, snapshots = run.snapshots): MissionRun => ({
    ...run,
    wallet,
    snapshots,
    results: { ...run.results, [step.id]: result },
    statements: [...run.statements, statement],
  });

  switch (step.kind) {
    case 'card':
      return { run: record({ ...previous, done: true }, { verb: 'acted', object: `${def.id}/${step.id}` }) };
    case 'event':
    case 'action': {
      if (previous.done) return { run };
      const wallet = applyAction(run.wallet, step.action);
      const feedback = step.kind === 'action' ? { tone: 'success' as const, text: fillText(step.done, { ...run, wallet }) } : undefined;
      return { run: record({ ...previous, done: true }, { verb: 'acted', object: `${def.id}/${step.id}` }, wallet), feedback };
    }
    case 'decision': {
      const option = step.options.find((o) => o.id === input);
      if (!option) return { run };
      // A decision has no wrong answer: it has a consequence. Changing it replays from the wallet
      // as it was before the first choice.
      const base = run.snapshots[step.id] ?? run.wallet;
      const wallet = option.action ? applyAction(base, option.action, option.value) : base;
      return {
        run: record(
          { answer: option.id, attempts: previous.attempts + 1, done: true },
          { verb: 'answered', object: `${def.id}/${step.id}`, result: { response: option.id } },
          wallet,
          { ...run.snapshots, [step.id]: base },
        ),
        feedback: { tone: 'success', text: option.feedback },
      };
    }
    case 'single': {
      if (previous.correct) return { run };
      const option = step.options.find((o) => o.id === input);
      if (!option) return { run };
      const correct = option.id === step.correct;
      return {
        run: record(
          { answer: option.id, correct, attempts: previous.attempts + 1, done: correct },
          { verb: 'answered', object: `${def.id}/${step.id}`, result: { success: correct, response: option.id } },
        ),
        feedback: { tone: correct ? 'success' : 'info', text: option.feedback },
      };
    }
    case 'numeric': {
      if (previous.correct) return { run };
      const parsed = input === undefined ? null : parseDecimalInput(input);
      if (parsed === null) return { run };
      const expected = expectedAmount(step, run);
      const amount = toMoneyString(parsed);
      const correct = D(amount).minus(expected).abs().lte(step.tolerance);
      let wallet = run.wallet;
      if (correct && step.onCorrect) wallet = applyAction(wallet, step.onCorrect, amount);
      return {
        run: record(
          { answer: amount, correct, attempts: previous.attempts + 1, done: correct },
          { verb: 'answered', object: `${def.id}/${step.id}`, result: { success: correct, response: amount } },
          wallet,
        ),
        feedback: correct
          ? { tone: 'success', text: fillText(step.feedback, run, { amount }) }
          : { tone: 'info', text: fillText(step.hint, run, { expected }) },
      };
    }
    case 'summary':
      return { run };
  }
}

/** Can the person go to the next step? Summary steps are the end. */
export const canContinue = (def: MissionDef, run: MissionRun) => {
  const step = currentStep(def, run);
  return Boolean(step && step.kind !== 'summary' && run.results[step.id]?.done);
};

export function nextStep(def: MissionDef, run: MissionRun): MissionRun {
  if (!canContinue(def, run)) return run;
  return { ...run, step: Math.min(run.step + 1, (def.steps?.length ?? 1) - 1) };
}

export function previousStep(run: MissionRun): MissionRun {
  return { ...run, step: Math.max(0, run.step - 1) };
}

export function checkCriterion(criterion: Criterion, run: MissionRun): boolean {
  const { wallet } = run;
  switch (criterion.check) {
    case 'two_factor_on':
      return wallet.securitySettings.twoFactor;
    case 'daily_limit_set':
      return wallet.securitySettings.dailyLimit !== undefined;
    case 'step_correct':
      return run.results[criterion.param ?? '']?.correct === true;
    case 'step_done':
      return run.results[criterion.param ?? '']?.done === true;
    case 'salary_received':
      return wallet.movements.some((m) => m.type === 'income');
    case 'savings_percent': {
      const pocket = wallet.pockets.find((p) => p.id === POCKET_SAVINGS);
      if (!pocket) return false;
      return D(pocket.amount).minus(percentOfSalary(wallet, criterion.param ?? '0')).abs().lte('1.00');
    }
  }
}

export const criteriaStatus = (def: MissionDef, run: MissionRun) => (def.criteria ?? []).map((c) => ({ criterion: c, met: checkCriterion(c, run) }));

/** Closes the run if every criterion is met. */
export function finishMission(def: MissionDef, run: MissionRun): MissionRun {
  if (run.finished || !criteriaStatus(def, run).every((c) => c.met)) return run;
  return {
    ...run,
    finished: true,
    wallet: completeMission(run.wallet, def.id),
    statements: [...run.statements, { verb: 'completed', object: def.id, result: { success: true } }],
  };
}

/**
 * The person's wallet after the mission: a `current` mission keeps its changes (the security
 * settings); a `fresh` one is a practice scenario, so only the completion is recorded (D-166).
 */
export function walletAfter(def: MissionDef, run: MissionRun, current: WalletState): WalletState {
  if (!run.finished) return current;
  return def.initial === 'current' ? run.wallet : completeMission(current, def.id);
}

/** Attempts of a mission, for the tutor's aggregated view: how many answers were needed (5.3). */
export const answerCount = (run: MissionRun) => run.statements.filter((s) => s.verb === 'answered').length;
