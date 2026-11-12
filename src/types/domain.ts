/**
 * Data model (CLAUDE.md 7), with the adjustments approved in phase A: WeeklyChallenge and
 * LevelChallenge (D-57), level progress visible to the tutor without lock state (D-58) and
 * Conocerte habits that never leave the browser (D-62). Money is always a decimal string.
 */

export type Role = 'ld_admin' | 'tutor' | 'participant' | 'sponsor';
export type Dimension = 'budget' | 'savings' | 'debt' | 'inflation_rates' | 'goals';
export type Level = 'beginner' | 'intermediate' | 'advanced';
/** Decimal amount as text, for example "150000.00". Never a JS number. */
export type MoneyString = string;
/** ISO date (AAAA-MM-DD) or date-time. */
export type IsoDate = string;

export interface Organization {
  id: string;
  name: string;
  logoUrl?: string;
  /** Minimum 5 (F1). */
  privacyThreshold: number;
}

// Ready for the future corporate academy: Academy > Program > Module > Lesson.
export interface Program {
  id: string;
  orgId: string;
  academyId?: string;
  name: string;
  description: string;
  mode: 'voluntary' | 'assigned';
  startDate: IsoDate;
  moduleIds: string[];
  requiredModuleIds: string[];
  /** Fraction, 0.7 by default. */
  passingScore: number;
  maxAttempts: number;
  reminderChannels: ('email' | 'teams' | 'slack')[];
  /** Admin free mode: everything unlocked (5.0). */
  freeMode: boolean;
}

export type Device = 'desktop' | 'mobile';

export interface Person {
  id: string;
  orgId: string;
  role: Role;
  name: string;
  /** Always a .demo domain. */
  email: string;
  jobOrProgram: string;
  area: Area;
  cohortIds: string[];
  status: 'invited' | 'active' | 'inactive';
  /** Main device, to show office and operational staff (4.1). */
  device: Device;
  invitedAt: IsoDate;
  activatedAt?: IsoDate;
}

export type Area = 'operations' | 'administration' | 'technology' | 'commercial';

export interface Cohort {
  id: string;
  orgId: string;
  name: string;
  tutorId: string;
  area: Area;
  moduleIds: string[];
  startDate: IsoDate;
  dueDate?: IsoDate;
}

export interface ModuleMeta {
  id: string;
  order: number;
  title: string;
  /** Observable verb (Bloom). */
  objective: string;
  dimension: Dimension;
  levelId: string;
  phase: 'A' | 'B';
  /** Content source codes (T, A-xx, B-xx, Annex C or D). */
  sources: string[];
  review: 'validated' | 'extension_pending' | 'mixed';
}

export type LevelSection = 'open_account' | 'account' | 'pay' | 'budget' | 'pockets' | 'credit' | 'yield' | 'invest' | 'crypto';

export type UnlockCondition =
  | { type: 'level_completed'; levelId: string }
  | { type: 'mission_completed'; missionId: string }
  | { type: 'challenge_passed'; challengeId: string; minScore: number }
  | {
      type: 'wallet_metric';
      metric: 'categorized_movements' | 'months_closed_green' | 'emergency_months' | 'high_rate_debt' | 'emergency_pocket';
      op: '>=' | '<=' | '==';
      value: string;
    }
  | { type: 'investor_profile_done' }
  | { type: 'first_sign_in' };

export interface LevelDef {
  id: string;
  order: number;
  section: LevelSection;
  phase: 'A' | 'B';
  guideModuleIds: string[];
  missionIds: string[];
  toolSimIds: string[];
  unlock: { all: UnlockCondition[] };
  challengeId?: string;
  masteryChallengeId?: string;
}

/** Level state. Lives in the person's browser; never sent to the tutor's view (D-58). */
export type LevelLockState = 'locked' | 'unlocked' | 'completed';

export interface LevelProgress {
  personId: string;
  levelId: string;
  status: LevelLockState;
  unlockedBy?: 'rule' | 'mastery' | 'tutor' | 'admin_free_mode' | 'demo';
  reason?: string;
  at?: IsoDate;
}

/**
 * What the tutor may see about a level (D-58): learning progress only. There is no lock state and
 * no wallet condition in this type on purpose.
 */
export interface LevelLearningProgress {
  personId: string;
  levelId: string;
  guidesRead: number;
  guidesTotal: number;
  challenge: 'not_started' | 'in_progress' | 'passed' | 'attempts_exhausted';
  bestScore?: number;
  firstScore?: number;
  attempts: number;
  enabledBy?: { kind: 'mastery' } | { kind: 'tutor'; tutorId: string; reason: string; at: IsoDate };
  completed: boolean;
}

/** Tutor enabling a level with a reason (5.0). Recorded with date and author. */
export interface LevelUnlockRecord {
  id: string;
  levelId: string;
  target: { kind: 'person'; personId: string } | { kind: 'cohort'; cohortId: string };
  tutorId: string;
  reason: string;
  at: IsoDate;
}

