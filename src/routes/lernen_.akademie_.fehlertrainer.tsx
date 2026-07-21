import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Brain, CheckCircle2, Flame, RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { useMistakes, type Mistake } from "@/hooks/useMistakes";

export const Route = createFileRoute("/lernen_/akademie_/fehlertrainer")({
  component: MistakeTrainerPage,
  head: () => ({
    meta: [
      { title: "Fehlertrainer · steuerstoff" },
      { name: "description", content: "Trainiere gezielt deine Fehlerfragen bis zur Meisterschaft." },
    ],
  }),
});

function MistakeTrainerPage() {
  const { mistakes, getActiveMistakes, getMasteredMistakes, removeMistake, clearActiveMistakes } =
    useMistakes();
  const router = useRouter();
  const activeMistakes = getActiveMistakes();
  const masteredMistakes = getMasteredMistakes();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sortedMistakes, setSortedMistakes] = useState<Mistake[]>([]);

  useEffect(() => {
    setSortedMistakes(
      [...activeMistakes].sort((a, b) => {
        // Show recently wrong-answered questions first
        return b.lastWrongAt - a.lastWrongAt;
      }),
    );
  }, [activeMistakes]);

  const handleStartTraining = () => {
    router.navigate({ to: "/lernen/akademie/fehlertrainer/training" });
  };

  const handleClearAll = () => {
    clearActiveMistakes();
    setShowDeleteConfirm(false);
  };

  if (sortedMistakes.length === 0 && masteredMistakes.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex-1">
          <section className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
            <Link
              to="/lernen/akademie"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück zur Akademie
            </Link>

            <div className="mt-8 flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-background shadow-sm">
                <Brain className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  steuerstoff Akademie
                </p>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  Fehlertrainer
                </h1>
              </div>
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              Wiederhole Fragen, die du noch nicht sicher beherrschst.
            </p>

            <div className="mt-12 space-y-4 text-center">
              <Brain className="mx-auto h-16 w-16 text-muted-foreground/50" />
              <h2 className="text-xl font-semibold text-foreground">Keine offenen Fehlerfragen</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Falsch beantwortete Lernfragen werden automatisch hier gesammelt.
              </p>
              <Link
                to="/lerngebiete"
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-foreground px-5 py-3 text-sm font-semibold text-background"
              >
                Zum Lernen
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </Link>
            </div>
          </section>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        <section className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
          <Link
            to="/lernen/akademie"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zur Akademie
          </Link>

          <div className="mt-8 flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-background shadow-sm">
              <Brain className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                steuerstoff Akademie
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Fehlertrainer
              </h1>
            </div>
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            Wiederhole Fragen, die du noch nicht sicher beherrschst.
          </p>

          {/* Statistics */}
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <StatCard
              icon={Flame}
              label="Aktive Fragen"
              value={sortedMistakes.length}
              color="red"
            />
            <StatCard
              icon={CheckCircle2}
              label="Gemeistert"
              value={masteredMistakes.length}
              color="green"
            />
            <StatCard
              icon={Brain}
              label="Trainiert"
              value={mistakes.length}
              color="blue"
            />
          </div>

          {/* Training Button */}
          <button
            onClick={handleStartTraining}
            disabled={sortedMistakes.length === 0}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground px-5 py-3.5 text-sm font-semibold text-background shadow-sm transition-all hover:-translate-y-0.5 hover:opacity-90 disabled:opacity-50 disabled:hover:translate-y-0 sm:w-auto"
          >
            <RotateCcw className="h-4 w-4" />
            Training starten
          </button>

          {/* Active Mistakes List */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-foreground">Zu übende Fragen</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {sortedMistakes.length} Fragen · Zuletzt falsch beantwortete zuerst
            </p>

            <div className="mt-4 space-y-2">
              {sortedMistakes.map((mistake) => (
                <MistakeCard key={mistake.id} mistake={mistake} onRemove={removeMistake} />
              ))}
            </div>

            {sortedMistakes.length > 0 && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Alle aktiven Fragen löschen
              </button>
            )}
          </div>

          {/* Mastered Mistakes */}
          {masteredMistakes.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-foreground">Gemeisterte Fragen</h3>
              <p className="mt-1 text-sm text-muted-foreground">{masteredMistakes.length} Fragen</p>

              <div className="mt-4 space-y-2">
                {masteredMistakes.map((mistake) => (
                  <div
                    key={mistake.id}
                    className="rounded-2xl border border-border/50 bg-card/50 p-4 opacity-75"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-foreground/20 px-2.5 py-0.5 text-[11px] font-semibold text-foreground/80">
                            {mistake.category}
                          </span>
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                            Gemeistert
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-medium text-foreground line-clamp-2">
                          {mistake.questionText}
                        </p>
                      </div>
                      <button
                        onClick={() => removeMistake(mistake.id)}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-red-100/50"
                        aria-label="Löschen"
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Confirm Delete Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 pb-safe pt-safe">
            <div className="w-full max-w-sm rounded-3xl border border-border bg-background p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-foreground">
                Alle aktiven Fragen löschen?
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Diese Aktion kann nicht rückgängig gemacht werden. Du kannst die Fragen wieder
                speichern, indem du sie erneut falsch beantwortest.
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex-1 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Löschen
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Brain;
  label: string;
  value: number;
  color: "red" | "green" | "blue";
}) {
  const colorClass = {
    red: "bg-red-100 text-red-600",
    green: "bg-emerald-100 text-emerald-600",
    blue: "bg-blue-100 text-blue-600",
  }[color];

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
        </div>
        <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${colorClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function MistakeCard({
  mistake,
  onRemove,
}: {
  mistake: Mistake;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-foreground px-2.5 py-0.5 text-[11px] font-semibold text-background">
              {mistake.category}
            </span>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              {mistake.topic}
            </span>
          </div>
          <p className="mt-3 text-sm font-medium text-foreground line-clamp-2">
            {mistake.questionText}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>
              <strong className="text-foreground">{mistake.wrongCount}×</strong> falsch
            </span>
            <span>
              <strong className="text-foreground">{mistake.correctStreak}</strong> richtig
            </span>
            <span>
              {new Date(mistake.lastWrongAt).toLocaleDateString("de-DE", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
        <button
          onClick={() => onRemove(mistake.id)}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-red-100/50"
          aria-label="Aus Fehlertrainer entfernen"
        >
          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-600" />
        </button>
      </div>
    </div>
  );
}
