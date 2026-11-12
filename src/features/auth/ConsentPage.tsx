import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useNavigate } from "react-router";
import { PRIVACY_NOTICE_VERSION } from "@/app/config";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Icon, type IconName } from "@/components/ui/Icon";
import { IconTile } from "@/components/ui/IconTile";
import { toast } from "@/components/ui/toast-store";
import { duration, easing, useShouldReduceMotion } from "@/lib/motion";
import { can } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { useDataStore } from "@/store/data-store";
import { useCurrentUser } from "@/store/session-store";
import { acceptPrivacyNotice, afterConsentPath, signOut } from "./auth-service";
import { AuthLayout } from "./AuthLayout";

interface NoticeStep {
  title: string;
  icon: IconName;
  items: string[];
}

/**
 * G5 · Privacy notice and consent on the first sign-in (CLAUDE.md F0), in plain language and a few
 * steps with progress dots (2.2.1, pattern 7). The participant reads what the company sees and
 * never sees; the other roles read what they see and never see. Without accepting there is no way
 * in: the only other way out is "Cerrar sesión".
 */
export function ConsentPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const consents = useDataStore((s) => s.consents);
  const reduce = useShouldReduceMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [checked, setChecked] = useState(false);
  const [tried, setTried] = useState(false);

  if (!user) return <Navigate to="/login" replace />;
  if (
    consents.some(
      (c) =>
        c.personId === user.personId && c.version === PRIVACY_NOTICE_VERSION,
    )
  ) {
    return <Navigate to={afterConsentPath()} replace />;
  }

  const audience = can(user, "wallet.use") ? "participant" : "staff";
  const steps = t(`consent.steps.${audience}`, {
    returnObjects: true,
  }) as NoticeStep[];
  const step = steps[index]!;
  const last = index === steps.length - 1;
  const go = (delta: number) => {
    setDirection(delta);
    setIndex((i) => Math.min(steps.length - 1, Math.max(0, i + delta)));
  };

  const renderStep = (item: NoticeStep, titleId?: string) => (
    <>
      <div className="flex items-center gap-3">
        <IconTile icon={item.icon} />
        <h2 id={titleId} className="text-title-large text-on-surface">
          {item.title}
        </h2>
      </div>
      <ul className="flex flex-col gap-3">
        {item.items.map((line) => (
          <li
            key={line}
            className="flex items-start gap-2 text-body-large text-on-surface"
          >
            <Icon
              name={item.icon === "visibility_off" ? "block" : "check_circle"}
              size={20}
              className="mt-0.5 shrink-0 text-primary"
            />
            {line}
          </li>
        ))}
      </ul>
    </>
  );

  const accept = () => {
    setTried(true);
    if (!checked) {
      document.getElementById("consent-check")?.focus();
      return;
    }
    acceptPrivacyNotice(user.personId);
    toast.success(t("consent.accepted"));
    navigate(afterConsentPath(), { replace: true });
  };

  const slide = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, x: 24 * direction },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -24 * direction },
      };

  return (
    <AuthLayout>
      <div className="flex flex-col gap-2">
        <p className="text-label-large text-primary">{t("consent.eyebrow")}</p>
        <h1 className="text-headline-small text-on-surface">
          {t("consent.title")}
        </h1>
        <p className="text-body-large text-on-surface">
          {t(`consent.summary.${audience}`)}
        </p>
      </div>

      <section
        aria-labelledby="consent-step-title"
        className="flex min-w-0 flex-col gap-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div aria-hidden className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <motion.span
                key={i}
                className={cn(
                  "h-2 rounded-full",
                  i <= index ? "bg-primary" : "bg-outline-variant",
                )}
                animate={{ width: i === index ? 20 : 8 }}
                transition={{
                  duration: reduce ? 0 : duration.medium,
                  ease: easing.standard,
                }}
              />
            ))}
          </div>
          <p
            className="text-body-small text-on-surface-variant tabular-nums"
            aria-live="polite"
          >
            {t("consent.step", { n: index + 1, total: steps.length })} ·{" "}
            {t("consent.version", { version: PRIVACY_NOTICE_VERSION })}
          </p>
        </div>

        {/* Every step is laid out invisibly in the same cell, so the card keeps the height of the
            longest one and the buttons never move between steps. */}
        <div className="grid">
          {steps.map((item) => (
            <div
              key={item.title}
              aria-hidden
              className="invisible col-start-1 row-start-1 flex flex-col gap-4"
            >
              {renderStep(item)}
            </div>
          ))}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={index}
              {...slide}
              transition={{
                duration: duration.long,
                ease: easing.emphasizedDecelerate,
              }}
              className="col-start-1 row-start-1 flex flex-col gap-4"
            >
              {renderStep(step, "consent-step-title")}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* The acceptance is always laid out (hidden before the last step), so the height never changes. */}
        <div
          className={cn(
            "flex flex-col gap-2 border-t border-outline-variant pt-4",
            !last && "invisible",
          )}
          aria-hidden={!last || undefined}
        >
          <Checkbox
            id="consent-check"
            label={t("consent.check")}
            checked={checked}
            aria-invalid={tried && !checked ? true : undefined}
            aria-describedby={
              tried && !checked ? "consent-check-error" : undefined
            }
            onChange={(event) => setChecked(event.target.checked)}
          />
          {tried && !checked && (
            <p
              id="consent-check-error"
              role="alert"
              className="flex items-center gap-1.5 text-body-small text-error"
            >
              <Icon name="error" size={16} />
              {t("consent.checkRequired")}
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {index > 0 && (
            <Button
              variant="outlined"
              onClick={() => go(-1)}
              fullWidth
              className="sm:w-auto"
            >
              {t("consent.previous")}
            </Button>
          )}
          {last ? (
            <Button
              leadingIcon="check"
              onClick={accept}
              fullWidth
              className="sm:w-auto"
            >
              {t("consent.accept")}
            </Button>
          ) : (
            <Button onClick={() => go(1)} fullWidth className="sm:w-auto">
              {t("consent.next")}
            </Button>
          )}
        </div>
      </section>

      <div className="flex flex-col items-start gap-2">
        <p className="text-body-small text-on-surface-variant">
          {t("consent.signOutHelp")}
        </p>
        <Button
          variant="text"
          leadingIcon="logout"
          className="-ml-3"
          onClick={() => {
            signOut("manual");
            navigate("/login", { replace: true });
          }}
        >
          {t("consent.signOut")}
        </Button>
      </div>
    </AuthLayout>
  );
}
