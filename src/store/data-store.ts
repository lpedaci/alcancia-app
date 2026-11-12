import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import seed from '@/data/seed.json';
import type {
  ChallengeAttempt,
  Cohort,
  DiagnosticKnowledgeResult,
  FollowUp30,
  GuideProgress,
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
  levelLearning: LevelLearningProgress[];
  unlockRecords: LevelUnlockRecord[];
  missionCompletions: MissionCompletion[];
  weeklyChallenges: WeeklyChallenge[];
  weeklyReports: WeeklyChallengeReport[];
  followUps: FollowUp30[];
  tutorQuestions: TutorQuestion[];
}

export function seedData(): OrgData {
  // A deep copy, so a reset never shares references with the imported JSON.
  const copy = structuredClone(seed) as unknown as OrgData & { generatedFor?: string; note?: string };
  delete copy.generatedFor;
  delete copy.note;
  return copy;
}

interface DataState extends OrgData {
  /** "Restablecer demo" (CLAUDE.md 7): back to the seed. */
  resetData: () => void;
}

export const DATA_STORAGE_KEY = 'alcancia-data';

export const useDataStore = create<DataState>()(
  persist(
    (set) => ({
      ...seedData(),
      resetData: () => set(seedData()),
    }),
    {
      name: DATA_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const personById = (people: Person[], id: string) => people.find((p) => p.id === id);
