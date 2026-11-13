import challengesJson from "@/data/challenges.json";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Icon, type IconName } from "@/components/ui/Icon";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatNumber, NBSP } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { ConditionStatus, LevelStatus } from "./engine";
import { MISSIONS } from "./use-levels";

/** Route of the section each level opens (5.3). */
export const LEVEL_ROUTE: Record<string, string> = {
  "level-1": "/app",
  "level-2": "/app/pay",
  "level-3": "/app/save/budget",
  "level-4": "/app/save/pockets",
  "level-5": "/app/pay/credit",
  "level-6": "/app/save/yield",
  "level-7": "/app/invest",
};

/** D-67: the educational investor profile test, offered from here even while Invertir is locked. */
export const INVESTOR_PROFILE_ROUTE = "/app/learn/investor-profile";

/** Challenges whose questions exist (the rest arrive with their level). */
const CHALLENGE_IDS = new Set(challengesJson.challenges.map((c) => c.id));

const levelNumber = (id: string) => id.replace(/\D/g, "");

const ICONS: Partial<Record<string, IconName>> = {
  challenge_passed: "quiz",
  mission_completed: "flag",
  categorized_movements: "checklist",
  months_closed_green: "calendar_month",
  emergency_pocket: "shield",
  emergency_months: "shield",
  high_rate_debt: "credit_card",
  investor_profile_done: "psychology",
  level_completed: "route",
};

/** Text of a condition, with its progress when it has one ("Fondo de emergencia · 2,3 de 3 meses"). */
export function useConditionText() {
  const { t } = useTranslation();
  return (c: ConditionStatus): string => {
    const condition = c.condition;
    switch (condition.type) {
      case "challenge_passed":
        return c.current !== undefined && !c.met
          ? t("wallet.unlock.c.challengeScore", {
              level: levelNumber(condition.challengeId),
              score: `${Math.round(Number(c.current) * 100)}${NBSP}%`,
            })
          : t("wallet.unlock.c.challenge_passed", {
              level: levelNumber(condition.challengeId),
            });
      case "mission_completed":
        return t("wallet.unlock.c.mission_completed", {
          title:
            MISSIONS.find((m) => m.id === condition.missionId)?.title ??
            condition.missionId,
        });
      case "level_completed":
        return t("wallet.unlock.c.level_completed", {
          level: levelNumber(condition.levelId),
        });
      case "wallet_metric":
        return t(`wallet.unlock.c.${condition.metric}`, {
          current: c.current
            ? formatNumber(
                c.current,
                condition.metric === "emergency_months" ? 1 : 0,
              ).replace(/,0$/, "")
            : "0",
          goal: condition.value,
        });
      default:
        return t(`wallet.unlock.c.${condition.type}`);
    }
  };
}

function conditionKey(c: ConditionStatus) {
  return c.condition.type === "wallet_metric"
    ? c.condition.metric
    : c.condition.type;
}

/** One condition as a chip: met with a check, pending with its progress, the profile test as a link. */
export function ConditionChip({ status }: { status: ConditionStatus }) {
  const { t } = useTranslation();
  const text = useConditionText()(status);
  const key = conditionKey(status);
  if (!status.met && status.condition.type === "challenge_passed") {
    // A pending challenge is one tap away (5.0: "un toque lleva a la acción que la acerca").
    return (
      <Link
        to={`/app/learn/challenges/${status.condition.challengeId}`}
        className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container-lowest px-3 py-1 text-label-medium text-on-surface hover:bg-surface-container"
      >
        <Icon name="quiz" size={16} className="text-primary" />
        {text}
        <span className="sr-only">, {t("wallet.unlock.pendingLabel")}</span>
        <Icon name="arrow_forward" size={16} className="text-primary" />
      </Link>
    );
  }
  if (!status.met && key === "investor_profile_done") {
    return (
      <Link
        to={INVESTOR_PROFILE_ROUTE}
        className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-primary-container px-3 py-1 text-label-medium text-on-primary-container hover:bg-primary hover:text-on-primary"
      >
        <Icon name="psychology" size={16} />
        {t("wallet.unlock.doProfile")}
        <Icon name="arrow_forward" size={16} />
      </Link>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 py-1 text-label-medium",
        status.met
          ? "bg-success-container text-on-success-container"
          : "border border-outline-variant bg-surface-container-lowest text-on-surface",
      )}
    >
      <Icon
        name={
          status.met ? "check_circle" : (ICONS[key] ?? "radio_button_unchecked")
        }
        size={16}
        filled={status.met}
        className={status.met ? "text-success" : "text-on-surface-variant"}
      />
      {text}
      <span className="sr-only">
        ,{" "}
        {status.met
          ? t("wallet.unlock.metLabel")
          : t("wallet.unlock.pendingLabel")}
      </span>
    </span>
  );
}

/**
 * "Próximo desbloqueo" (5.0): what the section is for, how many conditions are met, and each
 * condition as a chip. Locked never means hidden: the card always says what is missing.
 */
export function UnlockCard({
  status,
  headingLevel: Heading = "h2",
  className,
}: {
  status: LevelStatus;
  headingLevel?: "h1" | "h2";
  className?: string;
}) {
  const { t } = useTranslation();
  const section = t(`wallet.sections.${status.level.id}`);
  const met = status.conditions.filter((c) => c.met).length;
  const total = status.conditions.length;
  const titleId = `unlock-${status.level.id}`;
  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "flex min-w-0 flex-col gap-5 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)",
        className,
      )}
    >
      {/* Hierarchy (D-170): what is next, why it matters, how far you are and what is missing */}
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-surface-container text-on-surface-variant"
        >
          <Icon name="lock" size={24} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="text-label-medium text-on-surface-variant">
            {t("wallet.unlock.kicker", { level: status.level.order })}
          </p>
          <Heading id={titleId} className="text-title-large text-on-surface">
            {section}
          </Heading>
        </div>
      </div>
      <p className="max-w-prose text-body-medium text-on-surface-variant">
        {status.level.id === "level-7"
          ? t("wallet.unlock.investBody")
          : t("wallet.unlock.body")}
      </p>
      <div className="flex flex-col gap-2">
        <p aria-hidden className="flex items-baseline justify-between gap-3">
          <span className="text-title-small text-on-surface">
            {t("wallet.unlock.missing")}
          </span>
          <span className="text-label-medium text-on-surface-variant tabular-nums">
            {t("wallet.unlock.met", { met, total })}
          </span>
        </p>
        <ProgressBar
          value={(met / total) * 100}
          label={`${t("wallet.unlock.progressLabel", { section })}: ${t("wallet.unlock.met", { met, total })}`}
          tone="tertiary"
        />
      </div>
      <ul
        className="flex flex-wrap gap-2"
        aria-label={t("wallet.unlock.missing")}
      >
        {status.conditions
          .filter((c) => c.condition.type !== "first_sign_in")
          .map((c, index) => (
            <li key={index}>
              <ConditionChip status={c} />
            </li>
          ))}
      </ul>
      {/* "Ya sé esto" (5.0): the mastery challenge opens the section without the previous levels */}
      {status.level.masteryChallengeId &&
        CHALLENGE_IDS.has(status.level.masteryChallengeId) && (
          <Link
            to={`/app/learn/challenges/${status.level.masteryChallengeId}`}
            className="inline-flex min-h-10 items-center gap-2 self-start rounded-sm px-1 text-label-large text-primary hover:underline"
          >
            <Icon name="bolt" size={18} />
            {t("wallet.unlock.mastery")}
          </Link>
        )}
    </section>
  );
}
