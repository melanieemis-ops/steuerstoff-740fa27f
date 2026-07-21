import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, RefreshCw, Trophy, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { useMistakes, type Mistake } from "@/hooks/useMistakes";

export const Route = createFileRoute("/lernen_/akademie_/fehlertrainer_/training")({
  component: MistakeTrainingPage,
  head: () => ({
    meta: [
      { title: "Fehlertrainer Trainingsmodus · steuerstoff" },
      { name: "description", content: "Trainiere deine Fehlerfragen im Trainingsmodus." },
    ],
  }),
});

function shuffleQuestions(questions: Mistake[]): Mistake[] {
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function MistakeTrainingPage() {
  const { getActiveMistakes, recordCorrectAnswer, recordWrongAnswer } = useMistakes();
  const [sessionMistakes, setSessionMistakes] = useState<Mistake[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [finished, setFinished] = useState(false);
  const [results, setResults] = useState({
    correct: 0,
    wrong: 0,
    mastered: [] as string[],
  });

  // Initialize session
  useEffect(() => {
    const active = getActiveMistakes();
    if (active.length === 0) {
      setFinished(true);
      return;
    }
    setSessionMistakes(shuffleQuestions(active));
  }, [getActiveMistakes]);

  const currentMistake = sessionMistakes[currentIndex];
  const isAnswerCorrect =
    currentMistake !== undefined && selectedAnswer === currentMistake.correctAnswer;

  const handleCheckAnswer = useCallback(() => {
    if (selectedAnswer === null || checked || !currentMistake) return;

    setChecked(true);

    if (isAnswerCorrect) {
      recordCorrectAnswer(currentMistake.id);
      setResults((r) => ({
        ...r,
        correct: r.correct + 1,
        mastered: r.mastered.includes(currentMistake.id)
          ? r.mastered
          : isAnswerCorrect ? r.mastered : r.mastered,
      }));
    } else {
      recordWrongAnswer(currentMistake.id);
      setResults((r) => ({
        ...r,
        wrong: r.wrong + 1,
      }));
    }
  }, [selectedAnswer, checked, currentMistake, isAnswerCorrect, recordCorrectAnswer, recordWrongAnswer]);

  const handleNextQuestion = useCallback(() => {
    if (!checked) return;

    const isLastQuestion = currentIndex >= sessionMistakes.length - 1;
    if (isLastQuestion) {
      setFinished(true);
      return;
    }

    setCurrentIndex((i) => i + 1);
    setSelectedAnswer(null);
    setChecked(false);
  }, [checked, currentIndex, sessionMistakes.length]);

  if (sessionMistakes.length === 0 && !finished) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex-1" />
        <SiteFooter />
      </div>
    );
  }

  if (finished) {
    return (
      <TrainingSummary
        correct={results.correct}
        wrong={results.wrong}
        total={results.correct + results.wrong}
      />
    );
  }

  if (!currentMistake) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex-1" />
        <SiteFooter />
      </div>
    );
  }

  const answeredQuestions = Object.keys(results).length;
  const totalQuestions = sessionMistakes.length;
  const progressPercent =
    totalQuestions === 0 ? 0 : Math.round(((answeredQuestions) / totalQuestions) * 100);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        <section className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
          <Link
            to="/lernen/akademie/fehlertrainer"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Zum Fehlertrainer
          </Link>

          {/* Progress */}
          <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Fortschritt
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  Frage {currentIndex + 1} von {totalQuestions}
                </p>
              </div>
              <span className="rounded-full bg-muted px-3 py-1 text-sm font-semibold tabular-nums text-foreground">
                {progressPercent}%
              </span>
            </div>

            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground transition-[width] duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="mt-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-foreground px-3 py-1 text-[11px] font-semibold text-background">
                {currentMistake.category}
              </span>
              <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground">
                {currentMistake.topic}
              </span>
            </div>

            <div className="mt-4 rounded-[28px] border border-border bg-card p-5 shadow-sm sm:p-6">
              <p className="text-2xl font-semibold leading-relaxed text-foreground">
                {currentMistake.questionText}
              </p>
            </div>
          </div>

          {/* Options */}
          <div className="mt-6 space-y-3">
            {currentMistake.options.map((option, index) => (
              <AnswerOption
                key={`${currentMistake.id}-${index}`}
                label={String.fromCharCode(65 + index)}
                text={option}
                selected={selectedAnswer === index}
                correct={checked && index === currentMistake.correctAnswer}
                wrong={
                  checked && selectedAnswer === index && index !== currentMistake.correctAnswer
                }
                muted={
                  checked &&
                  index !== currentMistake.correctAnswer &&
                  selectedAnswer !== index
                }
                disabled={checked}
                onClick={() => !checked && setSelectedAnswer(index)}
              />
            ))}
          </div>

          {/* Feedback */}
          {checked && (
            <FeedbackCard
              correct={isAnswerCorrect}
              explanation={currentMistake.explanation}
              reference={currentMistake.reference}
            />
          )}

          {/* Action Buttons */}
          <div className="sticky bottom-4 mt-6 flex gap-3">
            {!checked ? (
              <button
                onClick={handleCheckAnswer}
                disabled={selectedAnswer === null}
                className="flex-1 rounded-2xl bg-foreground px-5 py-3 text-sm font-semibold text-background transition-all hover:-translate-y-0.5 hover:opacity-90 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                Antwort überprüfen
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="flex-1 rounded-2xl bg-foreground px-5 py-3 text-sm font-semibold text-background transition-all hover:-translate-y-0.5 hover:opacity-90"
              >
                Nächste Frage
              </button>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
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
  let bgClass = "bg-card";
  let borderClass = "border-border/70";
  let textClass = "text-foreground";

  if (correct) {
    bgClass = "bg-emerald-50";
    borderClass = "border-emerald-300";
    textClass = "text-foreground";
  } else if (wrong) {
    bgClass = "bg-red-50";
    borderClass = "border-red-300";
    textClass = "text-foreground";
  } else if (selected && !disabled) {
    bgClass = "bg-card";
    borderClass = "border-foreground/50";
  } else if (muted) {
    bgClass = "bg-card/50";
    borderClass = "border-border/30";
    textClass = "text-muted-foreground";
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-start gap-3 rounded-2xl border ${borderClass} ${bgClass} p-4 text-left transition-all ${disabled ? "cursor-default" : "hover:shadow-sm"}`}
    >
      <span
        className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-semibold ${
          correct
            ? "bg-emerald-100 text-emerald-700"
            : wrong
              ? "bg-red-100 text-red-700"
              : "bg-muted text-muted-foreground"
        }`}
      >
        {label}
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium leading-relaxed ${textClass}`}>{text}</p>
      </div>
      {correct && <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />}
      {wrong && <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />}
    </button>
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
    <div
      className={`mt-6 rounded-2xl border p-4 ${
        correct
          ? "border-emerald-200 bg-emerald-50 text-emerald-950"
          : "border-red-200 bg-red-50 text-red-950"
      }`}
    >
      <div className="flex items-start gap-3">
        {correct ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
        ) : (
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
        )}

        <div className="min-w-0 flex-1">
          <p className="font-semibold">
            {correct ? "Richtig! 🎉" : "Das stimmt nicht ganz."}
          </p>
          <p className="mt-2 text-sm leading-relaxed">{explanation}</p>
          <p className="mt-2 text-xs font-medium opacity-75">{reference}</p>
        </div>
      </div>
    </div>
  );
}

function TrainingSummary({
  correct,
  wrong,
  total,
}: {
  correct: number;
  wrong: number;
  total: number;
}) {
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        <section className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12 pb-safe">
          <div className="text-center">
            <Trophy className="mx-auto h-16 w-16 text-amber-500" />
            <h1 className="mt-4 text-3xl font-semibold text-foreground">Trainingsrunde beendet!</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Großartig! Hier ist deine Zusammenfassung.
            </p>
          </div>

          {/* Stats */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <StatBox
              icon={Trophy}
              label="Gesamtergebnis"
              value={`${percent}%`}
              color="amber"
            />
            <StatBox icon={CheckCircle2} label="Richtig" value={correct} color="emerald" />
            <StatBox icon={XCircle} label="Falsch" value={wrong} color="red" />
          </div>

          {/* Result Message */}
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-center">
            {percent >= 80 ? (
              <>
                <p className="text-lg font-semibold text-foreground">Ausgezeichnet! 🌟</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Du beherrschst diese Fragen immer besser.
                </p>
              </>
            ) : percent >= 50 ? (
              <>
                <p className="text-lg font-semibold text-foreground">Gute Leistung! 💪</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Noch ein paar Übungen, dann sitzt es.
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold text-foreground">Weiter geht's! 📚</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Diese Fragen brauchst du noch mehr Übung.
                </p>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/lernen/akademie/fehlertrainer"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition-all hover:bg-muted sm:flex-none"
            >
              Zur Übersicht
            </Link>
            <Link
              to="/lernen/akademie/fehlertrainer/training"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-foreground px-5 py-3 text-sm font-semibold text-background shadow-sm transition-all hover:-translate-y-0.5 hover:opacity-90 sm:flex-none"
            >
              <RefreshCw className="h-4 w-4" />
              Erneut trainieren
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function StatBox({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Trophy;
  label: string;
  value: string | number;
  color: "amber" | "emerald" | "red";
}) {
  const colorClass = {
    amber: "bg-amber-100 text-amber-700",
    emerald: "bg-emerald-100 text-emerald-700",
    red: "bg-red-100 text-red-700",
  }[color];

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-6 text-center shadow-sm">
      <div className={`mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl ${colorClass}`}>
        <Icon className="h-6 w-6" />
      </div>
      <p className="mt-3 text-xl font-semibold tabular-nums text-foreground">{value}</p>
      <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
