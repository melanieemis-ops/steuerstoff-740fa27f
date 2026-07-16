import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createCase } from "@/lib/casesStore";
import {
  CURATED_TOPICS,
  EXAMPLES_BY_TOPIC,
  findCuratedExample,
  type CuratedExample,
} from "@/lib/curatedExamples";
import { ArrowRight, FileText, Sparkles, UploadCloud, X } from "lucide-react";

export const Route = createFileRoute("/neue-anfrage")({
  component: NeueAnfrage,
  head: () => ({ meta: [{ title: "Neue Anfrage · steuerstoff" }] }),
});

const TOPICS = [...CURATED_TOPICS];

function NeueAnfrage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState<string>("USt");
  const [description, setDescription] = useState("");
  const [selectedExampleId, setSelectedExampleId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>("");

  const canSubmit = description.trim().length >= 5;
  const visibleExamples = useMemo<CuratedExample[]>(
    () => EXAMPLES_BY_TOPIC[topic] ?? [],
    [topic],
  );

  function loadExample(example: CuratedExample) {
    setTitle(example.title);
    setTopic(example.topic);
    setDescription(example.description);
    setSelectedExampleId(example.id);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!canSubmit) {
      setError("Bitte beschreibe deine Frage oder den Sachverhalt (mindestens 5 Zeichen).");
      return;
    }

    setSubmitting(true);
    setIsAnalyzing(true);
    setAnalysisResult("");

    try {
      const desc = description.trim();
      const trimmedTitle = title.trim();

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("description", desc);

        const response = await fetch("/api/analyze-document", {
          method: "POST",
          body: formData,
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.error || "Die Unterlage konnte nicht analysiert werden.");
        }

        setAnalysisResult(data?.analysis || "");
      }

      let presetKnowledge: Parameters<typeof createCase>[0]["presetKnowledge"];
      if (selectedExampleId) {
        const example = findCuratedExample(selectedExampleId);
        if (
          example &&
          example.topic === topic &&
          example.title === trimmedTitle &&
          example.description === desc
        ) {
          presetKnowledge = {
            answer: example.answer,
            explanation: example.explanation,
            references: example.references,
            curatedReviewedAt: example.lastReviewed,
          };
        }
      }

      const derivedTitle =
        trimmedTitle.length >= 3
          ? trimmedTitle
          : desc.length > 80
            ? desc.slice(0, 77).trimEnd() + "…"
            : desc;

      const rec = createCase({
        title: derivedTitle,
        topic,
        description: desc,
        presetKnowledge,
      });
      navigate({ to: "/fall/$caseId", params: { caseId: rec.id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setSubmitting(false);
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Neue Anfrage
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Stelle eine kurze Wissensfrage oder beschreibe einen konkreten Sachverhalt — steuerstoff
            erkennt den Typ automatisch und antwortet passend: kurz und direkt oder strukturiert mit
            Rückfragen.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-5 shadow-card-soft sm:p-6"
          >
            <div>
              <label htmlFor="title" className="text-sm font-medium text-foreground">
                Titel <span className="text-muted-foreground">(optional)</span>
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setSelectedExampleId(null);
                }}
                placeholder="z. B. Bewirtungsbeleg 03/2025 oder leer lassen"
                className="mt-1.5"
                maxLength={200}
              />
            </div>

            <div>
              <label htmlFor="topic" className="text-sm font-medium text-foreground">
                Themenbereich
              </label>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {TOPICS.map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => {
                      setTopic(t);
                      setSelectedExampleId(null);
                    }}
                    className={
                      "rounded-full border px-3 py-1 text-xs transition-colors " +
                      (topic === t
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-card text-muted-foreground hover:text-foreground")
                    }
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="description" className="text-sm font-medium text-foreground">
                Frage oder Sachverhalt
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setSelectedExampleId(null);
                }}
                placeholder={
                  "Wissensfrage, z. B. „Wie viel Umsatzsteuer fällt auf Strom an?“\n\n" +
                  "Oder Sachverhalt: Beteiligte, Zeitraum, Beträge, Belege, offene Punkte …"
                }
                className="mt-1.5 min-h-[180px]"
                maxLength={4000}
              />
              <p className="mt-1 text-xs text-muted-foreground">{description.length} / 4000 Zeichen</p>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground">Unterlagen hochladen</p>
              <label
                htmlFor="document-upload"
                className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-10 text-center transition hover:bg-card"
              >
                <UploadCloud className="mb-3 h-8 w-8 text-muted-foreground" aria-hidden="true" />
                <span className="text-sm font-medium text-foreground">PDF oder Bild auswählen</span>
                <span className="mt-1 text-xs text-muted-foreground">Zulässig: PDF, JPG und PNG</span>
                <input
                  id="document-upload"
                  type="file"
                  accept=".pdf,image/jpeg,image/png"
                  className="sr-only"
                  onChange={(event) => {
                    const selectedFile = event.target.files?.[0] ?? null;
                    setFile(selectedFile);
                    setError(null);
                  }}
                />
              </label>
            </div>

            {file && (
              <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <FileText className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  aria-label="Datei entfernen"
                  className="rounded-full p-2 text-muted-foreground hover:bg-muted"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            )}

            {error && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Eingaben werden lokal gespeichert (Demo-Modus).
              </p>
              <Button type="submit" disabled={!canSubmit || submitting} className="h-10 px-5">
                <Sparkles className="h-4 w-4" />
                {submitting ? "Wird beantwortet …" : file ? "Erste Einschätzung erstellen" : "Antwort generieren"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {isAnalyzing && (
            <div className="mt-6 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
              Die Unterlage wird analysiert und in eine erste steuerliche Einschätzung umgewandelt …
            </div>
          )}

          {analysisResult && (
            <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-card-soft">
              <h2 className="text-lg font-semibold text-foreground">Erste steuerliche Einschätzung</h2>
              <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-foreground">
                {analysisResult}
              </div>
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-sm font-medium text-foreground">Beispiele für {topic}</h2>
            {visibleExamples.length === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Für diesen Themenbereich sind aktuell keine Beispiele hinterlegt.
              </p>
            ) : (
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {visibleExamples.map((ex) => {
                  const isSelected = selectedExampleId === ex.id;
                  return (
                    <button
                      key={ex.id}
                      type="button"
                      onClick={() => loadExample(ex)}
                      className={
                        "rounded-xl border p-3 text-left text-xs shadow-card-soft transition-colors " +
                        (isSelected
                          ? "border-foreground/60 bg-card text-foreground"
                          : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground")
                      }
                    >
                      <span className="mb-1 inline-block rounded border border-border bg-background px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
                        {ex.topic}
                      </span>
                      <p className="text-sm font-medium text-foreground">{ex.title}</p>
                      <p className="mt-1 line-clamp-2">{ex.description}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
