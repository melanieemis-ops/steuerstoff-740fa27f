import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  CircleHelp,
  Lightbulb,
  RefreshCw,
  RotateCcw,
  Trophy,
  X,
  XCircle,
} from "lucide-react";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

import {
  learningQuestions,
  type LearningQuestion,
} from "@/data/learningQuestions";

import {
  getLearningStatistics,
  loadLearningProgress,
  recordLearningAnswer,
  resetLearningProgress,
  type LearningProgressState,
  type LearningStatus,
} from "@/lib/learningProgress";

export const Route = createFileRoute("/lernen")({
  component: LearningPage,
  head: () => ({
    meta: [
      {
        title: "Lernen · steuerstoff",
      },
      {
        name: "description",
        content:
          "Interaktiver steuerstoff-Lernmodus mit Umsatzsteuerfragen, Sofortfeedback und persönlichem Lernfortschritt.",
      },
    ],
  }),
});

const SESSION_SIZE = 10;

function createRandomSession(): LearningQuestion[] {
  const shuffled = [...learningQuestions];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled.slice(0, SESSION_SIZE);
}

const STATUS_LABELS: Record<LearningStatus, string> = {
  unseen: "Noch nicht begonnen",
  red: "Noch üben",
  yellow: "Einmal richtig",
  "light-green": "Fast sicher",
  green: "Sicher beherrscht",
};

const STATUS_STYLES: Record<LearningStatus, string> = {
  unseen: "bg-muted text-muted-foreground",
  red: "bg-red-100 text-red-700",
  yellow: "bg-amber-100 text-amber-700",
  "light-green": "bg-emerald-100 text-emerald-700",
  green: "bg-green-600 text-white",
};

