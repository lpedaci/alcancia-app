import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import seed from '@/data/seed.json';
import type {
  AccessRequest,
  ChallengeAttempt,
  ConsentRecord,
  Cohort,
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

/**
 * Shared demo data of the organization (CLAUDE.md 7): what a backend would hold. LEARNING data
 * only: wallet data, Conocerte habits, reflections and level lock states live in each
 * participant's local store (`local-store.ts`) and never here (D-58, D-62).
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
  /** G4: requests to the help desk (no self-service, F0). */
  accessRequests: AccessRequest[];
  /** G5: accepted privacy notices, with their version. */
  consents: ConsentRecord[];
}

export function seedData(): OrgData {
  // A deep copy, so a reset never shares references with the imported JSON.
  const copy = structuredClone(seed) as unknown as OrgData & { generatedFor?: string; note?: string };
  delete copy.generatedFor;
  delete copy.note;
  return { ...copy, accessRequests: [], consents: [] };
}

interface DataState extends OrgData {
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
  /** O4: program configuration (the threshold never goes below 5, F1). */
  updateProgram: (program: Program, privacyThreshold: number) => void;
  /** O2 and O3: people added one by one or by CSV, always invited first (F8). */
  addPeople: (people: Person[]) => void;
  /** O2: a new cohort with its tutor and deadline (F8). */
  addCohort: (cohort: Cohort) => void;
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
      addUnlockRecord: (record) => set((state) => ({ unlockRecords: [...state.unlockRecords, record] })),
      updateProgram: (program, privacyThreshold) =>
        set((state) => ({ program, organization: { ...state.organization, privacyThreshold: Math.max(5, Math.floor(privacyThreshold)) } })),
      addPeople: (people) => set((state) => ({ people: [...state.people, ...people] })),
      addCohort: (cohort) => set((state) => ({ cohorts: [...state.cohorts, cohort] })),
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
      version: 1,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const personById = (people: Person[], id: string) => people.find((p) => p.id === id);
