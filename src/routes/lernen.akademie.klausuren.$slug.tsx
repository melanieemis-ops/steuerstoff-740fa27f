import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  Tag,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { examCases, type ExamCase, type SolutionHint } from "@/data/examCases";

export const Route = createFileRoute("/lernen/akademie/klausuren/$slug")({
  validateSearch: () => ({}),
  loader: ({ params }) => {
    const found = examCases.find((c) => c.slug === params.slug);
    if (!found) throw notFound();
    return found;
  },
  component: KlausurDetailPage,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold text-foreground">Fall nicht gefunden</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Dieser Klausurfall existiert nicht oder wurde entfernt.
        </p>
        <Link
          to="/lernen/akademie/klausuren"
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore – TanStack Router incorrectly infers search param inheritance from /lernen
          search={{}}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-foreground px-5 py-3 text-sm font-semibold text-background"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zur Übersicht
        </Link>
      </div>
    </div>
  ),
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.title} · Klausurtraining · steuerstoff`
          : "Klausurtraining · steuerstoff",
      },
    ],
  }),
});

const STORAGE_KEY_PREFIX = "steuerstoff_exam_";

function storageKey(slug: string) {
  return `${STORAGE_KEY_PREFIX}${slug}`;
}

type ExamProgress = {
  ownAnswer: string;
  revealedHints: string[];
  resultRevealed: boolean;
  solutionRevealed: boolean;
  completed: boolean;
};

function loadProgress(slug: string): ExamProgress {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(storageKey(slug)) : null;
    if (raw) return JSON.parse(raw) as ExamProgress;
  } catch {
    // ignore
  }
  return {
    ownAnswer: "",
    revealedHints: [],
    resultRevealed: false,
    solutionRevealed: false,
    completed: false,
  };
}

function saveProgress(slug: string, progress: ExamProgress) {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey(slug), JSON.stringify(progress));
    }
  } catch {
    // ignore
  }
}

function KlausurDetailPage() {
  const examCase = Route.useLoaderData() as ExamCase;

  const [progress, setProgress] = useState<ExamProgress>(() => loadProgress(examCase.slug));
  const [showSolutionConfirm, setShowSolutionConfirm] = useState(false);
  const [mistakesOpen, setMistakesOpen] = useState(false);

  useEffect(() => {
    saveProgress(examCase.slug, progress);
  }, [examCase.slug, progress]);

  function updateProgress(patch: Partial<ExamProgress>) {
    setProgress((prev) => ({ ...prev, ...patch }));
  }

  function revealHint(hintId: string) {
    if (!progress.revealedHints.includes(hintId)) {
      updateProgress({
        revealedHints: [...progress.revealedHints, hintId],
      });
    }
  }

  function revealResult() {
    updateProgress({ resultRevealed: true });
  }

  function requestSolutionReveal() {
    setShowSolutionConfirm(true);
  }

  function confirmSolutionReveal() {
    updateProgress({ solutionRevealed: true });
    setShowSolutionConfirm(false);
  }

  function markCompleted() {
    updateProgress({ completed: true });
  }

  function clearAnswer() {
    updateProgress({ ownAnswer: "" });
  }

  const revealedCount =
    progress.revealedHints.length +
    (progress.resultRevealed ? 1 : 0) +
    (progress.solutionRevealed ? 1 : 0);
  const totalSteps = examCase.solutionHints.length + 2; // hints + result + solution
  const progressPercent = Math.round((revealedCount / totalSteps) * 100);

  const taskCount = examCase.tasks.length;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        {/* Header */}
        <section className="border-b border-border/60 bg-card/40">
          <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
            <Link
              to="/lernen/akademie/klausuren"
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore – TanStack Router incorrectly infers search param inheritance from /lernen
              search={{}}
              className="inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Klausurübersicht
            </Link>

            <div className="mt-5 flex items-start gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-foreground text-background">
                <FileText className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {examCase.subject}
                </p>
                <h1 className="mt-1 text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
                  {examCase.title}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Maximal {examCase.maximumPoints.toFixed(1)} Punkte · {taskCount}{" "}
                  {taskCount === 1 ? "Teilaufgabe" : "Teilaufgaben"}
                </p>
              </div>
            </div>

            {/* Tags */}
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

            {/* Progress bar */}
            <div className="mt-5">
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <p className="text-xs font-medium text-muted-foreground">Fortschritt</p>
                {progress.completed && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Bearbeitet
                  </span>
                )}
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-foreground transition-[width] duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {revealedCount} von {totalSteps} Schritten geöffnet
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 pb-safe sm:px-6 sm:py-8">
          {/* Sachverhalt */}
          <ContentSection title="Sachverhalt" defaultOpen>
            <div className="prose-sm max-w-none">
              {examCase.caseText.split("\n\n").map((paragraph, i) => (
                <p key={i} className="mb-3 text-sm leading-relaxed text-foreground last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </ContentSection>

          {/* Aufgabenstellung */}
          <ContentSection title="Aufgabenstellung" defaultOpen>
            <div className="space-y-4">
              {examCase.tasks.map((task) => (
                <div key={task.id}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {task.label}
                    {task.points !== undefined && (
                      <span className="ml-2 normal-case font-normal">
                        ({task.points.toFixed(1)} Punkte)
                      </span>
                    )}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground">{task.text}</p>
                </div>
              ))}
            </div>
          </ContentSection>

          {/* Eigener Lösungsansatz */}
          <section className="rounded-[1.75rem] border border-border/70 bg-card p-5 sm:p-6">
            <h2 className="text-base font-semibold text-foreground">Dein Lösungsansatz</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Formuliere deinen Ansatz, bevor du die Hinweise öffnest.
            </p>

            <textarea
              value={progress.ownAnswer}
              onChange={(e) => updateProgress({ ownAnswer: e.target.value })}
              placeholder="Prüfe Leistungsart, Leistungsort, Steuerbefreiung, Option und Steuersatz …"
              rows={8}
              className="mt-4 w-full resize-y rounded-2xl border border-border bg-background px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-2 focus:ring-ring"
              data-no-swipe="true"
            />

            <div className="mt-3 flex flex-wrap gap-2">
              {progress.ownAnswer.trim().length > 0 && (
                <button
                  type="button"
                  onClick={clearAnswer}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-background px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Eingabe löschen
                </button>
              )}
              {!progress.completed && (
                <button
                  type="button"
                  onClick={markCompleted}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-background px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Als bearbeitet markieren
                </button>
              )}
            </div>
          </section>

          {/* Lösungshinweise */}
          <section className="rounded-[1.75rem] border border-border/70 bg-card p-5 sm:p-6">
            <h2 className="text-base font-semibold text-foreground">Lösungshinweise</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Öffne die Hinweise schrittweise – nur wenn du nicht weiterkommst.
            </p>

            <div className="mt-4 space-y-3">
              {examCase.solutionHints.map((hint: SolutionHint) => {
                const revealed = progress.revealedHints.includes(hint.id);
                return (
                  <div
                    key={hint.id}
                    className="overflow-hidden rounded-2xl border border-border/60 bg-background"
                  >
                    {revealed ? (
                      <div className="p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {hint.title}
                        </p>
                        <HintContent content={hint.content} />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => revealHint(hint.id)}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        {hint.title} anzeigen
                        <ChevronDown className="h-4 w-4 shrink-0" />
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Result summary */}
              <div className="overflow-hidden rounded-2xl border border-border/60 bg-background">
                {progress.resultRevealed ? (
                  <div className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Ergebnisübersicht
                    </p>
                    <ResultSummary summary={examCase.resultSummary ?? ""} />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={revealResult}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    Ergebnisübersicht anzeigen
                    <ChevronDown className="h-4 w-4 shrink-0" />
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Musterlösung */}
          <section className="rounded-[1.75rem] border border-border/70 bg-card p-5 sm:p-6">
            <h2 className="text-base font-semibold text-foreground">Musterlösung</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Die vollständige Lösung – erst öffnen, wenn du deinen Ansatz formuliert hast.
            </p>

            <div className="mt-4">
              {progress.solutionRevealed ? (
                <div className="rounded-2xl border border-border/60 bg-background p-4">
                  <ModelSolutionContent
                    solution={examCase.modelSolution ?? ""}
                    deepDive={examCase.deepDive}
                  />
                </div>
              ) : showSolutionConfirm ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                    <div>
                      <p className="text-sm font-semibold text-amber-900">
                        Möchtest du wirklich die vollständige Lösung anzeigen?
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-amber-800">
                        Versuche vorher, zumindest einen eigenen Lösungsansatz zu formulieren.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setShowSolutionConfirm(false)}
                          className="rounded-xl border border-amber-300 bg-white px-4 py-2 text-xs font-semibold text-amber-900 transition-colors hover:bg-amber-100"
                        >
                          Weiter selbst lösen
                        </button>
                        <button
                          type="button"
                          onClick={confirmSolutionReveal}
                          className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-amber-700"
                        >
                          Lösung anzeigen
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={requestSolutionReveal}
                  className="flex w-full items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background px-4 py-3.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  Musterlösung anzeigen
                  <ChevronDown className="h-4 w-4 shrink-0" />
                </button>
              )}
            </div>
          </section>

          {/* Rechtsgrundlagen */}
          <section className="rounded-[1.75rem] border border-border/70 bg-card p-5 sm:p-6">
            <h2 className="text-base font-semibold text-foreground">Rechtsgrundlagen</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {examCase.legalBases.map((basis) => (
                <span
                  key={basis}
                  className="cursor-default rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-800 transition-colors hover:bg-violet-100"
                >
                  {basis}
                </span>
              ))}
            </div>
          </section>

          {/* Typische Klausurfehler */}
          <section className="rounded-[1.75rem] border border-border/70 bg-card overflow-hidden">
            <button
              type="button"
              onClick={() => setMistakesOpen((o) => !o)}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-accent/50 sm:px-6"
            >
              <h2 className="text-base font-semibold text-foreground">Typische Klausurfehler</h2>
              {mistakesOpen ? (
                <ChevronUp className="h-5 w-5 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
              )}
            </button>

            {mistakesOpen && (
              <div className="border-t border-border/60 px-5 pb-5 pt-4 sm:px-6">
                <ul className="space-y-2">
                  {examCase.commonMistakes.map((mistake, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                      {mistake}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Bottom padding for mobile nav */}
          <div className="h-4" />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function HintContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const paragraphs = content.split("\n\n");
  const hasNumberedList = lines.some((l: string) => /^\d+\./.test(l.trim()));
  const prose = paragraphs.filter(
    (p: string) => !p.split("\n").every((l: string) => /^\d+\./.test(l.trim())),
  );
  const numberedLines = lines.filter((l: string) => /^\d+\./.test(l.trim()));

  return (
    <div className="mt-2 space-y-1.5">
      {prose.map((block: string, i: number) => (
        <p key={i} className="text-sm leading-relaxed text-foreground">
          {block}
        </p>
      ))}
      {hasNumberedList && (
        <ol className="mt-1 space-y-1 pl-4 text-sm leading-relaxed text-foreground list-decimal">
          {numberedLines.map((l: string, i: number) => (
            <li key={i}>{l.replace(/^\d+\.\s*/, "")}</li>
          ))}
        </ol>
      )}
    </div>
  );
}

function ContentSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-card">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-accent/50 sm:px-6"
      >
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {open ? (
          <ChevronUp className="h-5 w-5 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
        )}
      </button>

      {open && <div className="border-t border-border/60 px-5 pb-5 pt-4 sm:px-6">{children}</div>}
    </section>
  );
}

function ResultSummary({ summary }: { summary: string }) {
  const blocks = summary.split("\n\n");

  return (
    <div className="mt-3 space-y-4">
      {blocks.map((block, i) => {
        if (block.startsWith("---")) {
          return <hr key={i} className="border-border/60" />;
        }
        if (block.startsWith("**") && block.includes("Einheit")) {
          const lines = block.split("\n");
          const heading = lines[0].replace(/\*\*/g, "");
          const rest = lines.slice(1).join("\n");
          return (
            <div key={i} className="rounded-2xl border border-border/60 bg-card p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {heading}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground whitespace-pre-line">
                {rest.trim()}
              </p>
            </div>
          );
        }
        return (
          <p key={i} className="text-sm leading-relaxed text-muted-foreground">
            {block.replace(/\*\*/g, "")}
          </p>
        );
      })}
    </div>
  );
}

function ModelSolutionContent({ solution, deepDive }: { solution: string; deepDive?: string }) {
  const blocks = solution.split("\n\n");

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {blocks.map((block, i) => {
          if (block.startsWith("---")) {
            return <hr key={i} className="border-border/60" />;
          }
          if (block.startsWith("**")) {
            const lines = block.split("\n");
            const heading = lines[0].replace(/\*\*/g, "");
            const rest = lines.slice(1).join("\n");
            return (
              <div key={i}>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {heading}
                </p>
                {rest.trim() && (
                  <p className="mt-1.5 text-sm leading-relaxed text-foreground whitespace-pre-line">
                    {rest.trim()}
                  </p>
                )}
              </div>
            );
          }
          if (block.startsWith("- ")) {
            return (
              <ul key={i} className="space-y-1 pl-3">
                {block.split("\n").map((l, li) => (
                  <li
                    key={li}
                    className="flex items-start gap-2 text-sm leading-relaxed text-foreground"
                  >
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                    {l.replace(/^-\s*/, "")}
                  </li>
                ))}
              </ul>
            );
          }
          return (
            <p key={i} className="text-sm leading-relaxed text-foreground">
              {block}
            </p>
          );
        })}
      </div>

      {deepDive && (
        <div className="mt-4 rounded-2xl border border-violet-200 bg-violet-50 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-600">
            Vertiefung für weitere Teilaufgaben
          </p>
          <DeepDiveContent content={deepDive} />
        </div>
      )}
    </div>
  );
}

function DeepDiveContent({ content }: { content: string }) {
  const blocks = content.split("\n\n");

  return (
    <div className="mt-3 space-y-3">
      {blocks.map((block, i) => {
        if (block.startsWith("**")) {
          const lines = block.split("\n");
          const heading = lines[0].replace(/\*\*/g, "");
          const rest = lines.slice(1).join("\n");
          return (
            <div key={i}>
              <p className="text-xs font-semibold text-violet-800">{heading}</p>
              {rest.trim() && (
                <p className="mt-1 text-sm leading-relaxed text-violet-900 whitespace-pre-line">
                  {rest.trim()}
                </p>
              )}
            </div>
          );
        }
        if (block.includes("|")) {
          // Render table as responsive cards on mobile
          const rows = block.split("\n").filter((l) => l.trim() && !l.match(/^[\s|:-]+$/));
          const isHeader = (r: string) => r.includes("Posten") || r.includes("Betrag");
          const dataRows = rows.filter((r) => !isHeader(r));
          return (
            <div key={i} className="overflow-x-auto rounded-xl">
              <table className="w-full text-sm">
                <tbody>
                  {dataRows.map((row, ri) => {
                    const cells = row
                      .split("|")
                      .map((c) => c.trim())
                      .filter(Boolean);
                    return (
                      <tr key={ri} className="border-b border-violet-200 last:border-0">
                        {cells.map((cell, ci) => (
                          <td
                            key={ci}
                            className={`py-1.5 pr-4 text-sm text-violet-900 ${ci === 1 ? "font-semibold tabular-nums" : ""}`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        }
        if (block.startsWith("- ")) {
          return (
            <ul key={i} className="space-y-1 pl-3">
              {block.split("\n").map((l, li) => (
                <li
                  key={li}
                  className="flex items-start gap-2 text-sm leading-relaxed text-violet-900"
                >
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-violet-500" />
                  {l.replace(/^-\s*/, "")}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="text-sm leading-relaxed text-violet-900">
            {block.replace(/\*\*/g, "")}
          </p>
        );
      })}
    </div>
  );
}
