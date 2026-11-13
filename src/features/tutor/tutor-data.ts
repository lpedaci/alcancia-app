import { DEMO_TODAY } from '@/app/config';
import { BANK, MODULES } from '@/features/learning/questions';
import levelsJson from '@/data/levels.json';
import { aggregate, type Aggregate, average, share } from '@/lib/metrics';
import type { OrgData } from '@/store/data-store';
import type { Cohort, LevelLearningProgress, Person } from '@/types/domain';

/**
 * Data of the tutor's panel (CLAUDE.md F6, T1 to T5, D-193): pure functions over the organization's
 * learning data, so every number is computed, never written by hand (F7). The tutor sees learning
 * progress individually for her cohorts, but never money, habit answers, personal notes or whether a
 * level is locked (D-58, D-62): none of that is in `OrgData`. Group figures go through
 * `aggregate()` with the privacy threshold.
 */
export type TutorData = Pick<
  OrgData,
  'organization' | 'program' | 'cohorts' | 'people' | 'guideProgress' | 'challengeAttempts' | 'itemResponses' | 'levelLearning' | 'unlockRecords' | 'missionCompletions' | 'weeklyChallenges' | 'weeklyReports' | 'tutorQuestions'
>;

const DAY = 86400000;
const daysUntil = (iso: string) => Math.round((Date.parse(iso.slice(0, 10)) - Date.parse(DEMO_TODAY)) / DAY);
export const LEVELS = (levelsJson as { id: string; order: number; phase: string; guideModuleIds: string[]; challengeId?: string }[]).filter(
  (l) => l.phase === 'A' && l.order >= 1,
);

export const cohortsOf = (data: TutorData, tutorId: string) => data.cohorts.filter((c) => c.tutorId === tutorId);
export const membersOf = (data: TutorData, cohort: Cohort): Person[] =>
  data.people.filter((p) => p.role === 'participant' && p.cohortIds.includes(cohort.id));

const threshold = (data: TutorData) => data.organization.privacyThreshold;

/** Share of the cohort's modules with their guide read, per person (0 to 1). */
function moduleShare(data: TutorData, person: Person, moduleIds: string[]): number {
  const done = new Set(data.guideProgress.filter((g) => g.personId === person.id && g.guideIdsDone.length > 0).map((g) => g.moduleId));
  return moduleIds.length ? moduleIds.filter((m) => done.has(m)).length / moduleIds.length : 0;
}

/** Best score of each challenge a person attempted (the best attempt counts, D-57). */
function bestScores(data: TutorData, personIds: Set<string>): number[] {
  const best = new Map<string, number>();
  for (const a of data.challengeAttempts) {
    if (!personIds.has(a.personId)) continue;
    const key = `${a.personId}|${a.challengeId}`;
    best.set(key, Math.max(best.get(key) ?? 0, a.score));
  }
  return [...best.values()];
}

export interface TutorKpis {
  people: number;
  participation: Aggregate<number>;
  modules: Aggregate<number>;
  challengeAverage: Aggregate<number>;
  weeklyDone: Aggregate<number>;
}

/** KPIs of a group of cohorts (T1) or of one cohort (T2). */
export function kpis(data: TutorData, cohorts: Cohort[]): TutorKpis {
  const people = [...new Map(cohorts.flatMap((c) => membersOf(data, c)).map((p) => [p.id, p])).values()];
  const ids = new Set(people.map((p) => p.id));
  const options = { threshold: threshold(data) };
  const moduleIdsOf = (p: Person) => cohorts.find((c) => p.cohortIds.includes(c.id))?.moduleIds ?? [];
  const due = data.weeklyChallenges.filter((w) => cohorts.some((c) => c.id === w.cohortId) && daysUntil(w.dueDate) <= 0);
  const expected = due.flatMap((w) => membersOf(data, cohorts.find((c) => c.id === w.cohortId)!).filter((p) => p.status === 'active').map((p) => ({ w, p })));
  return {
    people: people.length,
    participation: aggregate(people, (list) => share(list, (p) => p.status === 'active') ?? 0, options),
    modules: aggregate(people, (list) => average(list.filter((p) => p.status === 'active').map((p) => moduleShare(data, p, moduleIdsOf(p)))) ?? 0, options),
    challengeAverage: aggregate(people, () => average(bestScores(data, ids)) ?? 0, options),
    weeklyDone: aggregate(people, () => share(expected, ({ w, p }) => data.weeklyReports.some((r) => r.challengeId === w.id && r.personId === p.id && r.result === 'done')) ?? 0, options),
  };
}

