import { useMemo } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import seed from '@/data/seed.json';
import type {
  AccessRequest,
  ChallengeAttempt,
  ConsentRecord,
  Cohort,
  CohortPost,
  CollectiveGoal,
  DiagnosticKnowledgeResult,
  FollowUp30,
  GuideProgress,
  ItemResponse,
  LevelLearningProgress,
  LevelUnlockRecord,
  MissionCompletion,
  Organization,
  Person,
  Program,
  TutorQuestion,
  WeeklyChallenge,
  WeeklyChallengeReport,
} from '@/types/domain';
import { useSessionStore } from '@/store/session-store';

/**
 * One organization's demo data (CLAUDE.md 7): what a backend would hold for one tenant. LEARNING
 * data only: wallet data, Conocerte habits, reflections and level lock states live in each
 * participant's local store (`local-store.ts`) and never here (D-58, D-62). Panels and pure
 * functions work on this shape, already scoped to the viewer's organization (`useOrgData`).
 */
export interface OrgData {
  organization: Organization;
  program: Program;
  cohorts: Cohort[];
  people: Person[];
  diagnostics: DiagnosticKnowledgeResult[];
  guideProgress: GuideProgress[];
  challengeAttempts: ChallengeAttempt[];
  /** What was answered in each challenge question, for the tutor's item statistics (T4, aggregated). */
  itemResponses: ItemResponse[];
  levelLearning: LevelLearningProgress[];
  unlockRecords: LevelUnlockRecord[];
  missionCompletions: MissionCompletion[];
  weeklyChallenges: WeeklyChallenge[];
  weeklyReports: WeeklyChallengeReport[];
  followUps: FollowUp30[];
  tutorQuestions: TutorQuestion[];
  /** D-80: collective goals of the cohorts, set by their tutors. */
  collectiveGoals: CollectiveGoal[];
  /** F20: posts of each cohort's space, moderated by its tutor. */
  cohortPosts: CohortPost[];
  /** G4: requests to the help desk (no self-service, F0). */
  accessRequests: AccessRequest[];
  /** G5: accepted privacy notices, with their version. */
  consents: ConsentRecord[];
}

/**
 * The data of the three contexts of use together (5.5, D-74), as a multi-tenant backend would keep
 * it: every record belongs to one organization through its person or its cohort. Nothing crosses
 * from one organization to another: every screen reads it through `scopeToOrg`.
 */
export interface SharedData extends Omit<OrgData, 'organization' | 'program'> {
  organizations: Organization[];
  programs: Program[];
}

/** The organization of the main demo (4.1): the fallback when nobody is signed in. */
export const DEFAULT_ORG_ID = 'org-andina';

export function seedData(): SharedData {
  // A deep copy, so a reset never shares references with the imported JSON.
  const copy = structuredClone(seed) as unknown as SharedData & { generatedFor?: string; note?: string };
  delete copy.generatedFor;
  delete copy.note;
  return { ...copy, accessRequests: [], consents: [] };
}

export const organizationOf = (data: Pick<SharedData, 'organizations'>, orgId: string): Organization =>
  data.organizations.find((o) => o.id === orgId) ?? data.organizations[0]!;
export const programOf = (data: Pick<SharedData, 'programs'>, orgId: string): Program =>
  data.programs.find((p) => p.orgId === orgId) ?? data.programs[0]!;
export const orgIdOfPerson = (data: Pick<SharedData, 'people'>, personId: string | undefined): string =>
  data.people.find((p) => p.id === personId)?.orgId ?? DEFAULT_ORG_ID;

