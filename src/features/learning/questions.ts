import Decimal from 'decimal.js';
import banksJson from '@/data/question-banks.json';
import challengesJson from '@/data/challenges.json';
import guidesJson from '@/data/guides.json';
import modulesJson from '@/data/modules.json';
import { parseDecimalInput } from '@/lib/money';

/**
 * Learning content and its pure rules (CLAUDE.md 5.1, F3, D-57, D-171): guides, question banks and
 * level challenges. Every type of 5.1 used in phase A has an accessible alternative to dragging,
 * and every answer gets an explanation, never only "correct" or "incorrect".
 */
interface Option {
  id: string;
  text: string;
}
interface Base {
  id: string;
  moduleId: string;
  prompt: string;
  feedback: Record<string, string>;
  sourceIds: string[];
}
export type LearningQuestion =
  | (Base & { type: 'single'; options: Option[]; correctOptionIds: string[] })
  /** "Antes de empezar" about the person's own experience: no right answer, never scored nor stored (review of 13/11/2026). */
  | (Base & { type: 'reflection'; options: Option[] })
  | (Base & { type: 'multiple'; options: Option[]; correctOptionIds: string[] })
  | (Base & { type: 'true_false_why'; options: Option[]; correctOptionIds: string[]; why: { prompt: string; options: Option[]; correct: string } })
  | (Base & { type: 'numeric'; numeric: { answer: string; tolerance: string; unit: 'ARS' | 'percent' | 'months' }; help: string })
  | (Base & { type: 'ordering'; ordering: { items: Option[]; correctOrder: string[] } })
  | (Base & { type: 'matching'; matching: { left: Option[]; right: Option[]; pairs: [string, string][] } })
  | (Base & { type: 'categorize'; categorize: { categories: { id: string; label: string }[]; items: (Option & { categoryId: string })[] } });

/** single: option id · multiple: ids · true_false_why: { value, why } · numeric: typed text · ordering: ids in order · matching and categorize: id → id. */
export type Answer = string | string[] | Record<string, string>;

export type GuideBlock =
  | { type: 'hook' | 'objective'; body: string }
  /** "Para tu vida", optionally with the tool to try it (its name is in the text, never its code). */
  | { type: 'takeaway'; body: string; toolId?: string }
  | { type: 'text'; title: string; body: string }
  | { type: 'example'; title: string; steps: string[] }
  | { type: 'recall' | 'practice'; question: LearningQuestion };

export interface Guide {
  id: string;
  moduleId: string;
  title: string;
  minutes: number;
  blocks: GuideBlock[];
  sourceIds: string[];
}

export interface ChallengeDef {
  id: string;
  levelId: string;
  mastery: boolean;
  questionsPerModule: Record<string, number>;
  passingScore: number;
}

export interface ModuleMeta {
  id: string;
  order: number;
  title: string;
  objective: string;
  levelId: string;
  phase: 'A' | 'B';
}

export const BANK = banksJson.questions as unknown as LearningQuestion[];
export const GUIDES = guidesJson.guides as unknown as Guide[];
export const CHALLENGES = challengesJson.challenges as unknown as ChallengeDef[];
export const MODULES = modulesJson as unknown as ModuleMeta[];

export const guideById = (id: string) => GUIDES.find((g) => g.id === id);
export const guideOfModule = (moduleId: string) => GUIDES.find((g) => g.moduleId === moduleId);
export const challengeById = (id: string) => CHALLENGES.find((c) => c.id === id);
export const moduleById = (id: string) => MODULES.find((m) => m.id === id);

/** Is the answer complete enough to be checked? */
export function isAnswered(question: LearningQuestion, answer: Answer | undefined): boolean {
  if (answer === undefined) return false;
  switch (question.type) {
    case 'single':
    case 'reflection':
      return typeof answer === 'string' && answer !== '';
    case 'multiple':
      return Array.isArray(answer) && answer.length > 0;
    case 'true_false_why': {
      const a = answer as Record<string, string>;
      return Boolean(a.value && a.why);
    }
    case 'numeric':
      return typeof answer === 'string' && parseDecimalInput(answer) !== null;
    case 'ordering':
      return Array.isArray(answer) && answer.length === question.ordering.items.length;
    case 'matching':
      return question.matching.left.every((l) => Boolean((answer as Record<string, string>)[l.id]));
    case 'categorize':
      return question.categorize.items.every((i) => Boolean((answer as Record<string, string>)[i.id]));
  }
}

