import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Flame,
  GraduationCap,
  Lock,
  Sparkles,
  Star,
  Target,
  Trophy,
} from "lucide-react";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { learningQuestions } from "@/data";
import { getLearningStatistics, loadLearningProgress } from "@/lib/learningProgress";
import { useState } from "react";
import { getUserName, hasUserName, saveUserName } from "@/lib/profile";

export const Route = createFileRoute("/akademie")({
  component: AkademiePage,
  head: () => ({
    meta: [
      { title: "Akademie · steuerstoff" },
      {
        name: "description",
        content:
          "Die steuerstoff Akademie für interaktives Lernen, Prüfungsvorbereitung und persönlichen Lernfortschritt.",
      },
    ],
  }),
});

const DAILY_GOAL = 10;

const ACADEMY_FEATURES = [
  {
    title: "Lernbereiche",
    description: "Übe Umsatzsteuer, AO, Einkommensteuer, Gewerbesteuer, Erbschaftsteuer und NPO.",
    icon: BookOpen,
    status: "ready" as const,
  },
  {
    title: "Prüfungssimulation",
    description: "Bearbeite zufällige Fragen unter realistischen Prüfungsbedingungen.",
    icon: ClipboardCheck,
    status: "soon" as const,
  },
  {
    title: "Fehlertrainer",
    description: "Wiederhole gezielt Fragen, die du noch nicht sicher beherrschst.",
    icon: Brain,
    status: "soon" as const,
  },
  {
    title: "Favoriten",
    description: "Speichere wichtige Fragen und baue dir deine persönliche Merkliste.",
    icon: Star,
    status: "soon" as const,
  },
  {
    title: "Fortschritt",
    description: "Behalte Trefferquote, Lernstand und Entwicklung im Blick.",
    icon: BarChart3,
    status: "soon" as const,
  },
  {
    title: "Erfolge",
    description: "Sammle Abzeichen, erreiche Lernziele und halte deine Serie.",
    icon: Trophy,
    status: "soon" as const,
  },
];

