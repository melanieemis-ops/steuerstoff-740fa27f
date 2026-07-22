import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  ArrowLeft,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Home,
  RefreshCw,
} from "lucide-react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { learningQuestions, getLearningCategories } from "@/data";
import { LearningCategory } from "@/data/types";
import { useExamSession, ExamSession, ExamSessionConfig } from "@/hooks/useExamSession";
import { Link } from "@tanstack/react-router";
import { useMistakes } from "@/hooks/useMistakes";
import { useProgress } from "@/hooks/useProgress";
import { useFavorites } from "@/hooks/useFavorites";

export const Route = createFileRoute("/lernen_/pruefungssimulation")({
  component: ExamSimulationPage,
  head: () => ({
    meta: [
      { title: "Prüfungssimulation · steuerstoff" },
      {
        name: "description",
        content:
          "Teste dein Steuerrechtswissen mit der Prüfungssimulation von steuerstoff unter realistischen Bedingungen.",
      },
    ],
  }),
});

function ExamSimulationPage() {
  const {
    session,
    createSession,
    selectAnswer,
    toggleMarkQuestion,
    goToQuestion,
    nextQuestion,
    previousQuestion,
    handleSubmitExam: submitExam,
    abandonSession: abandon,
    getQuestionStats,
    timeRemaining,
  } = useExamSession();
  const [selectedCategories, setSelectedCategories] = useState<LearningCategory[]>([]);
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(true);
  const [showContinueDialog, setShowContinueDialog] = useState(true);

  const allCategories = useMemo(() => getLearningCategories(), []);

  // Hide mobile nav during exam
  useEffect(() => {
    if (session && !session.isSubmitted && !session.isAbandoned) {
      document.documentElement.setAttribute("data-exam-running", "true");
    } else {
      document.documentElement.removeAttribute("data-exam-running");
    }
    return () => {
      document.documentElement.removeAttribute("data-exam-running");
    };
  }, [session]);

  // Filter questions based on selected categories
  const availableQuestions = useMemo(() => {
    const catToUse = selectedCategories.length === 0 ? allCategories : selectedCategories;
    return learningQuestions.filter(
      (q) =>
        catToUse.includes(q.category) && (q.type === "single-choice" || q.type === "true-false"),
    );
  }, [selectedCategories, allCategories]);

  // Available question counts
  const availableQuestionCounts = useMemo(() => {
    const max = availableQuestions.length;
    return [
      { label: "10 Fragen", value: 10, enabled: max >= 10 },
      { label: "20 Fragen", value: 20, enabled: max >= 20 },
      { label: "30 Fragen", value: 30, enabled: max >= 30 },
      {
        label: `Alle (${max} Fragen)`,
        value: max,
        enabled: max > 0,
      },
    ];
  }, [availableQuestions]);

  const canStartExam = availableQuestions.length > 0 && questionCount > 0;

  const handleToggleCategory = (category: LearningCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    );
  };

  const handleSelectAllCategories = () => {
    if (selectedCategories.length === allCategories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories([...allCategories]);
    }
  };

  const handleStartExam = () => {
    if (!canStartExam) return;

    // Select questions
    const catToUse = selectedCategories.length === 0 ? allCategories : selectedCategories;
    const selectedQuestions = learningQuestions
      .filter(
        (q) =>
          catToUse.includes(q.category) && (q.type === "single-choice" || q.type === "true-false"),
      )
      .sort(() => Math.random() - 0.5)
      .slice(0, questionCount);

    const config: ExamSessionConfig = {
      categories: selectedCategories.length === 0 ? allCategories : selectedCategories,
      questionCount,
      timeLimit,
      shuffleQuestions,
      shuffleOptions,
    };

    createSession(config, selectedQuestions);
  };

  const handleContinueExam = () => {
    setShowContinueDialog(false);
  };

  const handleNewExam = () => {
    setShowContinueDialog(false);
    // Logic to start new exam (reset session) is handled by abandonSession
  };

  const {
    selectAnswer,
    toggleMarkQuestion,
    goToQuestion,
    nextQuestion,
    previousQuestion,
    handleSubmitExam: submitExam,
    abandonSession: abandon,
    getQuestionStats,
    timeRemaining,
  } = useExamSession();

  // If exam is running, render exam view instead
  if (session && !session.isSubmitted && !session.isAbandoned) {
    return (
      <ExamTestView
        session={session}
        selectAnswer={selectAnswer}
        toggleMarkQuestion={toggleMarkQuestion}
        goToQuestion={goToQuestion}
        nextQuestion={nextQuestion}
        previousQuestion={previousQuestion}
        handleSubmitExam={submitExam}
        abandonSession={abandon}
        getQuestionStats={getQuestionStats}
        timeRemaining={timeRemaining}
      />
    );
  }

  // If exam is submitted, render results
  if (session && session.isSubmitted && !session.isAbandoned) {
    return <ExamResultsView />;
  }

  // Show continue dialog if there's an existing session
  if (session && showContinueDialog && !session.isAbandoned) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center pb-24">
          <div className="mx-auto w-full max-w-md px-4">
            <div className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-foreground">
                Laufende Prüfung fortsetzen?
              </h2>
              <p className="mt-2 text-muted-foreground">
                Du hast eine noch nicht abgegebene Prüfung.
              </p>
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleContinueExam}
                  className="w-full px-6 py-3 rounded-2xl font-semibold bg-foreground text-background hover:opacity-90 transition"
                >
                  Fortsetzen
                </button>
                <button
                  onClick={handleNewExam}
                  className="w-full px-6 py-3 rounded-2xl font-semibold border border-border/70 bg-background text-foreground hover:bg-muted transition"
                >
                  Neue Prüfung starten
                </button>
              </div>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  // Configuration screen
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1 overflow-y-auto pb-24">
        <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground">Prüfungssimulation</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Teste dein Wissen mit zufällig ausgewählten Fragen unter Prüfungsbedingungen.
            </p>
          </div>

          <div className="space-y-8">
            {/* Themenbereiche */}
            <section className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-foreground">Themenbereiche</h2>

              <div className="mt-4 flex gap-3 flex-wrap">
                <button
                  onClick={handleSelectAllCategories}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    selectedCategories.length === allCategories.length
                      ? "bg-foreground text-background"
                      : "border border-border/70 bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  Alle Themen
                </button>

                {allCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleToggleCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      selectedCategories.includes(category)
                        ? "bg-foreground text-background"
                        : "border border-border/70 bg-background text-foreground hover:bg-muted"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <p className="mt-4 text-sm text-muted-foreground">
                {availableQuestions.length} Fragen verfügbar
              </p>
            </section>

            {/* Anzahl der Fragen */}
            <section className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-foreground">Anzahl der Fragen</h2>

              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {availableQuestionCounts.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setQuestionCount(option.value)}
                    disabled={!option.enabled}
                    className={`px-4 py-3 rounded-lg font-medium transition text-left ${
                      !option.enabled
                        ? "border border-border/40 bg-background/50 text-muted-foreground cursor-not-allowed opacity-50"
                        : questionCount === option.value
                          ? "bg-foreground text-background"
                          : "border border-border/70 bg-background text-foreground hover:bg-muted"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Zeitlimit */}
            <section className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-foreground">Zeitlimit</h2>

              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  { label: "Ohne Zeitlimit", value: null },
                  { label: "15 Minuten", value: 15 },
                  { label: "30 Minuten", value: 30 },
                  { label: "60 Minuten", value: 60 },
                ].map((option) => (
                  <button
                    key={String(option.value)}
                    onClick={() => setTimeLimit(option.value)}
                    className={`px-4 py-3 rounded-lg font-medium transition text-left ${
                      timeLimit === option.value
                        ? "bg-foreground text-background"
                        : "border border-border/70 bg-background text-foreground hover:bg-muted"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Reihenfolge */}
            <section className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-foreground">Reihenfolge</h2>

              <div className="mt-4 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shuffleQuestions}
                    onChange={(e) => setShuffleQuestions(e.target.checked)}
                    className="h-5 w-5 rounded border-border/70"
                  />
                  <span className="text-foreground">Fragen zufällig mischen</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shuffleOptions}
                    onChange={(e) => setShuffleOptions(e.target.checked)}
                    className="h-5 w-5 rounded border-border/70"
                  />
                  <span className="text-foreground">Antwortmöglichkeiten mischen</span>
                </label>
              </div>
            </section>

            {/* Prüfungsübersicht */}
            <section className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">Prüfungsübersicht</h2>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Themen:</span>
                  <span className="font-medium text-foreground">
                    {selectedCategories.length === 0 ? "Alle" : selectedCategories.join(", ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fragen:</span>
                  <span className="font-medium text-foreground">{questionCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Zeitlimit:</span>
                  <span className="font-medium text-foreground">
                    {timeLimit ? `${timeLimit} Minuten` : "Kein Limit"}
                  </span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-6 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                Die Auswertung erfolgt erst nach der Abgabe. Während der Prüfung werden Lösungen
                nicht angezeigt.
              </p>

              <button
                onClick={handleStartExam}
                disabled={!canStartExam}
                className={`w-full px-6 py-4 rounded-2xl font-semibold transition text-lg ${
                  !canStartExam
                    ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                    : "bg-foreground text-background hover:opacity-90 shadow-sm"
                }`}
              >
                Prüfung starten
              </button>
            </section>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

// Exam Test View
interface ExamTestViewProps {
  session: ExamSession;
  selectAnswer: (questionIndex: number, optionIndex: number) => void;
  toggleMarkQuestion: (questionIndex: number) => void;
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  handleSubmitExam: () => void;
  abandonSession: () => void;
  getQuestionStats: () => {
    total: number;
    answered: number;
    unanswered: number;
    marked: number;
  } | null;
  timeRemaining: number | null;
}

function ExamTestView(props: ExamTestViewProps) {
  const {
    session,
    timeRemaining,
    selectAnswer,
    toggleMarkQuestion,
    goToQuestion,
    nextQuestion,
    previousQuestion,
    handleSubmitExam,
    abandonSession,
    getQuestionStats,
  } = props;
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);
  const [showQuestionsPanel, setShowQuestionsPanel] = useState(false);

  if (!session) return null;

  const currentQuestion = session.questions[session.currentQuestionIndex];
  const stats = getQuestionStats();

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const timeWarningColor =
    timeRemaining !== null && timeRemaining <= 60
      ? "text-red-600"
      : timeRemaining !== null && timeRemaining <= 300
        ? "text-amber-600"
        : "text-foreground";

  const handleSubmit = () => {
    handleSubmitExam();
    setShowSubmitConfirm(false);
  };

  const handleAbandon = () => {
    abandonSession();
    setShowAbandonConfirm(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header with Timer */}
      <div className="border-b border-border/70 bg-card/95 backdrop-blur p-4 sticky top-0 z-30">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-foreground hidden sm:block">
              Frage {session.currentQuestionIndex + 1} von {session.questions.length}
            </h1>
            <span className="text-sm text-muted-foreground sm:hidden">
              {session.currentQuestionIndex + 1}/{session.questions.length}
            </span>
          </div>

          {session.config.timeLimit && (
            <div className={`flex items-center gap-2 font-semibold ${timeWarningColor}`}>
              <Clock className="h-5 w-5" />
              <span>{formatTime(timeRemaining)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        <div className="mx-auto max-w-4xl px-4 py-8">
          {/* Question Card */}
          <div className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8 mb-6">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              {currentQuestion.question.question}
            </h2>

            <div className="space-y-3">
              {currentQuestion.question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => selectAnswer(session.currentQuestionIndex, idx)}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 transition ${
                    currentQuestion.selectedAnswerIndex === idx
                      ? "border-foreground bg-background"
                      : "border-border/70 bg-background hover:border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        currentQuestion.selectedAnswerIndex === idx
                          ? "border-foreground bg-foreground"
                          : "border-border/70"
                      }`}
                    >
                      {currentQuestion.selectedAnswerIndex === idx && (
                        <div className="h-2 w-2 bg-background rounded-full" />
                      )}
                    </div>
                    <span className="text-foreground">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Hint or Topic */}
          <p className="text-sm text-muted-foreground mb-6">
            <span className="font-medium">Thema:</span> {currentQuestion.question.topic}
          </p>
        </div>
      </main>

      {/* Bottom Navigation */}
      <div className="border-t border-border/70 bg-card/95 backdrop-blur p-4 fixed bottom-0 left-0 right-0 z-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between gap-4 mb-4">
            <button
              onClick={() => toggleMarkQuestion(session.currentQuestionIndex)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                currentQuestion.isMarked
                  ? "bg-amber-100 text-amber-700"
                  : "border border-border/70 text-muted-foreground hover:bg-muted"
              }`}
            >
              <Flag className="h-4 w-4" />
              <span className="text-sm">Markieren</span>
            </button>

            <button
              onClick={() => setShowQuestionsPanel(!showQuestionsPanel)}
              className="px-3 py-2 rounded-lg border border-border/70 text-sm font-medium hover:bg-muted transition sm:hidden"
            >
              Übersicht
            </button>

            <div className="text-xs text-muted-foreground">
              {stats?.answered}/{stats?.total} beantwortet • {stats?.marked} markiert
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={previousQuestion}
              disabled={session.currentQuestionIndex === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border/70 hover:bg-muted transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              Zurück
            </button>

            <button
              onClick={nextQuestion}
              disabled={session.currentQuestionIndex === session.questions.length - 1}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border/70 hover:bg-muted transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Weiter
              <ChevronRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="flex-1 px-4 py-2 rounded-lg bg-foreground text-background font-semibold hover:opacity-90 transition"
            >
              Prüfung abgeben
            </button>

            <button
              onClick={() => setShowAbandonConfirm(true)}
              className="px-4 py-2 rounded-lg border border-border/70 hover:bg-muted transition"
            >
              Verlassen
            </button>
          </div>
        </div>
      </div>

      {/* Questions Overview Panel - Mobile */}
      {showQuestionsPanel && (
        <QuestionsPanel
          session={session}
          onSelect={(idx) => {
            goToQuestion(idx);
            setShowQuestionsPanel(false);
          }}
          onClose={() => setShowQuestionsPanel(false)}
        />
      )}

      {/* Submit Confirmation Dialog */}
      {showSubmitConfirm && (
        <ConfirmDialog
          title="Prüfung wirklich abgeben?"
          message={
            stats?.unanswered && stats.unanswered > 0
              ? `Du hast noch ${stats.unanswered} unbeantwortete Fragen.`
              : "Nach der Abgabe kannst du deine Antworten nicht mehr ändern."
          }
          confirmText={stats?.unanswered && stats.unanswered > 0 ? "Trotzdem abgeben" : "Abgeben"}
          cancelText="Weiter bearbeiten"
          onConfirm={handleSubmit}
          onCancel={() => setShowSubmitConfirm(false)}
        />
      )}

      {/* Abandon Confirmation Dialog */}
      {showAbandonConfirm && (
        <ConfirmDialog
          title="Prüfung verlassen?"
          message="Dein bisheriger Stand wird gespeichert und du kannst die Prüfung später fortsetzen."
          confirmText="Verlassen"
          cancelText="Prüfung fortsetzen"
          onConfirm={() => {
            setShowAbandonConfirm(false);
            // Navigate back
            window.history.back();
          }}
          onCancel={() => setShowAbandonConfirm(false)}
          destructive
        />
      )}
    </div>
  );
}

// Questions Panel
function QuestionsPanel({
  session,
  onSelect,
  onClose,
}: {
  session: ExamSession;
  onSelect: (index: number) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center">
      <div className="w-full sm:w-96 rounded-t-2xl sm:rounded-2xl bg-card p-6 shadow-lg max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Fragenübersicht</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {session.questions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(idx)}
              className={`aspect-square rounded-lg font-semibold text-sm transition flex items-center justify-center relative ${
                idx === session.currentQuestionIndex
                  ? "bg-foreground text-background"
                  : q.selectedAnswerIndex !== null
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                    : q.isMarked
                      ? "bg-amber-100 text-amber-700 border border-amber-300"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {idx + 1}
              {q.isMarked && (
                <Flag className="h-2.5 w-2.5 absolute top-0.5 right-0.5" fill="currentColor" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Results View
function ExamResultsView() {
  const { session, calculateResults, abandonSession } = useExamSession();
  const { addMistakesFromExam } = useMistakes();
  const { recordExam } = useProgress();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [recordedProgress, setRecordedProgress] = useState(false);

  const results = calculateResults();

  // Record progress and mistakes only once
  useEffect(() => {
    if (!session || !results || recordedProgress) return;

    // Record to progress
    recordExam({
      questionCount: results.totalQuestions,
      correctCount: results.correctCount,
      wrongCount: results.wrongCount,
      unansweredCount: results.unansweredCount,
      duration: results.duration,
      accuracy: results.accuracy,
      categoryResults: results.categoryResults,
    });

    // Add wrong questions to mistakes
    const wrongQuestions = session.questions
      .filter(
        (q) => q.selectedAnswerIndex === null || q.selectedAnswerIndex !== q.question.correctAnswer,
      )
      .map((q) => q.question);

    addMistakesFromExam(wrongQuestions);
    setRecordedProgress(true);
  }, [recordedProgress, results, session, recordExam, addMistakesFromExam]);

  if (!session || !results) return null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1 overflow-y-auto pb-24">
        <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
          {/* Results Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground">Prüfung abgegeben</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Deine Auswertung wurde gespeichert.
            </p>
          </div>

          {/* Score Card */}
          <div className="rounded-2xl border border-border/70 bg-card p-8 mb-8 text-center">
            <div className="text-6xl font-bold text-foreground mb-2">{results.accuracy}%</div>
            <p className="text-lg text-muted-foreground mb-6">
              {results.correctCount} von {results.totalQuestions} richtig
            </p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="rounded-lg bg-emerald-100/50 p-4">
                <div className="text-2xl font-bold text-emerald-700">{results.correctCount}</div>
                <p className="text-sm text-muted-foreground">Richtig</p>
              </div>
              <div className="rounded-lg bg-red-100/50 p-4">
                <div className="text-2xl font-bold text-red-700">{results.wrongCount}</div>
                <p className="text-sm text-muted-foreground">Falsch</p>
              </div>
              <div className="rounded-lg bg-gray-100/50 p-4">
                <div className="text-2xl font-bold text-muted-foreground">
                  {results.unansweredCount}
                </div>
                <p className="text-sm text-muted-foreground">Nicht beantwortet</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Bearbeitungsdauer: {results.duration} Minuten
            </p>
          </div>

          {/* Category Results */}
          <section className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8 mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Ergebnis pro Themenbereich
            </h2>

            <div className="space-y-3">
              {Object.entries(results.categoryResults).map(([category, stats]) => (
                <div key={category} className="rounded-lg bg-background/70 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">{category}</span>
                    <span className="text-sm font-semibold text-foreground">
                      {Math.round((stats.correct / stats.total) * 100)}% ({stats.correct}/
                      {stats.total})
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 transition-all duration-500"
                      style={{ width: `${Math.round((stats.correct / stats.total) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Detailed Review */}
          <section className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8 mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Detaillierte Lösungskontrolle
            </h2>

            <div className="space-y-4">
              {session.questions.map((examQ, idx) => {
                const isCorrect = examQ.selectedAnswerIndex === examQ.question.correctAnswer;
                const isUnanswered = examQ.selectedAnswerIndex === null;

                return (
                  <div
                    key={idx}
                    className={`rounded-lg border-2 p-4 ${
                      isCorrect
                        ? "border-emerald-200 bg-emerald-50/50"
                        : isUnanswered
                          ? "border-gray-200 bg-background"
                          : "border-red-200 bg-red-50/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-semibold text-muted-foreground">
                            Frage {idx + 1}
                          </span>
                          {isCorrect && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                          {!isCorrect && !isUnanswered && (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          {isUnanswered && <HelpCircle className="h-5 w-5 text-gray-600" />}
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">
                          {examQ.question.question}
                        </h3>
                      </div>
                      <button
                        onClick={() =>
                          toggleFavorite({
                            id: examQ.question.id,
                            title: examQ.question.question,
                            category: examQ.question.category,
                            source: "pruefungssimulation",
                            description: examQ.question.topic,
                            savedAt: Date.now(),
                          })
                        }
                        className={`text-sm px-3 py-1 rounded-lg transition ${
                          isFavorite(examQ.question.id)
                            ? "bg-amber-100 text-amber-700"
                            : "border border-border/70 text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        Als Favorit
                      </button>
                    </div>

                    <div className="space-y-2 text-sm">
                      {!isUnanswered && (
                        <div>
                          <p className="text-muted-foreground">Deine Antwort:</p>
                          <p className="font-medium text-foreground">
                            {examQ.question.options[examQ.selectedAnswerIndex!]}
                          </p>
                        </div>
                      )}
                      {isUnanswered && (
                        <p className="text-muted-foreground italic">Nicht beantwortet</p>
                      )}

                      <div>
                        <p className="text-muted-foreground">Richtige Antwort:</p>
                        <p className="font-medium text-emerald-700">
                          {examQ.question.options[examQ.question.correctAnswer]}
                        </p>
                      </div>

                      {examQ.question.explanation && (
                        <div className="mt-3 p-3 rounded bg-background/70">
                          <p className="text-xs font-semibold text-muted-foreground mb-1">
                            Erklärung:
                          </p>
                          <p className="text-foreground">{examQ.question.explanation}</p>
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground mt-2">
                        {examQ.question.reference}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <Link
              to="/lernen/akademie"
              className="px-6 py-3 rounded-2xl font-semibold border border-border/70 bg-background text-foreground hover:bg-muted transition text-center"
            >
              Zur Akademie
            </Link>
            <Link
              to="/lernen/akademie/fehlertrainer"
              className="px-6 py-3 rounded-2xl font-semibold bg-foreground text-background hover:opacity-90 transition text-center"
            >
              Fehler trainieren
            </Link>
          </div>

          <button
            onClick={() => {
              abandonSession();
              // Reset to configuration screen would be done by re-rendering
              window.location.href = "/lernen/pruefungssimulation";
            }}
            className="w-full px-6 py-3 rounded-2xl font-semibold border border-border/70 bg-background text-foreground hover:bg-muted transition"
          >
            Neue Prüfung starten
          </button>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

// Confirmation Dialog Component
function ConfirmDialog({
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  destructive = false,
}: {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="rounded-2xl bg-card p-6 max-w-sm">
        <h2 className="text-xl font-semibold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground mb-6">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg border border-border/70 text-foreground hover:bg-muted transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
              destructive
                ? "bg-red-600 text-white hover:opacity-90"
                : "bg-foreground text-background hover:opacity-90"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
