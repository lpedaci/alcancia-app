import { BANK, type LearningQuestion, seeded, shuffle } from '@/features/learning/questions';

/**
 * Spaced review (CLAUDE.md F19, D-273): 7 and 30 days after a person finishes a module's guide, 3
 * short questions of that module's bank to fix what was learned. Formative: no score, unlimited
 * retries, nothing is shared (the result stays in the person's browser). The 30-day round comes
 * after the 7-day one; a module shows one pending round at a time.
 */
export const REVIEW_ROUNDS = [7, 30] as const;
export type ReviewRound = (typeof REVIEW_ROUNDS)[number];
export const REVIEW_QUESTIONS = 3;
/** At most this many pending reviews at once, so the review never becomes a pile. */
export const MAX_PENDING = 3;

export interface ReviewDone {
  moduleId: string;
  round: ReviewRound;
  at: string;
}

export interface DueReview {
  moduleId: string;
  round: ReviewRound;
  /** Date the review became due (ISO). */
  dueOn: string;
}

const DAY = 86400000;
const addDays = (iso: string, days: number) => new Date(Date.parse(iso.slice(0, 10)) + days * DAY).toISOString().slice(0, 10);

/** Types that fit a short review: no branching cases, no simulator tasks and no ordering (its items need a starting shuffle). */
const FITS = new Set<LearningQuestion['type']>(['single', 'multiple', 'true_false_why', 'numeric', 'categorize', 'matching']);
export const reviewableModules = new Set(BANK.filter((q) => FITS.has(q.type)).map((q) => q.moduleId));

/** Pending reviews of one person, the oldest first, at most `MAX_PENDING`. */
export function dueReviews(
  guides: { moduleId: string; completedAt?: string; guideIdsDone: string[] }[],
  done: ReviewDone[],
  today: string,
): DueReview[] {
  const out: DueReview[] = [];
  for (const g of guides) {
    if (!g.completedAt || g.guideIdsDone.length === 0 || !reviewableModules.has(g.moduleId)) continue;
    const next = REVIEW_ROUNDS.find((r) => !done.some((d) => d.moduleId === g.moduleId && d.round === r));
    if (!next) continue;
    const dueOn = addDays(g.completedAt, next);
    if (dueOn <= today) out.push({ moduleId: g.moduleId, round: next, dueOn });
  }
  return out.sort((a, b) => a.dueOn.localeCompare(b.dueOn) || a.moduleId.localeCompare(b.moduleId)).slice(0, MAX_PENDING);
}

/** The questions of a review: stable for the same module and round, different between rounds. */
export function drawReview(moduleId: string, round: ReviewRound): LearningQuestion[] {
  let seed: number = round;
  for (const ch of moduleId) seed = (seed * 31 + ch.charCodeAt(0)) | 0;
  const pool = BANK.filter((q) => q.moduleId === moduleId && FITS.has(q.type));
  return shuffle(pool, seeded(Math.abs(seed))).slice(0, REVIEW_QUESTIONS);
}
