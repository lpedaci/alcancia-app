import levels from '@/data/levels.json';
import missionsJson from '@/data/wallet-missions.json';
import modules from '@/data/modules.json';
import type { OrgData } from '@/store/data-store';

/**
 * Activity log in the shape of xAPI statements (CLAUDE.md F21, D-272): "actor, verb, object", as an
 * LRS or a corporate LMS would receive them. Built ONLY from the learning data the organization
 * already holds (guides, challenges, missions, Conocerte, weekly challenges, levels completed): no
 * wallet data, no amounts, no habit answers, no decisions inside the wallet and no lock states
 * (D-58, D-62). The actor is a pseudonym: the admin sees aggregated learning, never one person (4.2).
 */

export const XAPI_VERBS = {
  completed: 'http://adlnet.gov/expapi/verbs/completed',
  passed: 'http://adlnet.gov/expapi/verbs/passed',
  failed: 'http://adlnet.gov/expapi/verbs/failed',
  attempted: 'http://adlnet.gov/expapi/verbs/attempted',
} as const;
export type XapiVerb = keyof typeof XAPI_VERBS;

export type XapiObjectType = 'guide' | 'challenge' | 'mission' | 'diagnostic' | 'weekly-challenge' | 'level';

export interface XapiStatement {
  id: string;
  actor: { account: { homePage: string; name: string } };
  verb: { id: string; display: { 'en-US': XapiVerb } };
  object: { id: string; definition: { type: XapiObjectType; name: { 'es-AR': string } } };
  result?: { success?: boolean; completion?: boolean; score?: { scaled: number }; response?: 'done' | 'partial' | 'not_done' };
  timestamp: string;
  context: { platform: 'Alcancía'; extensions: { 'https://alcancia.demo/xapi/organization': string } };
}

const ACTIVITY = 'https://alcancia.demo/xapi/activities';
const HOME = 'https://alcancia.demo';

/** A stable pseudonym per person and organization ("Persona 7F3A0C"), never the name or the email. */
export function pseudonym(personId: string, orgId: string): string {
  let h = 2166136261;
  for (const ch of `${orgId}:${personId}`) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return `Persona ${((h >>> 0) % 0xffffff).toString(16).toUpperCase().padStart(6, '0')}`;
}

const missionTitle = (id: string) => missionsJson.missions.find((m) => m.id === id)?.title ?? id;
const moduleTitle = (id: string) => modules.find((m) => m.id === id)?.title ?? id;
const levelOrder = (id: string) => levels.find((l) => l.id === id)?.order ?? 0;
const challengeName = (id: string) =>
  id.startsWith('mastery-') ? `Desafío de suficiencia del nivel ${levelOrder(id.replace('mastery-', ''))}` : `Desafío del nivel ${levelOrder(id.replace('challenge-', ''))}`;
const asTime = (date: string) => (date.length === 10 ? `${date}T12:00:00.000Z` : date);

function make(
  data: Pick<OrgData, 'organization'>,
  personId: string,
  verb: XapiVerb,
  type: XapiObjectType,
  objectId: string,
  name: string,
  timestamp: string,
  result?: XapiStatement['result'],
): XapiStatement {
  const orgId = data.organization.id;
  const actor = pseudonym(personId, orgId);
  return {
    // The id never carries the person's own id: only the pseudonym (D-272)
    id: `${actor.replace(' ', '-').toLowerCase()}:${verb}:${type}:${objectId}:${timestamp}`,
    actor: { account: { homePage: HOME, name: actor } },
    verb: { id: XAPI_VERBS[verb], display: { 'en-US': verb } },
    object: { id: `${ACTIVITY}/${type}/${objectId}`, definition: { type, name: { 'es-AR': name } } },
    ...(result ? { result } : {}),
    timestamp: asTime(timestamp),
    context: { platform: 'Alcancía', extensions: { 'https://alcancia.demo/xapi/organization': orgId } },
  };
}

type StatementData = Pick<
  OrgData,
  'organization' | 'program' | 'guideProgress' | 'challengeAttempts' | 'missionCompletions' | 'diagnostics' | 'weeklyChallenges' | 'weeklyReports'
>;

/** Every statement of one organization (or of one person), the newest first. */
export function deriveStatements(data: StatementData, personId?: string): XapiStatement[] {
  const mine = <T extends { personId: string }>(list: T[]) => (personId ? list.filter((x) => x.personId === personId) : list);
  const out: XapiStatement[] = [];
  for (const d of mine(data.diagnostics)) {
    out.push(make(data, d.personId, 'completed', 'diagnostic', `conocerte-${d.kind}`, d.kind === 'initial' ? 'Conocerte (inicio)' : 'Conocerte (final)', d.takenAt ?? '', { completion: true }));
  }
  for (const g of mine(data.guideProgress)) {
    for (const guideId of g.guideIdsDone) {
      out.push(make(data, g.personId, 'completed', 'guide', guideId, moduleTitle(g.moduleId), g.completedAt ?? '', { completion: true }));
    }
  }
  for (const a of mine(data.challengeAttempts)) {
    const passed = a.score >= data.program.passingScore;
    out.push(make(data, a.personId, passed ? 'passed' : 'failed', 'challenge', a.challengeId, challengeName(a.challengeId), a.finishedAt, { success: passed, score: { scaled: a.score } }));
  }
  for (const m of mine(data.missionCompletions)) {
    out.push(make(data, m.personId, 'completed', 'mission', m.missionId, missionTitle(m.missionId), m.completedAt ?? '', { completion: true, success: true }));
  }
  for (const r of mine(data.weeklyReports)) {
    const challenge = data.weeklyChallenges.find((w) => w.id === r.challengeId);
    if (!challenge) continue;
    out.push(make(data, r.personId, 'attempted', 'weekly-challenge', r.challengeId, challenge.title, r.reportedAt, { response: r.result }));
  }
  return out.filter((s) => s.timestamp).sort((a, b) => (a.timestamp < b.timestamp ? 1 : a.timestamp > b.timestamp ? -1 : 0));
}

/** How many statements of each verb: the summary the admin reads first. */
export function countByVerb(statements: XapiStatement[]): Record<XapiVerb, number> {
  const counts: Record<XapiVerb, number> = { completed: 0, passed: 0, failed: 0, attempted: 0 };
  for (const s of statements) counts[s.verb.display['en-US']] += 1;
  return counts;
}

/**
 * Events the integrated mode sends to the partner app (5.5, D-75): only milestones, with no
 * economic data and no scores. They reach Hornero inside the person's own session, where Hornero can
 * show them to that person; Hornero's product team only sees aggregated figures.
 */
export function partnerEvents(statements: XapiStatement[]): XapiStatement[] {
  return statements
    .filter((s) => (s.verb.display['en-US'] === 'completed' && (s.object.definition.type === 'mission' || s.object.definition.type === 'guide')) || s.verb.display['en-US'] === 'passed')
    .map((s) => {
      const copy = { ...s };
      delete copy.result; // no scores reach the partner
      return copy;
    });
}
