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
import { chatApiUrl } from "@/lib/api";
import { ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/neue-anfrage")({
  component: NeueAnfrage,
  head: () => ({ meta: [{ title: "Neue Anfrage · steuerstoff" }] }),
});

const TOPICS = [...CURATED_TOPICS];

const META_MARKER = "<<STEUERSTOFF_META>>";

/**
 * Ruft denselben KI-Backend-Flow wie der Chat auf (POST /api/chat) und
 * puffert den Text-Stream. Trennt danach eine kompakte Kurzantwort (1. Satz)
 * von der Erläuterung ab und extrahiert erwähnte Paragraphen als
 * References. Bei Netzwerk-/Serverfehlern wirft die Funktion — der Aufrufer
 * fällt dann auf die lokale Analyse-Logik zurück.
 */
async function fetchAiAnswer(prompt: string): Promise<{
  answer: string;
  explanation: string;
  references: string[];
} | null> {
  const resp = await fetch(chatApiUrl("/api/chat"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: prompt, history: [] }),
  });
  if (!resp.ok || !resp.body) {
    throw new Error(`HTTP ${resp.status}`);
  }
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
  }
  buf += decoder.decode();
  const metaIdx = buf.indexOf(META_MARKER);
  const text = (metaIdx >= 0 ? buf.slice(0, metaIdx) : buf).trim();
  if (!text) return null;
  // Erster Satz = Kurzantwort; Rest = Erläuterung.
  const m = text.match(/^([^.!?]+[.!?])\s*([\s\S]*)$/);
  const answer = (m ? m[1] : text).trim();
  const explanation = (m ? m[2] : "").trim();
  const refs = Array.from(
    text.matchAll(/§\s*\d+[a-z]?(?:\s*Abs\.\s*\d+)?(?:\s*(?:Satz|S\.)\s*\d+)?(?:\s*Nr\.\s*\d+)?\s*[A-ZÄÖÜ][A-Za-zÄÖÜäöü]{1,10}/g),
    (r) => r[0].replace(/\s+/g, " ").trim(),
  );
  const references = Array.from(new Set(refs)).slice(0, 6);
  return { answer, explanation, references };
}



function NeueAnfrage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState<string>("USt");
  const [description, setDescription] = useState("");
  const [selectedExampleId, setSelectedExampleId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    try {
      const desc = description.trim();
      const trimmedTitle = title.trim();

      // Kuratierte Musterantwort nur, wenn die Auswahl unverändert ist.
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

      // Kein kuratiertes Beispiel? → Antwort über denselben KI-Backend-Flow
      // wie im Chat holen. Bei Fehler fällt createCase() auf die lokale
      // Analyse-Logik zurück.
      if (!presetKnowledge) {
        try {
          const ai = await fetchAiAnswer(`[Themenbereich: ${topic}]\n${desc}`);
          if (ai && ai.answer) {
            presetKnowledge = {
              answer: ai.answer,
              explanation: ai.explanation,
              references: ai.references,
            };
          }
        } catch (aiErr) {
          console.warn("[steuerstoff] KI-Antwort fehlgeschlagen, nutze lokale Analyse:", aiErr);
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
      setSubmitting(false);
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
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
                {submitting ? "Wird beantwortet …" : "Antwort generieren"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>

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