export type QuestionType =
  | 'single'
  | 'multiple'
  | 'true_false_why'
  | 'numeric'
  | 'ordering'
  | 'matching'
  | 'categorize'
  | 'branching'
  | 'simulator_task';

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  dimension?: Dimension;
  options?: { id: string; text: string }[];
  /** Absent in habit questions. */
  correctOptionIds?: string[];
  numeric?: { answer: string; tolerance: string; unit: 'ARS' | 'percent' | 'months' };
  ordering?: { items: { id: string; text: string }[]; correctOrder: string[] };
  matching?: { left: { id: string; text: string }[]; right: { id: string; text: string }[]; pairs: [string, string][] };
  categorize?: { categories: { id: string; label: string }[]; items: { id: string; text: string; categoryId: string }[] };
  branching?: {
    startNodeId: string;
    nodes: Record<string, { text: string; choices: { text: string; next?: string; outcome?: string }[] }>;
  };
  simulatorTask?: { simId: string; preset?: Record<string, string>; answer: string; tolerance: string };
  feedback: Record<string, string>;
}

export interface LevelChallenge {
  id: string;
  levelId: string;
  mastery: boolean;
  questionsPerModule: Record<string, number>;
  passingScore: number;
  maxAttempts?: number;
}

export interface ChallengeAttempt {
  personId: string;
  challengeId: string;
  number: number;
  /** Fraction from 0 to 1. */
  score: number;
  /** Per module, for the module badges (D-57). */
  moduleScores: Record<string, number>;
  startedAt: IsoDate;
  finishedAt: IsoDate;
}

/** Item statistics for the tutor (T4), always aggregated with the threshold. */
export interface ItemResponse {
  personId: string;
  challengeId: string;
  questionId: string;
  correct: boolean;
  optionIds?: string[];
}

/**
 * Knowledge part of Conocerte only (D-62): habit answers never leave the browser and are not in
 * this type.
 */
export interface DiagnosticKnowledgeResult {
  personId: string;
  kind: 'initial' | 'final';
  takenAt: IsoDate;
  /** Fraction from 0 to 1 per dimension, knowledge questions only. */
  scores: Record<Dimension, number>;
}

export interface GuideProgress {
  personId: string;
  moduleId: string;
  guideIdsDone: string[];
  satisfaction?: 1 | 2 | 3 | 4 | 5;
  completedAt?: IsoDate;
}

/** Missions are shared only as aggregated counts per cohort (5.3). */
export interface MissionCompletion {
  personId: string;
  missionId: string;
  attempts: number;
  completedAt?: IsoDate;
}

export interface WeeklyChallenge {
  id: string;
  cohortId: string;
  title: string;
  assignedAt: IsoDate;
  dueDate: IsoDate;
}

/** The reflection stays in the person's browser; only the result is shared (F5). */
export interface WeeklyChallengeReport {
  challengeId: string;
  personId: string;
  result: 'done' | 'partial' | 'not_done';
  reportedAt: IsoDate;
}

export interface FollowUp30 {
  personId: string;
  answeredAt: IsoDate;
  applied: { budget: boolean; emergencyFund: boolean; fullCardPayment: boolean };
}

export interface TutorQuestion {
  id: string;
  personId: string;
  cohortId: string;
  moduleId: string;
  text: string;
  askedAt: IsoDate;
  answer?: { text: string; answeredAt: IsoDate };
}

// Only in the participant's browser, never in metrics or other roles' views:
export interface LocalScenario {
  id: string;
  simId: string;
  name: string;
  inputs: Record<string, string>;
  savedAt: IsoDate;
}
export interface LocalGoal {
  id: string;
  name: string;
  currentPrice: MoneyString;
  months: number;
  contributions: { date: IsoDate; amount: MoneyString }[];
}

export interface ScenarioPreset {
  id: 'low' | 'medium' | 'high';
  label: string;
  monthlyInflation: string;
  exampleRates: Record<'remunerated' | 'moneyMarket' | 'fixedTerm' | 'uvaExtra' | 'card' | 'personalLoan', string>;
  note: 'example';
}

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  sourceIds: string[];
}

export interface OfficialSource {
  id: string;
  name: string;
  url: string;
  verifiedAt: IsoDate;
}

/** Annex C: one row per registered agent, informative only (D-22). */
export interface BrokerEntry {
  nombreComercial: string;
  razonSocial: string;
  categoria: string;
  matricula: string;
  fuente: string;
  verificadoEl: IsoDate;
  /** Dated context shown in the card, for example an announced merger (Annex C). */
  nota?: string;
  /** AAAA-MM of the note. */
  notaFecha?: string;
}

/** Annex D: wallets and fintech classified by the kind of account they give you (D-26). */
export interface FintechEntry {
  nombreComercial: string;
  razonSocial: string;
  tipo: 'psp_cuenta_pago' | 'entidad_financiera' | 'iniciador' | 'psav';
  registro: string;
  fuente: string;
  verificadoEl: IsoDate;
  nota?: string;
}

// ---------- Access and session (F0, step 5). Simulated: no tokens, no real passwords. ----------

export type AuthMethod = 'sso_microsoft' | 'sso_google' | 'password';

export interface Session {
  personId: string;
  role: Role;
  method: AuthMethod;
  /** 'login' from the access screens, 'switch' from "Ver como" (no second step, F0). */
  via: 'login' | 'switch';
  startedAt: IsoDate;
  lastActivityAt: IsoDate;
}

export type AccessRequestReason = 'locked' | 'forgot_password' | 'mfa_issue' | 'other';

/** G4: a request to the company's help desk. No self-service and no IT role in the MVP. */
export interface AccessRequest {
  id: string;
  email: string;
  createdAt: IsoDate;
  reason: AccessRequestReason;
  comment?: string;
  status: 'new';
}

/** G5: acceptance of the privacy notice, with its version. */
export interface ConsentRecord {
  personId: string;
  version: string;
  acceptedAt: IsoDate;
}