function AkademiePage() {
  const [userName, setUserName] = useState(getUserName());

  const [inputName, setInputName] = useState("");

  const needsName = !hasUserName();

  function handleSaveName() {
    const trimmed = inputName.trim();

    if (!trimmed) return;

    saveUserName(trimmed);

    setUserName(trimmed);
  }
  const progress = loadLearningProgress();

  const statistics = getLearningStatistics(
    learningQuestions.map((question) => question.id),
    progress,
  );

  const answeredToday = Math.min(statistics.totalAnswered, DAILY_GOAL);

  const dailyPercent = Math.round((answeredToday / DAILY_GOAL) * 100);

  const overallPercent =
    learningQuestions.length === 0
      ? 0
      : Math.round(
          ((learningQuestions.length - statistics.unseen) / learningQuestions.length) * 100,
        );

  const estimatedMinutes = Math.max(5, Math.ceil((DAILY_GOAL - answeredToday) * 1.5));

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border/60">
          <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden="true">
            <div className="absolute -left-20 top-8 h-56 w-56 rounded-full bg-amber-100/60 blur-3xl" />
            <div className="absolute -right-20 top-24 h-64 w-64 rounded-full bg-emerald-100/50 blur-3xl" />
          </div>

          <div className="relative mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
            <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-stretch">
              <div className="rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-sm backdrop-blur sm:p-8">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-background shadow-sm">
                    <GraduationCap className="h-6 w-6" />
                  </span>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      steuerstoff
                    </p>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                      Akademie
                    </h1>
                  </div>
                </div>

                <div className="mt-8">
                  {needsName ? (
                    <div className="mt-2 max-w-sm">
                      <p className="text-sm font-medium text-muted-foreground">Willkommen 👋</p>

                      <p className="mt-2 text-sm text-muted-foreground">
                        Wie dürfen wir dich nennen?
                      </p>

                      <input
                        value={inputName}
                        onChange={(e) => setInputName(e.target.value)}
                        placeholder="Dein Name"
                        className="mt-4 w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                      />

                      <button
                        onClick={handleSaveName}
                        className="mt-3 w-full rounded-2xl bg-foreground px-4 py-3 font-semibold text-background transition hover:opacity-90"
                      >
                        Weiter
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-muted-foreground">
                      Willkommen zurück, {userName} 👋
                    </p>
                  )}
                  <h2 className="mt-2 max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
                    Heute ist ein guter Tag, um Steuerrecht zu meistern.
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                    Lerne in kurzen Einheiten, wiederhole unsichere Fragen und baue dein Wissen
                    Schritt für Schritt auf.
                  </p>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Metric icon={BookOpen} label="Fragen" value={learningQuestions.length} />
                  <Metric
                    icon={CheckCircle2}
                    label="Beantwortet"
                    value={statistics.totalAnswered}
                  />
                  <Metric icon={Target} label="Genauigkeit" value={`${statistics.accuracy} %`} />
                  <Metric icon={Flame} label="Lernserie" value="1 Tag" />
                </div>

                <Link
                  to="/lerngebiete"
                  className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground px-5 py-3.5 text-sm font-semibold text-background shadow-sm transition-all hover:-translate-y-0.5 hover:opacity-90 sm:w-auto"
                >
                  Lerneinheit starten
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm sm:p-7">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Dein Fortschritt
                    </p>
                    <p className="mt-1 text-lg font-semibold text-foreground">Gesamtwissen</p>
                  </div>
                  <Sparkles className="h-5 w-5 text-amber-500" />
                </div>

                <div className="mt-8 flex justify-center">
                  <ProgressRing percent={overallPercent} />
                </div>

                <div className="mt-8 rounded-2xl border border-border/70 bg-background/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Tagesziel</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">
                        {answeredToday} von {DAILY_GOAL} Fragen
                      </p>
                    </div>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                      {dailyPercent} %
                    </span>
                  </div>

                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-foreground transition-[width] duration-500"
                      style={{ width: `${dailyPercent}%` }}
                    />
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    Noch ungefähr {estimatedMinutes} Minuten bis zu deinem heutigen Ziel.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Deine Akademie
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Lernen, prüfen und sicherer werden
              </h2>
            </div>

            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              Starte mit den Lernbereichen. Die weiteren Werkzeuge werden Schritt für Schritt
              freigeschaltet.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {ACADEMY_FEATURES.map((feature) => (
              <AcademyCard key={feature.title} {...feature} />
            ))}
            <ExamTrainingCard />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-3.5">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <p className="mt-3 text-xl font-semibold tabular-nums text-foreground">{value}</p>
      <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

function ProgressRing({ percent }: { percent: number }) {
  const safePercent = Math.max(0, Math.min(100, percent));
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safePercent / 100) * circumference;

  return (
    <div className="relative h-36 w-36">
      <svg
        viewBox="0 0 128 128"
        className="h-full w-full -rotate-90"
        role="img"
        aria-label={`${safePercent} Prozent Gesamtfortschritt`}
      >
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-muted"
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-foreground transition-[stroke-dashoffset] duration-700"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold tabular-nums text-foreground">{safePercent}%</span>
        <span className="mt-0.5 text-[11px] font-medium text-muted-foreground">gelernt</span>
      </div>
    </div>
  );
}

function AcademyCard({
  title,
  description,
  icon: Icon,
  status,
}: {
  title: string;
  description: string;
  icon: typeof BookOpen;
  status: "ready" | "soon";
}) {
  if (status === "ready") {
    return (
      <Link
        to="/lerngebiete"
        className="group flex min-h-52 flex-col rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-foreground text-background">
            <Icon className="h-5 w-5" />
          </span>
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
            Verfügbar
          </span>
        </div>

        <h3 className="mt-5 text-xl font-semibold text-foreground">{title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
          Öffnen
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </Link>
    );
  }

  return (
    <article className="flex min-h-52 flex-col rounded-[1.75rem] border border-border/60 bg-card/60 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Icon className="h-5 w-5" />
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          <Lock className="h-3 w-3" />
          Bald
        </span>
      </div>

      <h3 className="mt-5 text-xl font-semibold text-foreground">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
      <span className="mt-5 text-xs font-medium text-muted-foreground">
        Wird als Nächstes ausgebaut
      </span>
    </article>
  );
}

function ExamTrainingCard() {
  return (
    <Link
      to="/lernen/akademie/klausuren"
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore – TanStack Router incorrectly infers search param inheritance from /lernen
      search={{}}
      className="group flex min-h-52 flex-col rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
          <FileText className="h-5 w-5" />
        </span>
        <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-violet-700">
          1 Fall verfügbar
        </span>
      </div>

      <h3 className="mt-5 text-xl font-semibold text-foreground">Klausurtraining</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
        Echte Prüfungsfälle Schritt für Schritt bearbeiten
      </p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
        Klausuren öffnen
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
