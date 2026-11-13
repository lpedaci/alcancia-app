import { type FormEvent, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { DEMO_TODAY } from "@/app/config";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { IconTile } from "@/components/ui/IconTile";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { RadioGroup } from "@/components/ui/RadioGroup";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/Table";
import { findPerson } from "@/features/auth/auth-service";
import { Fuerte } from "@/features/companion/Fuerte";
import { LEVEL_ROUTE } from "@/features/levels/UnlockCard";
import { useLevels } from "@/features/levels/use-levels";
import { WalletShell } from "@/features/wallet/WalletShell";
import { formatDate } from "@/lib/dates";
import { NBSP } from "@/lib/money";
import { cn } from "@/lib/utils";
import { useDataStore } from "@/store/data-store";
import { readLocal, writeLocal } from "@/store/local-store";
import { useCurrentUser } from "@/store/session-store";
import type { Dimension, DiagnosticKnowledgeResult } from "@/types/domain";
import { AccountData } from "./AccountData";
import {
  DIMENSION_LEVEL,
  habitAnswers,
  KNOWLEDGE,
  levelOf,
  QUESTIONS,
  route,
  scoreKnowledge,
} from "./conocerte";

/**
 * P2, "Abrir tu cuenta" (level 0, flows.md 2.1): a guided welcome with Fuerte, the simulated sign-up
 * without real data, Conocerte (12 questions, one per screen) with its result by dimension and the
 * explained route, and the security mission. A person who already took Conocerte sees her result
 * and can repeat it to measure her progress (pre and post, F2).
 */
type Stage = "overview" | "intro" | "account" | "quiz" | "result";

const INTRO_SLIDES = ["wallet", "levels", "privacy"] as const;

export function WelcomePage() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const personId = user?.personId ?? "";
  const person = findPerson(personId);
  const diagnostics = useDataStore((s) => s.diagnostics);
  const saveDiagnostic = useDataStore((s) => s.saveDiagnostic);
  const mine = diagnostics.filter((d) => d.personId === personId);
  const initial = mine.find((d) => d.kind === "initial");
  const latest = mine.find((d) => d.kind === "final") ?? initial;
  const draft = readLocal(personId).conocerteDraft;

  const [stage, setStage] = useState<Stage>(() =>
    draft ? "quiz" : initial ? "overview" : "intro",
  );
  const [slide, setSlide] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(
    draft?.answers ?? {},
  );
  const [index, setIndex] = useState(draft?.index ?? 0);
  const [result, setResult] = useState<
    | { diagnostic: DiagnosticKnowledgeResult; answers: Record<string, string> }
    | undefined
  >();
  const kind: "initial" | "final" =
    draft?.kind ?? (initial ? "final" : "initial");

  // The focus goes to the title of each new screen (2.10).
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, [stage, slide, index]);

  const firstName = person?.name.split(" ")[0] ?? "";
  const fuerte = {
    overview: {
      state: "greeting" as const,
      message: t("welcome.fuerte.overview", { name: firstName }),
    },
    intro: {
      state: "greeting" as const,
      message: t(`welcome.intro.${INTRO_SLIDES[slide]}.fuerte`, {
        name: firstName,
      }),
    },
    account: {
      state: "neutral" as const,
      message: t("welcome.fuerte.account"),
    },
    quiz: { state: "thinking" as const, message: t("welcome.fuerte.quiz") },
    result: {
      state: "celebration" as const,
      message: t("welcome.fuerte.result"),
    },
  }[stage];

  const startQuiz = () => {
    setAnswers({});
    setIndex(0);
    writeLocal(personId, (d) => ({
      ...d,
      conocerteDraft: { answers: {}, index: 0, kind },
    }));
    setStage("quiz");
  };

  const finishQuiz = (final: Record<string, string>) => {
    const scores = scoreKnowledge(final);
    const diagnostic: DiagnosticKnowledgeResult = {
      personId,
      kind,
      takenAt: DEMO_TODAY,
      scores,
    };
    // Knowledge scores are learning data; habit answers stay in this browser (D-62).
    saveDiagnostic(diagnostic);
    writeLocal(personId, (d) => ({
      ...d,
      habitAnswers: { ...d.habitAnswers, ...habitAnswers(final) },
      conocerteDraft: undefined,
    }));
    setResult({ diagnostic, answers: final });
    setStage("result");
  };

  return (
    <WalletShell section={t("welcome.section")} fuerte={fuerte}>
      {/* Reading screens keep a comfortable width; results use two columns on desktop (D-164, 6) */}
      <div
        className={cn(
          "flex flex-col gap-6",
          stage === "overview" || stage === "result"
            ? "max-w-6xl"
            : "max-w-3xl",
        )}
      >
        {stage === "overview" && latest && (
          <Overview
            diagnostic={latest}
            hasFinal={mine.some((d) => d.kind === "final")}
            headingRef={headingRef}
            onRepeat={startQuiz}
          />
        )}

        {stage === "intro" && (
          <section
            aria-labelledby="welcome-title"
            className="flex flex-col gap-5 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)"
          >
            <div className="flex items-center gap-4">
              <Fuerte state="greeting" lights={0} size={4} />
              {/* Progress dots of the guided welcome (2.2.1, pattern 7) */}
              <p className="sr-only">
                {t("welcome.slideOf", {
                  n: slide + 1,
                  total: INTRO_SLIDES.length,
                })}
              </p>
              <span aria-hidden className="flex gap-1.5">
                {INTRO_SLIDES.map((id, i) => (
                  <span
                    key={id}
                    className={cn(
                      "h-2 rounded-full transition-all duration-200 motion-reduce:transition-none",
                      i === slide ? "w-6 bg-primary" : "w-2 bg-outline-variant",
                    )}
                  />
                ))}
              </span>
            </div>
            <h1
              id="welcome-title"
              ref={headingRef}
              tabIndex={-1}
              className="text-headline-medium text-on-surface focus:outline-none"
            >
              {t(`welcome.intro.${INTRO_SLIDES[slide]}.title`, {
                name: firstName,
              })}
            </h1>
            <p className="max-w-prose text-body-large text-on-surface">
              {t(`welcome.intro.${INTRO_SLIDES[slide]}.body`)}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                trailingIcon="arrow_forward"
                onClick={() =>
                  slide < INTRO_SLIDES.length - 1
                    ? setSlide(slide + 1)
                    : setStage("account")
                }
              >
                {t("welcome.continue")}
              </Button>
              {slide > 0 && (
                <Button
                  variant="text"
                  leadingIcon="arrow_back"
                  onClick={() => setSlide(slide - 1)}
                >
                  {t("welcome.back")}
                </Button>
              )}
            </div>
          </section>
        )}

        {stage === "account" && (
          <section
            aria-labelledby="account-title"
            className="flex flex-col gap-5 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)"
          >
            <IconTile icon="account_balance_wallet" tone="brand" />
            <h1
              id="account-title"
              ref={headingRef}
              tabIndex={-1}
              className="text-headline-medium text-on-surface focus:outline-none"
            >
              {t("welcome.account.title")}
            </h1>
            <p className="max-w-prose text-body-large text-on-surface">
              {t("welcome.account.body")}
            </p>
            <AccountData name={person?.name ?? ""} />
            <InlineAlert tone="info">
              {t("welcome.account.noRealData")}
            </InlineAlert>
            <Button
              className="self-start"
              leadingIcon="check"
              onClick={startQuiz}
            >
              {t("welcome.account.open")}
            </Button>
          </section>
        )}

        {stage === "quiz" && (
          <QuizStep
            index={index}
            answers={answers}
            headingRef={headingRef}
            onAnswer={(id, value) => {
              const next = { ...answers, [id]: value };
              setAnswers(next);
              writeLocal(personId, (d) => ({
                ...d,
                conocerteDraft: { answers: next, index, kind },
              }));
            }}
            onMove={(to) => {
              if (to >= QUESTIONS.length) {
                finishQuiz(answers);
                return;
              }
              setIndex(to);
              writeLocal(personId, (d) => ({
                ...d,
                conocerteDraft: { answers, index: to, kind },
              }));
            }}
          />
        )}

        {stage === "result" && result && (
          <Result
            diagnostic={result.diagnostic}
            answers={result.answers}
            headingRef={headingRef}
          />
        )}
      </div>
    </WalletShell>
  );
}

