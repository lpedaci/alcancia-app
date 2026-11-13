import { DEMO_TODAY } from '@/app/config';
import { aggregate, type Aggregate, average, breakdown, type BreakdownResult, share } from '@/lib/metrics';
import type { OrgData } from '@/store/data-store';
import type { Dimension, Person } from '@/types/domain';

/**
 * Metrics of the admin's panel (O1) and the sponsor's impact report (D1), CLAUDE.md F7, D-195:
 * computed from the organization's learning data, never written by hand, and always aggregated with
 * the privacy threshold (`aggregate`, `breakdown` with complementary suppression). Measured with
 * Kirkpatrick: 1 reaction (satisfaction), 2 learning (knowledge questions of Conocerte before and
 * after, D-62, and level challenges), 3 behavior (30-day self-report and weekly challenges). Level 4
 * stays as a future line: no business data is invented.
 */
export type OrgMetricsData = Pick<
  OrgData,
  'organization' | 'program' | 'cohorts' | 'people' | 'diagnostics' | 'guideProgress' | 'challengeAttempts' | 'levelLearning' | 'weeklyChallenges' | 'weeklyReports' | 'followUps'
>;

export const DIMENSIONS: Dimension[] = ['budget', 'savings', 'debt', 'inflation_rates', 'goals'];
const DAY = 86400000;

export const participantsOf = (data: OrgMetricsData) => data.people.filter((p) => p.role === 'participant');
const opts = (data: OrgMetricsData) => ({ threshold: data.organization.privacyThreshold });

export interface Adoption {
  invited: Aggregate<number>;
  active: Aggregate<number>;
  activeShare: Aggregate<number>;
  diagnosed: Aggregate<number>;
  diagnosedShare: Aggregate<number>;
  modulesShare: Aggregate<number>;
}

const diagnosedIds = (data: OrgMetricsData) => new Set(data.diagnostics.filter((d) => d.kind === 'initial').map((d) => d.personId));

/** Share of the program's modules with their guide read, for one person. */
function moduleShare(data: OrgMetricsData, person: Person): number {
  const done = new Set(data.guideProgress.filter((g) => g.personId === person.id && g.guideIdsDone.length > 0).map((g) => g.moduleId));
  const modules = data.program.moduleIds;
  return modules.length ? modules.filter((m) => done.has(m)).length / modules.length : 0;
}

export function adoption(data: OrgMetricsData, people = participantsOf(data)): Adoption {
  const o = opts(data);
  const diagnosed = diagnosedIds(data);
  return {
    invited: aggregate(people, (list) => list.length, o),
    active: aggregate(people, (list) => list.filter((p) => p.status === 'active').length, o),
    activeShare: aggregate(people, (list) => share(list, (p) => p.status === 'active') ?? 0, o),
    diagnosed: aggregate(people, (list) => list.filter((p) => diagnosed.has(p.id)).length, o),
    diagnosedShare: aggregate(people, (list) => share(list, (p) => diagnosed.has(p.id)) ?? 0, o),
    modulesShare: aggregate(people, (list) => average(list.filter((p) => p.status === 'active').map((p) => moduleShare(data, p))) ?? 0, o),
  };
}

/** Adoption by cohort (O1): the parts below the threshold are hidden, with complementary suppression. */
export function adoptionByCohort(data: OrgMetricsData): BreakdownResult<{ active: number; diagnosed: number; modules: number }> {
  const diagnosed = diagnosedIds(data);
  return breakdown(
    data.cohorts.map((c) => {
      const people = participantsOf(data).filter((p) => p.cohortIds.includes(c.id));
      return {
        key: c.id,
        people: people.length,
        value: {
          active: share(people, (p) => p.status === 'active') ?? 0,
          diagnosed: share(people, (p) => diagnosed.has(p.id)) ?? 0,
          modules: average(people.filter((p) => p.status === 'active').map((p) => moduleShare(data, p))) ?? 0,
        },
      };
    }),
    data.organization.privacyThreshold,
  );
}

/** Guides read per week in the last `weeks` weeks, for the activity sparkline (counts, not people). */
export function weeklyActivity(data: OrgMetricsData, weeks = 8): number[] {
  const end = Date.parse(DEMO_TODAY);
  return Array.from({ length: weeks }, (_, i) => {
    const from = end - (weeks - i) * 7 * DAY;
    const to = from + 7 * DAY;
    return data.guideProgress.filter((g) => {
      if (!g.completedAt) return false;
      const at = Date.parse(g.completedAt);
      return at >= from && at < to;
    }).length;
  });
}

export interface Reaction {
  average: number;
  /** People who rated 1, 2, 3, 4 and 5 (shares). */
  distribution: number[];
}

