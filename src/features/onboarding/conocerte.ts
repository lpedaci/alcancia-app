import conocerteJson from '@/data/conocerte.json';
import type { Dimension, Level } from '@/types/domain';

/**
 * Conocerte (F2, P2, CU-01): 12 questions. Habit answers have no right answer and never leave the
 * browser (D-62); knowledge answers give feedback at the end and are the only ones scored, by
 * dimension (Kirkpatrick 2). Pure functions, tested in `conocerte.test.ts` (D-167).
 */
export interface ConocerteQuestion {
  id: string;
  type: 'habit' | 'knowledge';
  dimension: Dimension;
  prompt: string;
  options: { id: string; text: string }[];
  correct?: string;
  explanation?: string;
  sourceIds?: string[];
}

export const QUESTIONS = conocerteJson.questions as ConocerteQuestion[];
export const KNOWLEDGE = QUESTIONS.filter((q) => q.type === 'knowledge');
export const HABITS = QUESTIONS.filter((q) => q.type === 'habit');

/** Program order of the dimensions (D-64, D-116): also the tie-break of the route. */
export const DIMENSIONS: Dimension[] = ['budget', 'savings', 'debt', 'inflation_rates', 'goals'];

/** The wallet section where each dimension is practised (5.0). */
export const DIMENSION_LEVEL: Record<Dimension, string> = {
  budget: 'level-3',
  savings: 'level-4',
  debt: 'level-5',
  inflation_rates: 'level-6',
  goals: 'level-7',
};

/** Fraction of right knowledge answers per dimension, from 0 to 1, two decimals. */
export function scoreKnowledge(answers: Record<string, string>): Record<Dimension, number> {
  const scores = {} as Record<Dimension, number>;
  for (const dimension of DIMENSIONS) {
    const questions = KNOWLEDGE.filter((q) => q.dimension === dimension);
    const right = questions.filter((q) => answers[q.id] === q.correct).length;
    scores[dimension] = questions.length ? Math.round((right / questions.length) * 100) / 100 : 0;
  }
  return scores;
}

/** Level of a dimension: under 50 % initial, under 80 % intermediate, from 80 % advanced (D-167). */
export function levelOf(score: number): Level {
  if (score >= 0.8) return 'advanced';
  if (score >= 0.5) return 'intermediate';
  return 'beginner';
}

/** Proposed route (F2): the weakest dimensions first; ties keep the program order. */
export function route(scores: Record<Dimension, number>): Dimension[] {
  return [...DIMENSIONS].sort((a, b) => scores[a] - scores[b] || DIMENSIONS.indexOf(a) - DIMENSIONS.indexOf(b));
}

/** Only the habit answers, which stay in the browser (D-62). */
export function habitAnswers(answers: Record<string, string>): Record<string, string> {
  return Object.fromEntries(HABITS.filter((q) => answers[q.id] !== undefined).map((q) => [q.id, answers[q.id]!]));
}