function QuizStep({
  index,
  answers,
  headingRef,
  onAnswer,
  onMove,
}: {
  index: number;
  answers: Record<string, string>;
  headingRef: React.RefObject<HTMLHeadingElement>;
  onAnswer: (id: string, value: string) => void;
  onMove: (to: number) => void;
}) {
  const { t } = useTranslation();
  const question = QUESTIONS[index]!;
  const [tried, setTried] = useState(false);
  const value = answers[question.id] ?? "";
  const last = index === QUESTIONS.length - 1;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setTried(true);
    if (!value) return;
    setTried(false);
    onMove(index + 1);
  };

  return (
    <form
      noValidate
      onSubmit={submit}
      aria-labelledby="quiz-title"
      className="flex flex-col gap-5 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)"
    >
      <ProgressBar
        value={Math.round((index / QUESTIONS.length) * 100)}
        label={t("welcome.quiz.progress")}
        valueText={t("welcome.quiz.of", {
          n: index + 1,
          total: QUESTIONS.length,
        })}
      />
      <div className="flex flex-col gap-1">
        <p className="text-label-large text-primary">
          {t(
            question.type === "habit"
              ? "welcome.quiz.habit"
              : "welcome.quiz.knowledge",
          )}{" "}
          · {t(`welcome.dimensions.${question.dimension}`)}
        </p>
        <h1
          id="quiz-title"
          ref={headingRef}
          tabIndex={-1}
          className="text-headline-medium text-on-surface focus:outline-none"
        >
          {t("welcome.quiz.title", { n: index + 1 })}
        </h1>
        <p className="text-body-medium text-on-surface-variant">
          {t(
            question.type === "habit"
              ? "welcome.quiz.habitHelp"
              : "welcome.quiz.knowledgeHelp",
          )}
        </p>
      </div>
      <RadioGroup
        key={question.id}
        name={question.id}
        legend={question.prompt}
        required
        error={tried && !value ? t("welcome.quiz.choose") : undefined}
        options={question.options.map((o) => ({ value: o.id, label: o.text }))}
        value={value}
        onChange={(e) => onAnswer(question.id, e.target.value)}
      />
      <div className="flex flex-wrap gap-3">
        <Button type="submit" trailingIcon={last ? "check" : "arrow_forward"}>
          {last ? t("welcome.quiz.finish") : t("welcome.continue")}
        </Button>
        {index > 0 && (
          <Button
            variant="text"
            leadingIcon="arrow_back"
            onClick={() => onMove(index - 1)}
          >
            {t("welcome.back")}
          </Button>
        )}
      </div>
      <p className="text-body-small text-on-surface-variant">
        {t("welcome.quiz.saved")}
      </p>
    </form>
  );
}