function LearningPage() {
  const [sessionQuestions, setSessionQuestions] =
  useState<LearningQuestion[]>(() =>
    createRandomSession(),
  );

  const [progress, setProgress] =
    useState<LearningProgressState>(() =>
      loadLearningProgress(),
    );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] =
    useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionWrong, setSessionWrong] = useState(0);
  const [completed, setCompleted] = useState(false);

  const currentQuestion =
    sessionQuestions[currentIndex];

  const statistics = getLearningStatistics(
    learningQuestions.map((question) => question.id),
    progress,
  );

  const sessionProgress = completed
    ? 100
    : Math.round(
        ((currentIndex + (checked ? 1 : 0)) /
          sessionQuestions.length) *
          100,
      );

  const isCurrentAnswerCorrect =
    selectedAnswer === currentQuestion.correctAnswer;

  function checkAnswer() {
    if (selectedAnswer === null || checked) {
      return;
    }

    const correct =
      selectedAnswer === currentQuestion.correctAnswer;

    const nextProgress = recordLearningAnswer(
      currentQuestion.id,
      correct,
    );

    setProgress(nextProgress);
    setChecked(true);

    if (correct) {
      setSessionCorrect((value) => value + 1);
    } else {
      setSessionWrong((value) => value + 1);
    }
  }

  function nextQuestion() {
    if (!checked) {
      return;
    }

    if (currentIndex >= sessionQuestions.length - 1) {
      setCompleted(true);
      return;
    }

    setCurrentIndex((value) => value + 1);
    setSelectedAnswer(null);
    setChecked(false);
    setShowHint(false);
  }

  function restartSession() {
    setSessionQuestions(createRandomSession());
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setChecked(false);
    setShowHint(false);
    setSessionCorrect(0);
    setSessionWrong(0);
    setCompleted(false);
  }

  function resetAllProgress() {
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        "Möchtest du deinen gesamten Lernfortschritt wirklich löschen?",
      )
    ) {
      return;
    }

    resetLearningProgress();
    setProgress(loadLearningProgress());
    restartSession();
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        <LearningHero
          statistics={statistics}
          onReset={resetAllProgress}
        />

        <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
          {completed ? (
            <SessionResult
              correct={sessionCorrect}
              wrong={sessionWrong}
              total={sessionQuestions.length}
              onRestart={restartSession}
            />
          ) : (
            <div className="space-y-5">
              <SessionProgress
                current={currentIndex + 1}
                total={sessionQuestions.length}
                percent={sessionProgress}
              />

              <QuestionCard
                question={currentQuestion}
                selectedAnswer={selectedAnswer}
                checked={checked}
                showHint={showHint}
                isCorrect={isCurrentAnswerCorrect}
                onSelect={setSelectedAnswer}
                onCheck={checkAnswer}
                onNext={nextQuestion}
                onShowHint={() => setShowHint(true)}
              />
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function LearningHero({
  statistics,
  onReset,
}: {
  statistics: ReturnType<
    typeof getLearningStatistics
  >;
  onReset: () => void;
}) {
  return (
    <section className="border-b border-border/60 bg-card/40">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span>steuerstoff Lernmodus</span>
            </div>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              Umsatzsteuer lernen
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Beantworte die Fragen wie in einer
              Fahrschul-App. Nach jeder Antwort erhältst
              du sofort eine verständliche Erklärung und
              dein Lernstand wird gespeichert.
            </p>
          </div>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Fortschritt zurücksetzen
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatisticCard
            label="Beantwortet"
            value={statistics.totalAnswered}
          />

          <StatisticCard
            label="Trefferquote"
            value={`${statistics.accuracy} %`}
          />

          <StatisticCard
            label="Noch üben"
            value={statistics.red}
          />

          <StatisticCard
            label="Sicher"
            value={statistics.green}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <StatusBadge
            status="unseen"
            count={statistics.unseen}
          />

          <StatusBadge
            status="red"
            count={statistics.red}
          />

          <StatusBadge
            status="yellow"
            count={statistics.yellow}
          />

          <StatusBadge
            status="light-green"
            count={statistics.lightGreen}
          />

          <StatusBadge
            status="green"
            count={statistics.green}
          />
        </div>
      </div>
    </section>
  );
}

function StatisticCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
  count,
}: {
  status: LearningStatus;
  count: number;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${STATUS_STYLES[status]}`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full bg-current"
        aria-hidden="true"
      />

      {STATUS_LABELS[status]}: {count}
    </span>
  );
}

function SessionProgress({
  current,
  total,
  percent,
}: {
  current: number;
  total: number;
  percent: number;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            Deine heutige Lernrunde
          </p>

          <p className="mt-0.5 text-sm font-semibold text-foreground">
            Frage {current} von {total}
          </p>
        </div>

        <span className="rounded-full bg-foreground px-2.5 py-1 text-xs font-semibold text-background">
          {percent} %
        </span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-foreground transition-[width] duration-500"
          style={{
            width: `${percent}%`,
          }}
        />
      </div>
    </section>
  );
}

function QuestionCard({
  question,
  selectedAnswer,
  checked,
  showHint,
  isCorrect,
  onSelect,
  onCheck,
  onNext,
  onShowHint,
}: {
  question: LearningQuestion;
  selectedAnswer: number | null;
  checked: boolean;
  showHint: boolean;
  isCorrect: boolean;
  onSelect: (index: number) => void;
  onCheck: () => void;
  onNext: () => void;
  onShowHint: () => void;
}) {
  return (
    <article
      data-no-swipe="true"
      className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
    >
      <header className="border-b border-border/60 px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-foreground px-2.5 py-1 text-[11px] font-semibold text-background">
            {question.category}
          </span>

          <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            {question.topic}
          </span>

          <DifficultyBadge
            difficulty={question.difficulty}
          />
        </div>

        <div className="mt-5 flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted">
            <CircleHelp className="h-4 w-4 text-foreground" />
          </span>

          <h2 className="text-lg font-semibold leading-snug text-foreground sm:text-xl">
            {question.question}
          </h2>
        </div>
      </header>

      <div className="space-y-3 p-5 sm:p-6">
        {question.options.map((option, index) => {
          const selected = selectedAnswer === index;
          const correct =
            checked &&
            index === question.correctAnswer;
          const wrong =
            checked &&
            selected &&
            index !== question.correctAnswer;

          return (
            <button
              key={`${question.id}-${index}`}
              type="button"
              disabled={checked}
              onClick={() => onSelect(index)}
              className={[
                "flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition-all",
                !checked &&
                  selected &&
                  "border-foreground bg-foreground/[0.05]",
                !checked &&
                  !selected &&
                  "border-border bg-background hover:border-foreground/30 hover:bg-accent/40",
                correct &&
                  "border-emerald-500 bg-emerald-50 text-emerald-950",
                wrong &&
                  "border-red-500 bg-red-50 text-red-950",
                checked &&
                  !correct &&
                  !wrong &&
                  "border-border bg-background opacity-60",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span
                className={[
                  "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                  selected && !checked
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card text-muted-foreground",
                  correct &&
                    "border-emerald-600 bg-emerald-600 text-white",
                  wrong &&
                    "border-red-600 bg-red-600 text-white",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {correct ? (
                  <Check className="h-3.5 w-3.5" />
                ) : wrong ? (
                  <X className="h-3.5 w-3.5" />
                ) : (
                  String.fromCharCode(65 + index)
                )}
              </span>

              <span className="min-w-0 flex-1 leading-relaxed">
                {option}
              </span>
            </button>
          );
        })}

        {!checked &&
          question.hint &&
          !showHint && (
            <button
              type="button"
              onClick={onShowHint}
              className="inline-flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Lightbulb className="h-3.5 w-3.5" />
              Hinweis anzeigen
            </button>
          )}

        {!checked &&
          showHint &&
          question.hint && (
            <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />

              <p>{question.hint}</p>
            </div>
          )}

        {checked && (
          <AnswerFeedback
            correct={isCorrect}
            explanation={question.explanation}
            reference={question.reference}
          />
        )}
      </div>

      <footer className="border-t border-border/60 bg-background/40 px-5 py-4 sm:px-6">
        {!checked ? (
          <button
            type="button"
            disabled={selectedAnswer === null}
            onClick={onCheck}
            className={[
              "inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-all",
              selectedAnswer === null
                ? "cursor-not-allowed bg-muted text-muted-foreground"
                : "bg-foreground text-background hover:opacity-90",
            ].join(" ")}
          >
            Antwort prüfen
            <CheckCircle2 className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground px-4 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            Nächste Frage
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </footer>
    </article>
  );
}

function DifficultyBadge({
  difficulty,
}: {
  difficulty: LearningQuestion["difficulty"];
}) {
  const styles = {
    leicht:
      "bg-emerald-100 text-emerald-700",
    mittel:
      "bg-amber-100 text-amber-700",
    schwer:
      "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${styles[difficulty]}`}
    >
      {difficulty}
    </span>
  );
}