export function isCorrect(question: LearningQuestion, answer: Answer | undefined): boolean {
  if (!isAnswered(question, answer)) return false;
  switch (question.type) {
    case 'reflection':
      return true;
    case 'single':
      return question.correctOptionIds[0] === answer;
    case 'multiple': {
      const chosen = new Set(answer as string[]);
      return chosen.size === question.correctOptionIds.length && question.correctOptionIds.every((id) => chosen.has(id));
    }
    case 'true_false_why': {
      const a = answer as Record<string, string>;
      return a.value === question.correctOptionIds[0] && a.why === question.why.correct;
    }
    case 'numeric': {
      const value = parseDecimalInput(answer as string)!;
      return new Decimal(value).minus(question.numeric.answer).abs().lte(question.numeric.tolerance);
    }
    case 'ordering':
      return (answer as string[]).join() === question.ordering.correctOrder.join();
    case 'matching':
      return question.matching.pairs.every(([left, right]) => (answer as Record<string, string>)[left] === right);
    case 'categorize':
      return question.categorize.items.every((i) => (answer as Record<string, string>)[i.id] === i.categoryId);
  }
}

/** The explanation for this answer: per option for single choice, right or wrong for the rest. */
export function feedbackFor(question: LearningQuestion, answer: Answer | undefined): string {
  if ((question.type === 'single' || question.type === 'reflection') && typeof answer === 'string' && question.feedback[answer]) return question.feedback[answer];
  return isCorrect(question, answer) ? (question.feedback.correct ?? '') : (question.feedback.incorrect ?? '');
}

/** Fisher-Yates with an injected random source, so tests are deterministic. */
export function shuffle<T>(items: T[], random: () => number = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

/** Small deterministic generator for a seeded draw (mulberry32). */
export function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Options in random order, except in ordering questions, whose items start shuffled on purpose (5.1). */
function withShuffledOptions(question: LearningQuestion, random: () => number): LearningQuestion {
  if (question.type === 'single' || question.type === 'multiple') return { ...question, options: shuffle(question.options, random) };
  if (question.type === 'matching') return { ...question, matching: { ...question.matching, right: shuffle(question.matching.right, random) } };
  return question;
}

/** Questions of a challenge (D-57): N from each module's bank, in random order, with shuffled options. */
export function drawChallenge(challenge: ChallengeDef, random: () => number = Math.random): LearningQuestion[] {
  const picked: LearningQuestion[] = [];
  for (const [moduleId, count] of Object.entries(challenge.questionsPerModule)) {
    picked.push(...shuffle(BANK.filter((q) => q.moduleId === moduleId), random).slice(0, count));
  }
  return shuffle(picked, random).map((q) => withShuffledOptions(q, random));
}

/** The order in which an ordering question starts: shuffled, never already solved. */
export function startingOrder(question: Extract<LearningQuestion, { type: 'ordering' }>, random: () => number = Math.random): string[] {
  const ids = question.ordering.items.map((i) => i.id);
  for (let i = 0; i < 5; i += 1) {
    const order = shuffle(ids, random);
    if (order.join() !== question.ordering.correctOrder.join()) return order;
  }
  return [...ids].reverse();
}

export interface AttemptScore {
  score: number;
  moduleScores: Record<string, number>;
  right: number;
  total: number;
}

/** Score of an attempt, total and per module (the module badge comes from its part, D-57). */
export function scoreAttempt(questions: LearningQuestion[], answers: Record<string, Answer>): AttemptScore {
  const perModule: Record<string, { right: number; total: number }> = {};
  let right = 0;
  for (const q of questions) {
    const ok = isCorrect(q, answers[q.id]);
    if (ok) right += 1;
    const entry = (perModule[q.moduleId] ??= { right: 0, total: 0 });
    entry.total += 1;
    if (ok) entry.right += 1;
  }
  const round = (n: number) => Math.round(n * 100) / 100;
  return {
    score: questions.length ? round(right / questions.length) : 0,
    moduleScores: Object.fromEntries(Object.entries(perModule).map(([id, e]) => [id, round(e.right / e.total)])),
    right,
    total: questions.length,
  };
}
