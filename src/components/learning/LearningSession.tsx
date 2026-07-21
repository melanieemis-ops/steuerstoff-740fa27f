import {
  ArrowRight,
  Check,
  CheckCircle2,
  Lightbulb,
  RefreshCw,
  Trophy,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

import type { LearningQuestion } from "@/data/types";
import { useLearningSession } from "@/hooks/useLearningSession";
import type { LearningProgressState } from "@/lib/learningProgress";
import { useMistakes } from "@/hooks/useMistakes";
import { useProgress } from "@/hooks/useProgress";

import { ProgressBar } from "./ProgressBar";
import { QuestionCard } from "./QuestionCard";

interface LearningSessionProps {
  questions: LearningQuestion[];
  sessionSize?: number;
  onProgressChange?: (
    progress: LearningProgressState,
  ) => void;
}

export function LearningSession({
  questions,
  sessionSize = 10,
  onProgressChange,
}: LearningSessionProps) {
  const session = useLearningSession({
    questions,
    sessionSize,
    random: true,
    onProgressChange,
  });

  const { addMistake } = useMistakes();
  const { recordQuestion } = useProgress();
  const [lastCheckedIndex, setLastCheckedIndex] = useState(-1);

  // Track when answer is checked and save to mistakes if wrong, track progress
  useEffect(() => {
    if (
      session.checked &&
      session.currentQuestion &&
      lastCheckedIndex !== session.currentIndex
    ) {
      // Record to progress
      recordQuestion(
        session.currentQuestion.id,
        session.currentQuestion.category,
        session.currentQuestion.topic,
        session.isAnswerCorrect,
        'learning',
      );

      // Save to mistakes if wrong
      if (!session.isAnswerCorrect) {
        addMistake({
          id: session.currentQuestion.id,
          questionText: session.currentQuestion.question,
          category: session.currentQuestion.category,
          topic: session.currentQuestion.topic,
          options: session.currentQuestion.options,
          correctAnswer: session.currentQuestion.correctAnswer,
          explanation: session.currentQuestion.explanation,
          reference: session.currentQuestion.reference,
          hint: session.currentQuestion.hint,
          tags: session.currentQuestion.tags,
        });
      }

      setLastCheckedIndex(session.currentIndex);
    }
  }, [
    session.checked,
    session.currentQuestion,
    session.isAnswerCorrect,
    session.currentIndex,
    lastCheckedIndex,
    addMistake,
    recordQuestion,
  ]);

  if (
    session.status === "empty" ||
    !session.currentQuestion
  ) {
    return <EmptyState />;
  }

  if (session.status === "finished") {
    return (
      <ResultView
        correct={session.correctAnswers}
        wrong={session.wrongAnswers}
        total={session.totalQuestions}
        percent={session.resultPercent}
        onRestart={session.restartSession}
      />
    );
  }

  const question = session.currentQuestion;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <section className="rounded-[28px] border border-border bg-card p-5 shadow-sm sm:p-6">
        <ProgressBar
          current={session.currentIndex + 1}
          total={session.totalQuestions}
        />
      </section>

      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-foreground px-3 py-1 text-[11px] font-semibold text-background">
          {question.category}
        </span>

        <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground">
          {question.topic}
        </span>

        <DifficultyBadge
          difficulty={question.difficulty}
        />
      </div>

      <QuestionCard question={question} />

      <section className="space-y-3">
        {question.options.map((option, index) => (
          <AnswerOption
            key={`${question.id}-${index}`}
            label={String.fromCharCode(65 + index)}
            text={option}
            selected={
              session.selectedAnswer === index
            }
            correct={
              session.checked &&
              index === question.correctAnswer
            }
            wrong={
              session.checked &&
              session.selectedAnswer === index &&
              index !== question.correctAnswer
            }
            muted={
              session.checked &&
              index !== question.correctAnswer &&
              session.selectedAnswer !== index
            }
            disabled={session.checked}
            onClick={() =>
              session.selectAnswer(index)
            }
          />
        ))}
      </section>

      {!session.checked &&
        question.hint &&
        !session.showHint && (
          <button
            type="button"
            onClick={session.showCurrentHint}
            className="inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Lightbulb className="h-4 w-4" />
            Hinweis anzeigen
          </button>
        )}

      {!session.checked &&
        session.showHint &&
        question.hint && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />

            <p className="leading-relaxed">
              {question.hint}
            </p>
          </div>
        )}

      {session.checked && (
        <FeedbackCard
          correct={session.isAnswerCorrect}
          explanation={question.explanation}
          reference={question.reference}
        />
      )}

      <div className="sticky bottom-4 pt-2">
        {!session.checked ? (
          <button
            type="button"
            disabled={!session.canCheck}
            onClick={session.checkAnswer}
            className={[
              "inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-semibold shadow-sm transition-all",
              session.canCheck
                ? "bg-foreground text-background hover:-translate-y-0.5 hover:opacity-90"
                : "cursor-not-allowed bg-muted text-muted-foreground",
            ].join(" ")}
          >
            Antwort prüfen
            <CheckCircle2 className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={session.nextQuestion}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground px-5 py-4 text-sm font-semibold text-background shadow-sm transition-all hover:-translate-y-0.5 hover:opacity-90"
          >
            {session.currentIndex ===
            session.totalQuestions - 1
              ? "Ergebnis anzeigen"
              : "Nächste Frage"}

            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function AnswerOption({
  label,
  text,
  selected,
  correct,
  wrong,
  muted,
  disabled,
  onClick,
}: {
  label: string;
  text: string;
  selected: boolean;
  correct: boolean;
  wrong: boolean;
  muted: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "flex w-full items-start gap-3 rounded-2xl border px-4 py-4 text-left text-sm transition-all duration-300",
        !disabled &&
          !selected &&
          "border-border bg-card hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-sm",
        !disabled &&
          selected &&
          "border-foreground bg-foreground/[0.05] shadow-sm",
        correct &&
          "border-emerald-500 bg-emerald-50 text-emerald-950",
        wrong &&
          "border-red-500 bg-red-50 text-red-950",
        muted && "border-border bg-card opacity-50",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        className={[
          "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
          !selected &&
            !correct &&
            !wrong &&
            "border-border bg-background text-muted-foreground",
          selected &&
            !correct &&
            !wrong &&
            "border-foreground bg-foreground text-background",
          correct &&
            "border-emerald-600 bg-emerald-600 text-white",
          wrong &&
            "border-red-600 bg-red-600 text-white",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {correct ? (
          <Check className="h-4 w-4" />
        ) : wrong ? (
          <X className="h-4 w-4" />
        ) : (
          label
        )}
      </span>

      <span className="min-w-0 flex-1 leading-relaxed">
        {text}
      </span>
    </button>
  );
}

function DifficultyBadge({
  difficulty,
}: {
  difficulty: LearningQuestion["difficulty"];
}) {
  const styles: Record<
    LearningQuestion["difficulty"],
    string
  > = {
    leicht:
      "bg-emerald-100 text-emerald-700",
    mittel:
      "bg-amber-100 text-amber-700",
    schwer: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-[11px] font-medium ${styles[difficulty]}`}
    >
      {difficulty}
    </span>
  );
}

function FeedbackCard({
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
      aria-live="polite"
      className={[
        "rounded-[28px] border p-5 sm:p-6",
        correct
          ? "border-emerald-200 bg-emerald-50"
          : "border-red-200 bg-red-50",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        {correct ? (
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-700" />
        ) : (
          <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-red-700" />
        )}

        <div>
          <h3
            className={[
              "text-lg font-semibold",
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
              "mt-2 text-sm leading-relaxed",
              correct
                ? "text-emerald-900"
                : "text-red-900",
            ].join(" ")}
          >
            {explanation}
          </p>

          <div
            className={[
              "mt-4 rounded-xl border px-3 py-2 text-xs font-semibold",
              correct
                ? "border-emerald-200 bg-white/60 text-emerald-800"
                : "border-red-200 bg-white/60 text-red-800",
            ].join(" ")}
          >
            Fundstelle: {reference}
          </div>
        </div>
      </div>
    </section>
  );
}

function ResultView({
  correct,
  wrong,
  total,
  percent,
  onRestart,
}: {
  correct: number;
  wrong: number;
  total: number;
  percent: number;
  onRestart: () => void;
}) {
  const passed = percent >= 70;

  return (
    <section className="mx-auto w-full max-w-2xl rounded-[32px] border border-border bg-card p-6 text-center shadow-sm sm:p-10">
      <span
        className={[
          "mx-auto inline-flex h-20 w-20 items-center justify-center rounded-[28px]",
          passed
            ? "bg-emerald-100 text-emerald-700"
            : "bg-amber-100 text-amber-700",
        ].join(" ")}
      >
        {passed ? (
          <Trophy className="h-9 w-9" />
        ) : (
          <RefreshCw className="h-9 w-9" />
        )}
      </span>

      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Lernrunde abgeschlossen
      </p>

      <h2 className="mt-2 text-4xl font-semibold tracking-tight text-foreground">
        {percent} %
      </h2>

      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        {passed
          ? "Stark! Du hast diese Lernrunde sicher gemeistert."
          : "Kein Problem. Jede falsche Antwort zeigt dir, welches Thema du noch vertiefen kannst."}
      </p>

      <div className="mt-7 grid grid-cols-2 gap-3">
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

      <p className="mt-4 text-xs text-muted-foreground">
        Insgesamt {total} Fragen
      </p>

      <button
        type="button"
        onClick={onRestart}
        className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground px-5 py-4 text-sm font-semibold text-background transition-opacity hover:opacity-90"
      >
        <RefreshCw className="h-4 w-4" />
        Neue Lernrunde starten
      </button>
    </section>
  );
}

function EmptyState() {
  return (
    <section className="mx-auto w-full max-w-2xl rounded-[32px] border border-border bg-card p-8 text-center shadow-sm">
      <BookOpenIcon />

      <h2 className="mt-5 text-xl font-semibold text-foreground">
        Noch keine Fragen verfügbar
      </h2>

      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Für diesen Lernbereich werden gerade neue
        Fragen vorbereitet.
      </p>
    </section>
  );
}

function BookOpenIcon() {
  return (
    <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-muted text-2xl">
      📚
    </span>
  );
}