function AnswerFeedback({
  correct,
  explanation,
  reference,
}: {
  correct: boolean;
  explanation: string;
  reference: string;
}) {
  return (
    <section
      className={[
        "rounded-2xl border p-4",
        correct
          ? "border-emerald-200 bg-emerald-50"
          : "border-red-200 bg-red-50",
      ].join(" ")}
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {correct ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
        ) : (
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-700" />
        )}

        <div className="min-w-0">
          <h3
            className={[
              "font-semibold",
              correct
                ? "text-emerald-950"
                : "text-red-950",
            ].join(" ")}
          >
            {correct
              ? "Richtig!"
              : "Noch nicht richtig"}
          </h3>

          <p
            className={[
              "mt-1 text-sm leading-relaxed",
              correct
                ? "text-emerald-900"
                : "text-red-900",
            ].join(" ")}
          >
            {explanation}
          </p>

          <p
            className={[
              "mt-3 text-xs font-semibold",
              correct
                ? "text-emerald-800"
                : "text-red-800",
            ].join(" ")}
          >
            Fundstelle: {reference}
          </p>
        </div>
      </div>
    </section>
  );
}

function SessionResult({
  correct,
  wrong,
  total,
  onRestart,
}: {
  correct: number;
  wrong: number;
  total: number;
  onRestart: () => void;
}) {
  const percentage = Math.round(
    (correct / total) * 100,
  );

  const passed = percentage >= 70;

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div className="px-5 py-8 text-center sm:px-8 sm:py-10">
        <span
          className={[
            "mx-auto inline-flex h-16 w-16 items-center justify-center rounded-3xl",
            passed
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700",
          ].join(" ")}
        >
          {passed ? (
            <Trophy className="h-8 w-8" />
          ) : (
            <RefreshCw className="h-8 w-8" />
          )}
        </span>

        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Lernrunde abgeschlossen
        </p>

        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
          {percentage} %
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          {passed
            ? "Stark! Diese Runde hast du sicher gemeistert."
            : "Das ist völlig okay. Deine falschen Antworten bleiben gespeichert und können gezielt wiederholt werden."}
        </p>

        <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-3">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs font-medium text-emerald-800">
              Richtig
            </p>

            <p className="mt-1 text-2xl font-semibold text-emerald-950">
              {correct}
            </p>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-xs font-medium text-red-800">
              Falsch
            </p>

            <p className="mt-1 text-2xl font-semibold text-red-950">
              {wrong}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRestart}
          className="mt-7 inline-flex w-full max-w-md items-center justify-center gap-2 rounded-2xl bg-foreground px-4 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
        >
          <RefreshCw className="h-4 w-4" />
          Neue Lernrunde starten
        </button>
      </div>
    </section>
  );
}