/** One organization's slice of the shared data: its people, its cohorts and their records. */
export function scopeToOrg(data: SharedData, orgId: string): OrgData {
  const people = data.people.filter((p) => p.orgId === orgId);
  const ids = new Set(people.map((p) => p.id));
  const cohorts = data.cohorts.filter((c) => c.orgId === orgId);
  const cohortIds = new Set(cohorts.map((c) => c.id));
  const mine = <T extends { personId: string }>(list: T[]) => list.filter((x) => ids.has(x.personId));
  return {
    organization: organizationOf(data, orgId),
    program: programOf(data, orgId),
    cohorts,
    people,
    diagnostics: mine(data.diagnostics),
    guideProgress: mine(data.guideProgress),
    challengeAttempts: mine(data.challengeAttempts),
    itemResponses: mine(data.itemResponses),
    levelLearning: mine(data.levelLearning),
    unlockRecords: data.unlockRecords.filter((r) => (r.target.kind === 'person' ? ids.has(r.target.personId) : cohortIds.has(r.target.cohortId))),
    missionCompletions: mine(data.missionCompletions),
    weeklyChallenges: data.weeklyChallenges.filter((w) => cohortIds.has(w.cohortId)),
    weeklyReports: mine(data.weeklyReports),
    followUps: mine(data.followUps),
    tutorQuestions: mine(data.tutorQuestions),
    // `?? []`: a browser with demo data saved before step 26 has neither list
    collectiveGoals: (data.collectiveGoals ?? []).filter((g) => cohortIds.has(g.cohortId)),
    cohortPosts: (data.cohortPosts ?? []).filter((p) => cohortIds.has(p.cohortId)),
    accessRequests: data.accessRequests,
    consents: mine(data.consents),
  };
}

/** Seed data of one organization, for tests and pure functions (Andina by default). */
export const seedOrgData = (orgId = DEFAULT_ORG_ID): OrgData => scopeToOrg(seedData(), orgId);

interface DataState extends SharedData {
  /** "Restablecer demo" (CLAUDE.md 7): back to the seed. */
  resetData: () => void;
  addAccessRequest: (request: AccessRequest) => void;
  acceptConsent: (record: ConsentRecord) => void;
  /** Conocerte knowledge scores only (D-62): one initial and one final per person, the last one wins. */
  saveDiagnostic: (result: DiagnosticKnowledgeResult) => void;
  /** A finished mission run: learning data the tutor sees aggregated (5.3), never the wallet. */
  recordMission: (personId: string, missionId: string, at: string) => void;
  /** A guide read (P10), with the optional satisfaction of Kirkpatrick 1 (RF-49). */
  markGuideDone: (personId: string, moduleId: string, guideId: string, at: string, satisfaction?: GuideProgress['satisfaction']) => void;
  /** A challenge attempt (P11, D-57): the best one counts, the first one shows what the person knew. */
  addChallengeAttempt: (attempt: ChallengeAttempt, items?: ItemResponse[]) => void;
  /** T3: a weekly challenge for a cohort (F5). */
  assignWeeklyChallenge: (challenge: WeeklyChallenge) => void;
  /** F5: the participant's self-report of a weekly challenge; only the result is shared, the reflection stays local. */
  reportWeeklyChallenge: (report: WeeklyChallengeReport) => void;
  /** F6: a participant's question about a module, for the tutor's inbox (T5). */
  askQuestion: (question: TutorQuestion) => void;
  /** T5: the tutor's answer to a question about a module (never economic data). */
  answerQuestion: (questionId: string, text: string, at: string) => void;
  /** T2: the tutor enables a level for a person or a cohort, with a reason that is recorded (5.0). */
  addUnlockRecord: (record: LevelUnlockRecord) => void;
  /** D-80: a tutor sets (or replaces) the collective goal of a cohort. */
  setCollectiveGoal: (goal: CollectiveGoal) => void;
  /** F20: a post or a reply in the cohort's space. */
  addPost: (post: CohortPost) => void;
  /** F20: the tutor moderates: endorse a reply, or hide a post with a reason. */
  moderatePost: (postId: string, patch: Pick<CohortPost, 'endorsed' | 'hidden'>) => void;
  /** O4: program configuration (the threshold never goes below 5, F1). */
  updateProgram: (program: Program, privacyThreshold: number) => void;
  /** O2 and O3: people added one by one or by CSV, always invited first (F8). */
  addPeople: (people: Person[]) => void;
  /** O2 (D-238): edit a person's data, or change their status (reactivate, deactivate). */
  updatePerson: (personId: string, patch: Partial<Pick<Person, 'name' | 'email' | 'jobOrProgram' | 'cohortIds' | 'status'>>) => void;
  /** O2 (D-238): remove a person from the program; their learning records leave the aggregates too. */
  removePerson: (personId: string) => void;
  /** O2: a new cohort with its tutor and deadline (F8). */
  addCohort: (cohort: Cohort) => void;
  /** O2 (D-238): edit a cohort's name, tutor or deadline. */
  updateCohort: (cohortId: string, patch: Partial<Pick<Cohort, 'name' | 'tutorId' | 'dueDate'>>) => void;
  /** O2 (D-238): remove an empty cohort (a cohort with people is never removed). */
  removeCohort: (cohortId: string) => void;
  /** O4: due dates per cohort when the program is assigned (F1). */
  setCohortDueDates: (dueDates: Record<string, string | undefined>) => void;
}