/** Kirkpatrick 1: satisfaction with the guides, from 1 to 5. */
export function reaction(data: OrgMetricsData): Aggregate<Reaction> {
  const rated = data.guideProgress.filter((g) => g.satisfaction !== undefined);
  return aggregate(
    rated,
    (list) => ({
      average: average(list.map((g) => g.satisfaction!)) ?? 0,
      distribution: [1, 2, 3, 4, 5].map((n) => list.filter((g) => g.satisfaction === n).length / list.length),
    }),
    { ...opts(data), idOf: (g) => g.personId },
  );
}

export interface Learning {
  byDimension: { dimension: Dimension; before: number; after: number }[];
  people: number;
}

/**
 * Kirkpatrick 2 (D-62): only people with both the initial and the final Conocerte, and only its
 * knowledge questions (habit answers never leave the browser).
 */
export function learning(data: OrgMetricsData): Aggregate<Learning> {
  const finals = data.diagnostics.filter((d) => d.kind === 'final');
  const pairs = finals.flatMap((f) => {
    const initial = data.diagnostics.find((d) => d.personId === f.personId && d.kind === 'initial');
    return initial ? [{ personId: f.personId, before: initial.scores, after: f.scores }] : [];
  });
  return aggregate(
    pairs,
    (list) => ({
      people: list.length,
      byDimension: DIMENSIONS.map((dimension) => ({
        dimension,
        before: average(list.map((p) => p.before[dimension])) ?? 0,
        after: average(list.map((p) => p.after[dimension])) ?? 0,
      })),
    }),
    { ...opts(data), idOf: (p) => p.personId },
  );
}

/** Level challenges (Kirkpatrick 2): share of people who passed, on the first attempt and in the end. */
export function challengeResults(data: OrgMetricsData) {
  const levels = [...new Set(data.levelLearning.map((l) => l.levelId))].sort();
  return levels.map((levelId) => {
    const rows = data.levelLearning.filter((l) => l.levelId === levelId && l.attempts > 0);
    return {
      levelId,
      result: aggregate(
        rows,
        (list) => ({
          firstPass: share(list, (l) => (l.firstScore ?? 0) >= data.program.passingScore) ?? 0,
          passed: share(list, (l) => l.challenge === 'passed') ?? 0,
        }),
        { ...opts(data), idOf: (l) => l.personId },
      ),
    };
  });
}

export interface Behavior {
  budget: number;
  emergencyFund: number;
  fullCardPayment: number;
  people: number;
}

/** Kirkpatrick 3: the 30-day self-report ("¿Aplicaste lo aprendido?"). */
export function behavior(data: OrgMetricsData): Aggregate<Behavior> {
  return aggregate(
    data.followUps,
    (list) => ({
      people: list.length,
      budget: share(list, (f) => f.applied.budget) ?? 0,
      emergencyFund: share(list, (f) => f.applied.emergencyFund) ?? 0,
      fullCardPayment: share(list, (f) => f.applied.fullCardPayment) ?? 0,
    }),
    { ...opts(data), idOf: (f) => f.personId },
  );
}

/** Weekly challenges done, among the reports of challenges already closed (Kirkpatrick 3). */
export function weeklyDone(data: OrgMetricsData): Aggregate<number> {
  const closed = new Set(data.weeklyChallenges.filter((w) => w.dueDate <= DEMO_TODAY).map((w) => w.id));
  const reports = data.weeklyReports.filter((r) => closed.has(r.challengeId));
  return aggregate(reports, (list) => share(list, (r) => r.result === 'done') ?? 0, { ...opts(data), idOf: (r) => r.personId });
}

export type OrgAlertKind = 'invited' | 'low_adoption' | 'due_soon' | 'hidden';
export interface OrgAlert {
  kind: OrgAlertKind;
  count: number;
  cohortId?: string;
  days?: number;
}

/** Alerts of the admin (O1): invitations not accepted, cohorts with low adoption, deadlines, hidden groups. */
export function orgAlerts(data: OrgMetricsData): OrgAlert[] {
  const out: OrgAlert[] = [];
  const invited = participantsOf(data).filter((p) => p.status === 'invited').length;
  if (invited >= data.organization.privacyThreshold) out.push({ kind: 'invited', count: invited });
  const parts = adoptionByCohort(data);
  for (const part of parts) {
    if (part.result.status === 'ok' && part.result.value.active < 0.75) out.push({ kind: 'low_adoption', count: Math.round(part.result.value.active * 100), cohortId: part.key });
  }
  const dates = [...new Set(data.cohorts.map((c) => c.dueDate).filter(Boolean) as string[])];
  for (const date of dates) {
    const days = Math.round((Date.parse(date) - Date.parse(DEMO_TODAY)) / DAY);
    if (days >= 0 && days <= 45) out.push({ kind: 'due_soon', count: data.cohorts.filter((c) => c.dueDate === date).length, days });
  }
  const hidden = parts.filter((p) => p.result.status !== 'ok').length;
  if (hidden) out.push({ kind: 'hidden', count: hidden });
  return out;
}
