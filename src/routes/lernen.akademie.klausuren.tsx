import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, FileText, Tag } from "lucide-react";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { examCases } from "@/data/examCases";

export const Route = createFileRoute("/lernen/akademie/klausuren")({
  validateSearch: () => ({}),
  component: KlausurenPage,
  head: () => ({
    meta: [
      { title: "Klausurtraining · steuerstoff" },
      {
        name: "description",
        content:
          "Bearbeite echte steuerliche Prüfungsfälle und übe schrittweise mit Lösungshinweisen.",
      },
    ],
  }),
});

const DIFFICULTY_COLORS: Record<string, string> = {
  Einsteiger: "bg-emerald-100 text-emerald-800",
  Fortgeschritten: "bg-amber-100 text-amber-800",
  Experte: "bg-red-100 text-red-800",
};

function KlausurenPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b border-border/60 bg-card/40">
          <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
            <Link
              to="/akademie"
              className="inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück zur Akademie
            </Link>

            <div className="mt-6 flex items-start gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-foreground text-background">
                <FileText className="h-5 w-5" />
              </span>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  steuerstoff Akademie
                </p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
                  Klausurtraining
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  Bearbeite echte steuerliche Prüfungsfälle, sammle erst eigene Lösungsansätze und
                  öffne anschließend schrittweise die Lösungshinweise.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="flex flex-col gap-4">
            {examCases.map((examCase) => (
              <ExamCaseCard key={examCase.id} examCase={examCase} />
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function ExamCaseCard({ examCase }: { examCase: (typeof examCases)[number] }) {
  const difficultyClass =
    DIFFICULTY_COLORS[examCase.difficulty] ?? "bg-muted text-muted-foreground";

  const taskCount = examCase.tasks.length;

  return (
    <article className="group flex flex-col rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
            <FileText className="h-4 w-4" />
          </span>
          <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-violet-700">
            {examCase.subject}
          </span>
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${difficultyClass}`}
        >
          {examCase.difficulty}
        </span>
      </div>

      <h2 className="mt-4 text-lg font-semibold leading-snug text-foreground sm:text-xl">
        {examCase.title}
      </h2>

      <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span>
          <span className="font-semibold tabular-nums text-foreground">
            {examCase.maximumPoints.toFixed(1)}
          </span>{" "}
          Punkte
        </span>
        <span>
          {taskCount} {taskCount === 1 ? "Teilaufgabe" : "Teilaufgaben"}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {examCase.tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background px-2.5 py-0.5 text-[11px] text-muted-foreground"
          >
            <Tag className="h-2.5 w-2.5 shrink-0" />
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-5">
        <Link
          to="/lernen/akademie/klausuren/$slug"
          params={{ slug: examCase.slug }}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore – TanStack Router incorrectly infers search param inheritance from /lernen
          search={{}}
          className="inline-flex items-center gap-2 rounded-2xl bg-foreground px-5 py-3 text-sm font-semibold text-background shadow-sm transition-all hover:-translate-y-0.5 hover:opacity-90"
        >
          Fall bearbeiten
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}
