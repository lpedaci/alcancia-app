import type { WalletMetrics } from '@/features/wallet/engine/types';
import { D } from '@/lib/finance';
import type { LevelDef, LevelLockState, LevelProgress, UnlockCondition } from '@/types/domain';

/**
 * Level and unlock engine (CLAUDE.md 5.0). Pure: it receives what the person has done (learning
 * data, wallet metrics computed in her browser, the investor profile test) and returns, for each
 * level, whether it is locked, unlocked or completed and what is missing, with progress.
 * The lock state stays in the person's browser and never reaches the tutor (D-58).
 */
export interface LevelContext {
  /** Missions completed (learning data). */
  completedMissionIds: string[];
  /** Best score of each challenge (level challenges and mastery challenges), as a fraction. */
  bestScores: Record<string, number>;
  /** Modules with their phase A guide read (D-61: one guide per module). */
  guidesRead: string[];
  /** "Conocerte" done (part of level 0). */
  conocerteDone: boolean;
  metrics: WalletMetrics;
  /** D-67: the educational investor profile test, available before Invertir opens. */
  investorProfileDone: boolean;
  /** Levels a tutor enabled for the person or her cohort, with the reason (5.0, D-58). */
  tutorUnlocks: Record<string, string>;
  /** Levels already unlocked before: nothing is lost (5.0), even if a wallet metric drops later. */
  previouslyUnlocked: string[];
  passingScore: number;
  /** Admin free mode (5.0) and the portfolio demo mode "Ver todo desbloqueado". */
  freeMode: boolean;
  demoUnlockAll: boolean;
}

export interface ConditionStatus {
  condition: UnlockCondition;
  met: boolean;
  /** Progress for the "qué falta" card, as text: "4" of "10", "2.3" of "3", "0.55" of "0.7". */
  current?: string;
  target?: string;
}

export interface LevelStatus {
  level: LevelDef;
  status: LevelLockState;
  unlockedBy?: LevelProgress['unlockedBy'];
  reason?: string;
  conditions: ConditionStatus[];
  guidesRead: number;
  guidesTotal: number;
  challengePassed: boolean;
}

const compare = (current: string, op: '>=' | '<=' | '==', target: string) => {
  const a = D(current);
  if (op === '>=') return a.gte(target);
  if (op === '<=') return a.lte(target);
  return a.eq(target);
};

function evaluateCondition(condition: UnlockCondition, ctx: LevelContext, completed: Set<string>): ConditionStatus {
  switch (condition.type) {
    case 'first_sign_in':
      return { condition, met: true };
    case 'level_completed':
      return { condition, met: completed.has(condition.levelId) };
    case 'mission_completed':
      return { condition, met: ctx.completedMissionIds.includes(condition.missionId) };
    case 'challenge_passed': {
      const best = ctx.bestScores[condition.challengeId];
      return {
        condition,
        met: best !== undefined && best >= condition.minScore,
        current: best === undefined ? undefined : String(best),
        target: String(condition.minScore),
      };
    }
    case 'wallet_metric': {
      const current = String(ctx.metrics[condition.metric]);
      return { condition, met: compare(current, condition.op, condition.value), current, target: condition.value };
    }
    case 'investor_profile_done':
      return { condition, met: ctx.investorProfileDone };
  }
}

/** Evaluates the levels in order (a level can depend on the previous one being completed). */
export function evaluateLevels(levels: LevelDef[], ctx: LevelContext): LevelStatus[] {
  const completed = new Set<string>();
  const ordered = [...levels].filter((l) => l.phase === 'A').sort((a, b) => a.order - b.order);
  return ordered.map((level) => {
    const conditions = level.unlock.all.map((c) => evaluateCondition(c, ctx, completed));
    const byRule = conditions.every((c) => c.met);
    const mastery = level.masteryChallengeId !== undefined && (ctx.bestScores[level.masteryChallengeId] ?? 0) >= ctx.passingScore;
    const tutorReason = ctx.tutorUnlocks[level.id];

    let unlockedBy: LevelProgress['unlockedBy'];
    if (byRule || ctx.previouslyUnlocked.includes(level.id)) unlockedBy = 'rule';
    else if (mastery) unlockedBy = 'mastery';
    else if (tutorReason !== undefined) unlockedBy = 'tutor';
    else if (ctx.freeMode) unlockedBy = 'admin_free_mode';
    else if (ctx.demoUnlockAll) unlockedBy = 'demo';

    const guidesTotal = level.guideModuleIds.length;
    const guidesRead = level.guideModuleIds.filter((id) => ctx.guidesRead.includes(id)).length;
    const challengePassed = level.challengeId ? (ctx.bestScores[level.challengeId] ?? 0) >= ctx.passingScore : true;
    // Completed (D-58): guides read and the level challenge passed; level 0, its missions and Conocerte.
    const learningDone =
      level.order === 0
        ? ctx.conocerteDone && level.missionIds.every((id) => ctx.completedMissionIds.includes(id))
        : guidesRead === guidesTotal && challengePassed;
    const status: LevelLockState = !unlockedBy ? 'locked' : learningDone ? 'completed' : 'unlocked';
    if (status === 'completed') completed.add(level.id);

    return {
      level,
      status,
      unlockedBy,
      reason: unlockedBy === 'tutor' ? tutorReason : undefined,
      conditions,
      guidesRead,
      guidesTotal,
      challengePassed,
    };
  });
}

/** The level the person is working on: the first unlocked one not completed, or the last unlocked. */
export function currentLevel(statuses: LevelStatus[]): LevelStatus | undefined {
  return statuses.find((s) => s.status === 'unlocked') ?? [...statuses].reverse().find((s) => s.status !== 'locked');
}

/** The next level to open, with what is missing (P1 "Próximo desbloqueo"). */
export function nextUnlock(statuses: LevelStatus[]): LevelStatus | undefined {
  return statuses.find((s) => s.status === 'locked');
}

/** How many levels from 1 to 7 are completed: Fuerte's lights (D-134). */
export function completedLights(statuses: LevelStatus[]): number {
  return statuses.filter((s) => s.level.order >= 1 && s.status === 'completed').length;
}

/** Snapshot to keep in the person's browser (local-store), so nothing unlocked is lost. */
export function toProgress(personId: string, statuses: LevelStatus[]): LevelProgress[] {
  return statuses.map((s) => ({ personId, levelId: s.level.id, status: s.status, unlockedBy: s.unlockedBy, reason: s.reason }));
}