export const DATA_STORAGE_KEY = 'alcancia-data';

export const useDataStore = create<DataState>()(
  persist(
    (set) => ({
      ...seedData(),
      resetData: () => set(seedData()),
      addAccessRequest: (request) => set((state) => ({ accessRequests: [...state.accessRequests, request] })),
      acceptConsent: (record) =>
        set((state) => ({
          consents: [...state.consents.filter((c) => c.personId !== record.personId), record],
        })),
      saveDiagnostic: (result) =>
        set((state) => ({
          diagnostics: [...state.diagnostics.filter((d) => !(d.personId === result.personId && d.kind === result.kind)), result],
        })),
      recordMission: (personId, missionId, at) =>
        set((state) => {
          const previous = state.missionCompletions.find((m) => m.personId === personId && m.missionId === missionId);
          const others = state.missionCompletions.filter((m) => m !== previous);
          return {
            missionCompletions: [
              ...others,
              { personId, missionId, attempts: (previous?.attempts ?? 0) + 1, completedAt: previous?.completedAt ?? at },
            ],
          };
        }),
      markGuideDone: (personId, moduleId, guideId, at, satisfaction) =>
        set((state) => {
          const previous = state.guideProgress.find((g) => g.personId === personId && g.moduleId === moduleId);
          const others = state.guideProgress.filter((g) => g !== previous);
          const guideIdsDone = [...new Set([...(previous?.guideIdsDone ?? []), guideId])];
          return {
            guideProgress: [
              ...others,
              { personId, moduleId, guideIdsDone, completedAt: previous?.completedAt ?? at, satisfaction: satisfaction ?? previous?.satisfaction },
            ],
          };
        }),
      addChallengeAttempt: (attempt, items = []) =>
        set((state) => ({ challengeAttempts: [...state.challengeAttempts, attempt], itemResponses: [...state.itemResponses, ...items] })),
      assignWeeklyChallenge: (challenge) => set((state) => ({ weeklyChallenges: [...state.weeklyChallenges, challenge] })),
      reportWeeklyChallenge: (report) =>
        set((state) => ({
          weeklyReports: [...state.weeklyReports.filter((r) => !(r.challengeId === report.challengeId && r.personId === report.personId)), report],
        })),
      askQuestion: (question) => set((state) => ({ tutorQuestions: [...state.tutorQuestions, question] })),
      answerQuestion: (questionId, text, at) =>
        set((state) => ({
          tutorQuestions: state.tutorQuestions.map((q) => (q.id === questionId ? { ...q, answer: { text, answeredAt: at } } : q)),
        })),
      setCollectiveGoal: (goal) =>
        set((state) => ({ collectiveGoals: [...state.collectiveGoals.filter((g) => g.cohortId !== goal.cohortId || g.dueDate < goal.createdAt), goal] })),
      addPost: (post) => set((state) => ({ cohortPosts: [...state.cohortPosts, post] })),
      moderatePost: (postId, patch) => set((state) => ({ cohortPosts: state.cohortPosts.map((p) => (p.id === postId ? { ...p, ...patch } : p)) })),
      addUnlockRecord: (record) => set((state) => ({ unlockRecords: [...state.unlockRecords, record] })),
      updateProgram: (program, privacyThreshold) =>
        set((state) => ({
          programs: state.programs.map((p) => (p.id === program.id ? program : p)),
          organizations: state.organizations.map((o) =>
            o.id === program.orgId ? { ...o, privacyThreshold: Math.max(5, Math.floor(privacyThreshold)) } : o,
          ),
        })),
      addPeople: (people) => set((state) => ({ people: [...state.people, ...people] })),
      updatePerson: (personId, patch) => set((state) => ({ people: state.people.map((p) => (p.id === personId ? { ...p, ...patch } : p)) })),
      removePerson: (personId) =>
        set((state) => ({
          people: state.people.filter((p) => p.id !== personId),
          guideProgress: state.guideProgress.filter((g) => g.personId !== personId),
          challengeAttempts: state.challengeAttempts.filter((a) => a.personId !== personId),
          itemResponses: state.itemResponses.filter((i) => i.personId !== personId),
          levelLearning: state.levelLearning.filter((l) => l.personId !== personId),
          missionCompletions: state.missionCompletions.filter((m) => m.personId !== personId),
          weeklyReports: state.weeklyReports.filter((w) => w.personId !== personId),
          followUps: state.followUps.filter((f) => f.personId !== personId),
          diagnostics: state.diagnostics.filter((d) => d.personId !== personId),
          cohortPosts: state.cohortPosts.filter((p) => p.personId !== personId),
        })),
      addCohort: (cohort) => set((state) => ({ cohorts: [...state.cohorts, cohort] })),
      updateCohort: (cohortId, patch) =>
        set((state) => ({
          cohorts: state.cohorts.map((c) => {
            if (c.id !== cohortId) return c;
            const next = { ...c, ...patch };
            if (!next.dueDate) delete next.dueDate;
            return next;
          }),
        })),
      removeCohort: (cohortId) =>
        set((state) =>
          state.people.some((p) => p.role === 'participant' && p.cohortIds.includes(cohortId)) ? {} : { cohorts: state.cohorts.filter((c) => c.id !== cohortId) },
        ),
      setCohortDueDates: (dueDates) =>
        set((state) => ({
          cohorts: state.cohorts.map((c) => {
            if (!(c.id in dueDates)) return c;
            const next = { ...c, dueDate: dueDates[c.id] };
            if (!next.dueDate) delete next.dueDate;
            return next;
          }),
        })),
    }),
    {
      name: DATA_STORAGE_KEY,
      // Version 2 (step 23, D-268): three organizations. Older demo data goes back to the seed,
      // keeping only the accepted privacy notices and the help desk requests.
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted, version) => {
        const old = (persisted ?? {}) as Partial<SharedData>;
        if (version >= 2) return persisted as DataState;
        return { ...seedData(), consents: old.consents ?? [], accessRequests: old.accessRequests ?? [] } as unknown as DataState;
      },
    },
  ),
);

export const personById = (people: Person[], id: string) => people.find((p) => p.id === id);

/** The organization of the signed-in person (Andina when nobody is signed in). */
export function useOrgId(): string {
  const personId = useSessionStore((s) => s.session?.personId);
  return useDataStore((s) => orgIdOfPerson(s, personId));
}

export function useOrganization(): Organization {
  const orgId = useOrgId();
  return useDataStore((s) => organizationOf(s, orgId));
}

export function useProgram(): Program {
  const orgId = useOrgId();
  return useDataStore((s) => programOf(s, orgId));
}

/** The viewer's organization only (5.5): no screen sees another organization's people or records. */
export function useOrgData(): OrgData {
  const orgId = useOrgId();
  const state = useDataStore();
  return useMemo(() => scopeToOrg(state, orgId), [state, orgId]);
}

