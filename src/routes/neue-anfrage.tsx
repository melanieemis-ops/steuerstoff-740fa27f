import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createCase } from "@/lib/casesStore";
import { ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/neue-anfrage")({
  component: NeueAnfrage,
  head: () => ({ meta: [{ title: "Neue Anfrage · steuerstoff" }] }),
});

const TOPICS = ["USt", "NPO", "SKR03", "SKR42", "DATEV", "Abgrenzung", "Buchhaltung", "Sonstiges"];

const EXAMPLES = [
  {
    title: "Bewirtungsbeleg ohne Teilnehmerangaben",
    topic: "USt",
    description:
      "Restaurantrechnung 184,50 € brutto vom 14.03.2025. Auf dem Beleg fehlen Teilnehmernamen und konkreter Anlass. Frage: Vorsteuerabzug und 70-%-Regel.",
  },
  {
    title: "Rücklage nach § 62 AO bilden",
    topic: "NPO",
    description:
      "Gemeinnütziger Verein möchte eine freie Rücklage nach § 62 Abs. 1 Nr. 3 AO bilden. Mittelverwendungsfrist und Beschlussfassung zu klären.",
  },
  {
    title: "Hostingrechnung über Jahreswechsel",
    topic: "Abgrenzung",
    description:
      "Rechnung 1.200 € netto, Leistungszeitraum 01.10.2024 – 30.09.2025. Bildung ARAP zum 31.12. erforderlich.",
  },
];

function NeueAnfrage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("USt");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = title.trim().length >= 3 && description.trim().length >= 10;

  function loadExample(i: number) {
    const ex = EXAMPLES[i];
    setTitle(ex.title);
    setTopic(ex.topic);
    setDescription(ex.description);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!canSubmit) {
      setError("Bitte gib einen aussagekräftigen Titel (≥ 3 Zeichen) und eine Beschreibung (≥ 10 Zeichen) an.");
      return;
    }
    setSubmitting(true);
    try {
      const rec = createCase({ title: title.trim(), topic, description: description.trim() });
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
            Neue steuerliche Anfrage
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Beschreibe den Sachverhalt — steuerstoff strukturiert ihn, erkennt fehlende Angaben und
            schlägt nächste Schritte vor.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-5 shadow-card-soft sm:p-6"
          >
            <div>
              <label htmlFor="title" className="text-sm font-medium text-foreground">
                Titel des Sachverhalts
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="z. B. Bewirtungsbeleg Geschäftsessen 03/2025"
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
                    onClick={() => setTopic(t)}
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
                Sachverhalt
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Beschreibe den Sachverhalt: Beteiligte, Zeitraum, Beträge, Belege, offene Punkte …"
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
                {submitting ? "Analysiere …" : "Analyse starten"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>

          <div className="mt-8">
            <h2 className="text-sm font-medium text-foreground">Beispiel-Sachverhalte</h2>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={ex.title}
                  type="button"
                  onClick={() => loadExample(i)}
                  className="rounded-xl border border-border bg-card p-3 text-left text-xs text-muted-foreground shadow-card-soft transition-colors hover:border-foreground/30 hover:text-foreground"
                >
                  <span className="mb-1 inline-block rounded border border-border bg-background px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
                    {ex.topic}
                  </span>
                  <p className="text-sm font-medium text-foreground">{ex.title}</p>
                  <p className="mt-1 line-clamp-2">{ex.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