export type AlertKind = 'not_started' | 'due_soon' | 'exhausted' | 'unanswered';
export interface TutorAlert {
  kind: AlertKind;
  count: number;
  cohortId?: string;
  moduleId?: string;
  days?: number;
  to: string;
}

/**
 * Alerts of the tutor's home (F6): people who did not start a module of the cohort's route, a
 * deadline close, challenges with no attempts left (D-57: the tutor can enable the level) and
 * questions waiting for an answer.
 */
export function alerts(data: TutorData, cohorts: Cohort[]): TutorAlert[] {
  const out: TutorAlert[] = [];
  for (const cohort of cohorts) {
    const active = membersOf(data, cohort).filter((p) => p.status === 'active');
    // The first module of the route that several active people have not started.
    for (const moduleId of cohort.moduleIds) {
      const missing = active.filter((p) => !data.guideProgress.some((g) => g.personId === p.id && g.moduleId === moduleId && g.guideIdsDone.length > 0));
      if (missing.length >= 3 && missing.length < active.length) {
        out.push({ kind: 'not_started', count: missing.length, cohortId: cohort.id, moduleId, to: `/tutor/cohorts/${cohort.id}` });
        break;
      }
    }
    const exhausted = data.levelLearning.filter((l) => l.challenge === 'attempts_exhausted' && !l.enabledBy && active.some((p) => p.id === l.personId));
    if (exhausted.length) out.push({ kind: 'exhausted', count: exhausted.length, cohortId: cohort.id, to: `/tutor/cohorts/${cohort.id}` });
  }
  // One deadline alert per date: when every cohort ends the same day, it shows once (D-193).
  const byDate = new Map<string, Cohort[]>();
  for (const c of cohorts) if (c.dueDate) byDate.set(c.dueDate, [...(byDate.get(c.dueDate) ?? []), c]);
  for (const [date, list] of byDate) {
    const days = daysUntil(date);
    if (days < 0 || days > 45) continue;
    out.push({ kind: 'due_soon', count: list.length, days, cohortId: list.length === 1 ? list[0]!.id : undefined, to: list.length === 1 ? `/tutor/cohorts/${list[0]!.id}` : '/tutor' });
  }
  const unanswered = data.tutorQuestions.filter((q) => !q.answer && cohorts.some((c) => c.id === q.cohortId));
  if (unanswered.length) out.push({ kind: 'unanswered', count: unanswered.length, to: '/tutor/questions' });
  // What has a date or someone waiting goes first.
  const priority: Record<AlertKind, number> = { due_soon: 0, unanswered: 1, exhausted: 2, not_started: 3 };
  return out.sort((a, b) => priority[a.kind] - priority[b.kind]);
}

export type CellState = 'done' | 'reading' | 'none';
export interface HeatCell {
  moduleId: string;
  state: CellState;
  /** Best module score in its level challenge (D-57), when there is one. */
  score?: number;
}

/** T2 heat map: one row per person, one cell per module of the cohort's route. */
export function heatmap(data: TutorData, cohort: Cohort): { person: Person; cells: HeatCell[] }[] {
  return membersOf(data, cohort)
    .sort((a, b) => a.name.localeCompare(b.name, 'es'))
    .map((person) => ({
      person,
      cells: cohort.moduleIds.map((moduleId) => {
        const read = data.guideProgress.some((g) => g.personId === person.id && g.moduleId === moduleId && g.guideIdsDone.length > 0);
        const scores = data.challengeAttempts.filter((a) => a.personId === person.id && a.moduleScores[moduleId] !== undefined).map((a) => a.moduleScores[moduleId]!);
        const score = scores.length ? Math.max(...scores) : undefined;
        return { moduleId, state: read && score !== undefined ? 'done' : read ? 'reading' : 'none', score };
      }),
    }));
}

