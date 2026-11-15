import { aggregate, type Aggregate } from '@/lib/metrics';
import type { ChallengeAttempt, CollectiveGoal, Cohort, MissionCompletion, Person } from '@/types/domain';

/**
 * Collective goal of a cohort (D-80) and the guard of the cohort's space (F20), step 26 (D-274).
 * Pure and tested. The goal counts only learning data that the tutor already sees (missions and
 * level challenges), aggregated with the threshold: no ranking, no names, no wallet data.
 */

export interface GoalProgress {
  /** Share of the cohort's active participants who did it. */
  share: number;
  reached: boolean;
}

export function goalProgress(
  goal: CollectiveGoal,
  data: { people: Person[]; missionCompletions: MissionCompletion[]; challengeAttempts: ChallengeAttempt[] },
  passingScore: number,
  threshold: number,
): Aggregate<GoalProgress> {
  const members = data.people.filter((p) => p.role === 'participant' && p.status === 'active' && p.cohortIds.includes(goal.cohortId));
  const did = (personId: string) =>
    goal.kind === 'mission'
      ? data.missionCompletions.some((m) => m.personId === personId && m.missionId === goal.targetId)
      : data.challengeAttempts.some((a) => a.personId === personId && a.challengeId === `challenge-${goal.targetId}` && a.score >= passingScore);
  return aggregate(
    members,
    (list) => {
      const share = list.filter((p) => did(p.id)).length / list.length;
      return { share, reached: share >= goal.targetShare };
    },
    { threshold, idOf: (p) => p.id },
  );
}

/** Whether the person already counts for the goal: her own contribution, which only she sees. */
export function contributes(goal: CollectiveGoal, personId: string, data: { missionCompletions: MissionCompletion[]; challengeAttempts: ChallengeAttempt[] }, passingScore: number) {
  return goal.kind === 'mission'
    ? data.missionCompletions.some((m) => m.personId === personId && m.missionId === goal.targetId)
    : data.challengeAttempts.some((a) => a.personId === personId && a.challengeId === `challenge-${goal.targetId}` && a.score >= passingScore);
}

/** The goal of a cohort that is still open, the latest first. */
export const activeGoal = (goals: CollectiveGoal[], cohort: Pick<Cohort, 'id'>, today: string) =>
  goals.filter((g) => g.cohortId === cohort.id && g.dueDate >= today).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

export type PostProblem = 'empty' | 'too_long' | 'money' | 'contact' | 'account';
export const POST_MAX = 600;

/**
 * F20: "No compartas montos ni datos personales". Blocks a post with amounts (a $ or USD sign, or a
 * long number), an email or a phone, or an account key (CBU or CVU). The person rewrites it; nothing
 * is published with that data.
 */
export function postProblems(text: string): PostProblem[] {
  const t = text.trim();
  const out: PostProblem[] = [];
  if (!t) return ['empty'];
  if (t.length > POST_MAX) out.push('too_long');
  if (/\$\s?\d|\bUSD\s?\d|\b\d{1,3}(\.\d{3})+(,\d+)?\b|\b\d{5,}\b/i.test(t.replace(/\b\d{22}\b/g, ''))) out.push('money');
  if (/[\w.+-]+@[\w-]+\.[\w.]+|\+?\b\d{2,4}[\s-]\d{3,4}[\s-]\d{4}\b/.test(t)) out.push('contact');
  if (/\b\d{22}\b|\b(cbu|cvu)\b\s*:?\s*\d/i.test(t)) out.push('account');
  return out;
}
