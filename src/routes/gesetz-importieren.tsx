import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { importLawEntry } from "@/lib/lawImporter.functions";

export const Route = createFileRoute("/gesetz-importieren")({
  head: () => ({
    meta: [
      { title: "Gesetz importieren – steuerstoff" },
      { name: "description", content: "Interner Gesetzes-Importer für das Expertensystem." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: GesetzImporterPage,
});

const LAWS = ["AO", "EStG", "UStG", "KStG", "GewStG", "UmwStG", "GrEStG", "ErbStG", "BewG", "FGO"] as const;

type Result = {
  ok: true;
  id: string;
  identifier: string;
  relativePath: string;
  preview: {
    paragraph: string;
    title: string;
    short: string;
    keywords: string[];
    references: string[];
    category: string;
    importance: number;
    ueberblick: string;
    tatbestand: string[];
    rechtsfolge: string[];
    ausnahmen: string[];
    verknuepft: string[];
    praxisbeispiel: string[];
    merksatz: string[];
  };
};

function GesetzImporterPage() {
  const importFn = useServerFn(importLawEntry);
  const [law, setLaw] = useState<(typeof LAWS)[number]>("EStG");
  const [originalText, setOriginalText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const r = (await importFn({
        data: { law, originalText: originalText.trim() },
      })) as Result;
      setResult(r);
      setOriginalText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Gesetz importieren</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Route: <code>/gesetz-importieren</code> · Gesetz wählen, Text einfügen, importieren — GPT erkennt
            Paragraph, Überschrift, Absätze, Verweise und Schlagwörter automatisch.
          </p>
        </div>
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Zurück
        </Link>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-border bg-card p-5">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Gesetz</span>
          <select
            value={law}
            onChange={(e) => setLaw(e.target.value as (typeof LAWS)[number])}
            className="w-full max-w-[220px] rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {LAWS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Gesetzestext einfügen</span>
          <textarea
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            placeholder="Kompletten Paragraphen-Wortlaut hier einfügen — GPT analysiert automatisch."
            required
            rows={16}
            className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs leading-relaxed"
          />
        </label>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading || originalText.trim().length < 20}
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
          >
            {loading ? "Analysiere & importiere…" : "Importieren"}
          </button>
          {loading && <span className="text-xs text-muted-foreground">GPT analysiert und schreibt Datei…</span>}
        </div>
      </form>

      {error && (
        <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-3 rounded-xl border border-border bg-card p-5">
          <div className="text-sm">
            <strong>Importiert:</strong> {result.preview.paragraph} – {result.preview.title}
          </div>
          <div className="text-xs text-muted-foreground">
            Datei <code>{result.relativePath}</code> · ID <code>{result.id}</code> · Kategorie{" "}
            <code>{result.preview.category}</code> · Wichtigkeit {result.preview.importance}/10
          </div>
          <details className="mt-2 rounded-md bg-muted/40 p-3 text-xs" open>
            <summary className="cursor-pointer font-medium">Vorschau</summary>
            <div className="mt-2 space-y-2 whitespace-pre-wrap">
              <div><strong>Kurz:</strong> {result.preview.short}</div>
              <div><strong>Merksatz:</strong> {result.preview.merksatz.join(" · ")}</div>
              <div><strong>Keywords:</strong> {result.preview.keywords.join(", ")}</div>
              <div><strong>Referenzen:</strong> {result.preview.references.join(", ")}</div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