/**
 * T2, learning progress by level (D-58): guides read, challenge state, how it was enabled and
 * whether it is completed. Never whether the level is locked or unlocked.
 */
export function learningByLevel(data: TutorData, personId: string): (LevelLearningProgress & { levelOrder: number })[] {
  return LEVELS.flatMap((level) => {
    const record = data.levelLearning.find((l) => l.personId === personId && l.levelId === level.id);
    const tutorUnlock = data.unlockRecords.find(
      (u) => u.levelId === level.id && u.target.kind === 'person' && u.target.personId === personId,
    );
    if (!record && !tutorUnlock) return [];
    const base: LevelLearningProgress = record ?? { personId, levelId: level.id, guidesRead: 0, guidesTotal: level.guideModuleIds.length, challenge: 'not_started', attempts: 0, completed: false };
    const enabledBy = tutorUnlock ? { kind: 'tutor' as const, tutorId: tutorUnlock.tutorId, reason: tutorUnlock.reason, at: tutorUnlock.at } : base.enabledBy;
    return [{ ...base, enabledBy, levelOrder: level.order }];
  });
}

export interface ItemStat {
  questionId: string;
  moduleId: string;
  prompt: string;
  people: number;
  errorRate: number;
  /** For single choice: how many chose each option (only when the group reaches the threshold). */
  options?: { id: string; text: string; count: number; correct: boolean }[];
}

/**
 * T4, questions with more errors (F6): one row per question answered by at least the threshold of
 * distinct people of the selected cohorts, sorted by error rate. Below it, the question is not
 * shown, so nobody can be identified by their answer (F7).
 */
export function itemStats(data: TutorData, cohorts: Cohort[]): { stats: ItemStat[]; hidden: number } {
  const ids = new Set(cohorts.flatMap((c) => membersOf(data, c)).map((p) => p.id));
  const byQuestion = new Map<string, typeof data.itemResponses>();
  for (const r of data.itemResponses) {
    if (!ids.has(r.personId)) continue;
    byQuestion.set(r.questionId, [...(byQuestion.get(r.questionId) ?? []), r]);
  }
  const stats: ItemStat[] = [];
  let hidden = 0;
  for (const [questionId, responses] of byQuestion) {
    const q = BANK.find((b) => b.id === questionId);
    if (!q) continue;
    const result = aggregate(
      responses,
      (list) => ({
        errorRate: list.filter((r) => !r.correct).length / list.length,
        options:
          'options' in q && 'correctOptionIds' in q
            ? q.options.map((o) => ({ id: o.id, text: o.text, count: list.filter((r) => r.optionIds?.includes(o.id)).length, correct: q.correctOptionIds.includes(o.id) }))
            : undefined,
      }),
      { threshold: threshold(data), idOf: (r) => r.personId },
    );
    if (result.status !== 'ok') {
      hidden += 1;
      continue;
    }
    stats.push({ questionId, moduleId: q.moduleId, prompt: q.prompt, people: result.count, ...result.value });
  }
  return { stats: stats.sort((a, b) => b.errorRate - a.errorRate || b.people - a.people), hidden };
}

export const moduleTitle = (moduleId: string) => MODULES.find((m) => m.id === moduleId)?.title ?? moduleId;
export const moduleOrder = (moduleId: string) => MODULES.find((m) => m.id === moduleId)?.order ?? 0;

/** Weekly challenges of a cohort with their results (the tutor sees the result, never the reflection, F5). */
export function weeklyOf(data: TutorData, cohort: Cohort) {
  const active = membersOf(data, cohort).filter((p) => p.status === 'active');
  return data.weeklyChallenges
    .filter((w) => w.cohortId === cohort.id)
    .sort((a, b) => b.dueDate.localeCompare(a.dueDate))
    .map((w) => {
      const reports = data.weeklyReports.filter((r) => r.challengeId === w.id && active.some((p) => p.id === r.personId));
      return {
        challenge: w,
        daysLeft: daysUntil(w.dueDate),
        done: reports.filter((r) => r.result === 'done').length,
        partial: reports.filter((r) => r.result === 'partial').length,
        notDone: reports.filter((r) => r.result === 'not_done').length,
        pending: active.length - reports.length,
      };
    });
}