/** Result by dimension: horizontal bars with a conclusion and their table (2.10, F2). */
function Scores({ scores }: { scores: Record<Dimension, number> }) {
  const { t } = useTranslation();
  const [asTable, setAsTable] = useState(false);
  const order = route(scores);
  const strongest = [...order].reverse()[0]!;
  const pct = (score: number) => `${Math.round(score * 100)}${NBSP}%`;
  return (
    <section
      aria-labelledby="scores-title"
      className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 id="scores-title" className="text-title-large text-on-surface">
          {t("welcome.result.scoresTitle")}
        </h2>
        <Button
          variant="text"
          size="xs"
          leadingIcon={asTable ? "bar_chart" : "table_rows"}
          onClick={() => setAsTable(!asTable)}
        >
          {asTable ? t("welcome.result.asChart") : t("welcome.result.asTable")}
        </Button>
      </div>
      <p className="text-body-large text-on-surface">
        {t("welcome.result.conclusion", {
          strong: t(`welcome.dimensions.${strongest}`),
          first: t(`welcome.dimensions.${order[0]}`),
        })}
      </p>
      {asTable ? (
        <TableContainer label={t("welcome.result.scoresTitle")}>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>
                  {t("welcome.result.dimension")}
                </TableHeaderCell>
                <TableHeaderCell className="text-right">
                  {t("welcome.result.score")}
                </TableHeaderCell>
                <TableHeaderCell>{t("welcome.result.level")}</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(Object.keys(scores) as Dimension[]).map((d) => (
                <TableRow key={d}>
                  <TableCell>{t(`welcome.dimensions.${d}`)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {pct(scores[d])}
                  </TableCell>
                  <TableCell>
                    {t(`welcome.levels.${levelOf(scores[d])}`)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <ul className="flex flex-col gap-4">
          {(Object.keys(scores) as Dimension[]).map((d) => {
            const level = levelOf(scores[d]);
            return (
              <li key={d} className="flex flex-col gap-1.5">
                <p
                  aria-hidden
                  className="flex items-baseline justify-between gap-3"
                >
                  <span className="text-title-small text-on-surface">
                    {t(`welcome.dimensions.${d}`)}
                  </span>
                  <span className="text-label-medium text-on-surface-variant tabular-nums">
                    {pct(scores[d])} · {t(`welcome.levels.${level}`)}
                  </span>
                </p>
                <ProgressBar
                  value={Math.round(scores[d] * 100)}
                  label={`${t(`welcome.dimensions.${d}`)}: ${pct(scores[d])}, ${t(`welcome.levels.${level}`)}`}
                  tone={level === "advanced" ? "success" : undefined}
                />
              </li>
            );
          })}
        </ul>
      )}
      <p className="text-body-small text-on-surface-variant">
        {t("welcome.result.onlyKnowledge")}
      </p>
    </section>
  );
}

/** The explained route (F2): where to put the focus first, and "Ya sé esto" for what she already knows. */
function Route({ scores }: { scores: Record<Dimension, number> }) {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const { isOpen } = useLevels(user?.personId ?? "");
  const order = route(scores);
  return (
    <section
      aria-labelledby="route-title"
      className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)"
    >
      <h2 id="route-title" className="text-title-large text-on-surface">
        {t("welcome.result.routeTitle")}
      </h2>
      <p className="text-body-large text-on-surface">
        {t(`welcome.why.${order[0]}`)}
      </p>
      <ol className="flex flex-col gap-2">
        {order.map((d, i) => {
          const levelId = DIMENSION_LEVEL[d];
          const advanced = levelOf(scores[d]) === "advanced";
          const locked = !isOpen(levelId);
          return (
            <li
              key={d}
              className="flex flex-wrap items-center gap-3 rounded-lg bg-surface-container px-4 py-3"
            >
              <span
                aria-hidden
                className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-container-lowest text-label-large text-on-surface tabular-nums"
              >
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-title-small text-on-surface">
                  {t(`welcome.dimensions.${d}`)}
                </span>
                <span className="block text-body-small text-on-surface-variant">
                  {t("welcome.result.practisedIn", {
                    section: t(`wallet.sections.${levelId}`),
                    level: levelId.split("-")[1],
                  })}
                </span>
              </span>
              {advanced && locked && (
                <Button asChild variant="tonal" size="xs" leadingIcon="bolt">
                  <Link to={LEVEL_ROUTE[levelId] ?? "/app/learn"}>
                    {t("welcome.result.mastery")}
                  </Link>
                </Button>
              )}
            </li>
          );
        })}
      </ol>
      <p className="text-body-small text-on-surface-variant">
        {t("welcome.result.routeNote")}
      </p>
    </section>
  );
}

function Result({
  diagnostic,
  answers,
  headingRef,
}: {
  diagnostic: DiagnosticKnowledgeResult;
  answers: Record<string, string>;
  headingRef: React.RefObject<HTMLHeadingElement>;
}) {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const { wallet } = useLevels(user?.personId ?? "");
  const securityDone = wallet.completedMissionIds.includes("mission-security");
  return (
    <>
      <header className="flex flex-col gap-2">
        <p className="text-label-large text-primary">
          {t("welcome.result.kicker")}
        </p>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-headline-medium text-on-surface focus:outline-none"
        >
          {t(
            diagnostic.kind === "final"
              ? "welcome.result.titleFinal"
              : "welcome.result.title",
          )}
        </h1>
      </header>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 large:grid-cols-2 large:items-start">
        <Scores scores={diagnostic.scores} />
        <section
          aria-labelledby="feedback-title"
          className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)"
        >
          <h2 id="feedback-title" className="text-title-large text-on-surface">
            {t("welcome.result.feedbackTitle")}
          </h2>
          <ul className="flex flex-col gap-3">
            {KNOWLEDGE.map((q) => {
              const right = answers[q.id] === q.correct;
              return (
                <li
                  key={q.id}
                  className={cn(
                    "flex flex-col gap-1 rounded-lg px-4 py-3",
                    right
                      ? "bg-success-container text-on-success-container"
                      : "bg-info-container text-on-info-container",
                  )}
                >
                  <p className="flex items-start gap-2 text-title-small">
                    <Icon
                      name={right ? "check_circle" : "info"}
                      size={20}
                      className={cn(
                        "mt-0.5 shrink-0",
                        right ? "text-success" : "text-info",
                      )}
                    />
                    <span>
                      <span className="sr-only">
                        {right
                          ? t("welcome.result.right")
                          : t("welcome.result.toReview")}
                        :{" "}
                      </span>
                      {q.prompt}
                    </span>
                  </p>
                  <p className="pl-7 text-body-medium">{q.explanation}</p>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
      <Route scores={diagnostic.scores} />
      <section className="flex flex-col items-start gap-3 rounded-xl border border-primary bg-surface-container-lowest p-(--space-card-padding)">
        <h2 className="text-title-large text-on-surface">
          {t(
            securityDone
              ? "welcome.result.nextHome"
              : "welcome.result.nextSecurity",
          )}
        </h2>
        <p className="text-body-medium text-on-surface-variant">
          {t(
            securityDone
              ? "welcome.result.nextHomeBody"
              : "welcome.result.nextSecurityBody",
          )}
        </p>
        <Button asChild trailingIcon="arrow_forward">
          <Link to={securityDone ? "/app" : "/app/missions/mission-security"}>
            {t(
              securityDone
                ? "wallet.placeholder.backHome"
                : "welcome.result.goSecurity",
            )}
          </Link>
        </Button>
      </section>
    </>
  );
}

function Overview({
  diagnostic,
  hasFinal,
  headingRef,
  onRepeat,
}: {
  diagnostic: DiagnosticKnowledgeResult;
  hasFinal: boolean;
  headingRef: React.RefObject<HTMLHeadingElement>;
  onRepeat: () => void;
}) {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const person = findPerson(user?.personId ?? "");
  return (
    <>
      <header className="flex flex-col gap-2">
        <p className="text-label-large text-primary">{t("welcome.section")}</p>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-headline-medium text-on-surface focus:outline-none"
        >
          {t("welcome.overview.title")}
        </h1>
        <p className="text-body-large text-on-surface-variant">
          {t("welcome.overview.taken", {
            date: formatDate(diagnostic.takenAt),
            kind: t(`welcome.overview.kind.${diagnostic.kind}`),
          })}
        </p>
      </header>
      <section
        aria-labelledby="overview-account"
        className="flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)"
      >
        <h2 id="overview-account" className="text-title-large text-on-surface">
          {t("welcome.account.title")}
        </h2>
        <AccountData name={person?.name ?? ""} />
      </section>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 large:grid-cols-2 large:items-start">
        <Scores scores={diagnostic.scores} />
        <Route scores={diagnostic.scores} />
      </div>
      <section className="flex flex-col items-start gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)">
        <h2 className="text-title-large text-on-surface">
          {t("welcome.overview.repeatTitle")}
        </h2>
        <p className="text-body-medium text-on-surface-variant">
          {t(
            hasFinal
              ? "welcome.overview.repeatAgain"
              : "welcome.overview.repeatBody",
          )}
        </p>
        <Button variant="tonal" leadingIcon="replay" onClick={onRepeat}>
          {t("welcome.overview.repeat")}
        </Button>
      </section>
    </>
  );
}
