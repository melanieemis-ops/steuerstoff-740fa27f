import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import {
  deleteCase,
  getCase,
  relativeTime,
  type CaseRecord,
} from "@/lib/casesStore";
import {
  ANSWER_MODES,
  type AnswerMode,
  KIND_LABEL,
  riskLabel,
  type Risk,
} from "@/lib/analyze";
import { ArrowLeft, BookOpen, Check, Copy, Download, Trash2 } from "lucide-react";

export const Route = createFileRoute("/fall/$caseId")({
  component: FallPage,
  head: () => ({ meta: [{ title: "Fall · steuerstoff" }] }),
});

function riskClasses(r: Risk): string {
  if (r === "gruen") return "bg-emerald-500/15 text-emerald-700 border-emerald-500/40";
  if (r === "gelb") return "bg-amber-500/15 text-amber-700 border-amber-500/40";
  return "bg-red-500/15 text-red-700 border-red-500/40";
}

function FallPage() {
  const { caseId } = Route.useParams();
  const navigate = useNavigate();
  const [rec, setRec] = useState<CaseRecord | undefined>(undefined);
  const [mode, setMode] = useState<AnswerMode>("kurz");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const found = getCase(caseId);
    if (!found) {
      throw notFound();
    }
    setRec(found);
  }, [caseId]);

  const answerText = useMemo(() => rec?.analysis.answers[mode] ?? "", [rec, mode]);

  if (!rec) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex-1 p-10 text-center text-sm text-muted-foreground">Lädt…</main>
        <SiteFooter />
      </div>
    );
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(answerText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  function handleExport() {
    if (!rec) return;
    const a = rec.analysis;
    const txt = [
      `STEUERSTOFF — Fallzusammenfassung`,
      `Titel: ${rec.title}`,
      `Thema: ${rec.topic}`,
      `Erstellt: ${new Date(rec.createdAt).toLocaleString("de-DE")}`,
      ``,
      `Sachverhalt:`,
      rec.description,
      ``,
      `Risikostufe: ${riskLabel(a.risk)}`,
      `Begründung: ${a.riskReason}`,
      ``,
      `Zusammenfassung:`,
      a.summary,
      ``,
      `Fehlende Angaben:`,
      ...a.missing.map((m) => `- ${m}`),
      ``,
      `Rückfragen:`,
      ...a.questions.map((q, i) => `${i + 1}. ${q}`),
      ``,
      `Handlungsempfehlung:`,
      a.recommendation,
      ``,
      `--- Antwort (${ANSWER_MODES.find((m) => m.id === mode)?.label}) ---`,
      answerText,
    ].join("\n");
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${rec.title.replace(/[^\w\-äöüÄÖÜß ]+/g, "_").slice(0, 60)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleDelete() {
    if (!rec) return;
    if (!confirm("Diesen Fall wirklich löschen?")) return;
    deleteCase(rec.id);
    navigate({ to: "/fallverlauf" });
  }

  const a = rec.analysis;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
          <Link
            to="/fallverlauf"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Fallverlauf
          </Link>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <span className="inline-block rounded border border-border bg-background px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                {rec.topic}
              </span>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {rec.title}
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Erstellt {relativeTime(rec.createdAt)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4" /> Export .txt
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" /> Löschen
              </Button>
            </div>
          </div>

          {/* Risiko + Zusammenfassung */}
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className={`rounded-2xl border p-4 shadow-card-soft ${riskClasses(a.risk)}`}>
              <p className="text-[11px] uppercase tracking-wide opacity-80">Risikostufe</p>
              <p className="mt-1 text-lg font-semibold">{riskLabel(a.risk)}</p>
              <p className="mt-2 text-xs leading-relaxed opacity-90">{a.riskReason}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-card-soft lg:col-span-2">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Zusammenfassung
              </p>
              <p className="mt-1 text-sm leading-relaxed text-foreground">{a.summary}</p>
              <p className="mt-3 text-[11px] uppercase tracking-wide text-muted-foreground">
                Eingegebener Sachverhalt
              </p>
              <p className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">
                {rec.description}
              </p>
            </div>
          </div>

          {/* Fehlende Angaben + Rückfragen */}
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-card-soft">
              <h2 className="text-sm font-semibold text-foreground">Erkannte fehlende Angaben</h2>
              <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                {a.missing.map((m) => (
                  <li key={m} className="flex gap-2">
                    <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-card-soft">
              <h2 className="text-sm font-semibold text-foreground">Vorgeschlagene Rückfragen</h2>
              <ol className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                {a.questions.map((q, i) => (
                  <li key={q} className="flex gap-2">
                    <span className="shrink-0 font-medium text-foreground">{i + 1}.</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Handlungsempfehlung */}
          <div className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-card-soft">
            <h2 className="text-sm font-semibold text-foreground">Handlungsempfehlung</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.recommendation}</p>
          </div>

          {/* Antwortmodus */}
          <div className="mt-6 rounded-2xl border border-border bg-card shadow-card-soft">
            <div className="border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold text-foreground">Antwortmodus</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Wähle, in welcher Form die Antwort generiert werden soll.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {ANSWER_MODES.map((m) => (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={
                      "rounded-full border px-3 py-1 text-xs transition-colors " +
                      (mode === m.id
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-card text-muted-foreground hover:text-foreground")
                    }
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {ANSWER_MODES.find((m) => m.id === mode)?.label}
                </span>
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Kopiert" : "Kopieren"}
                </Button>
              </div>
              <pre className="mt-2 max-h-[420px] overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-background p-3 text-sm leading-relaxed text-foreground">
                {answerText}
              </pre>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
