import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import {
  TOOLS,
  emptyInput,
  pruefe,
  ergebnisAlsText,
  type NpoErgebnis,
  type NpoInput,
  type OrgTyp,
  type Richtung,
  type Sphaere,
  type Tool,
} from "@/lib/npoAssistant";
import { ShieldCheck, Copy, Download, AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/npo-pruefassistent")({
  component: Page,
  head: () => ({
    meta: [
      { title: "NPO-Prüfassistent — steuerstoff" },
      {
        name: "description",
        content:
          "Sphären, Zweckbetrieb, Spenden, Zuschüsse, Mittelweitergabe, Rücklagen und USt-Risiken für gemeinnützige Körperschaften strukturiert prüfen.",
      },
    ],
  }),
});

function ampelStyle(a: NpoErgebnis["ampel"]) {
  if (a === "gruen") return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Grün", Icon: CheckCircle2 };
  if (a === "gelb") return { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200", label: "Gelb", Icon: AlertCircle };
  return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", label: "Rot", Icon: AlertTriangle };
}

function Page() {
  const [tool, setTool] = useState<Tool>("sphaere");
  const [input, setInput] = useState<NpoInput>(emptyInput());
  const [result, setResult] = useState<NpoErgebnis | null>(null);
  const toolsRef = useRef<HTMLDivElement>(null);
  const toolIdx = TOOLS.findIndex((t) => t.id === tool);
  useSwipeNavigation(toolsRef, {
    onSwipeLeft: () => {
      const next = TOOLS[Math.min(TOOLS.length - 1, toolIdx + 1)];
      if (next) setTool(next.id);
    },
    onSwipeRight: () => {
      const prev = TOOLS[Math.max(0, toolIdx - 1)];
      if (prev) setTool(prev.id);
    },
  });

  const update = <K extends keyof NpoInput>(k: K, v: NpoInput[K]) =>
    setInput((s) => ({ ...s, [k]: v }));

  const run = () => setResult(pruefe(tool, input));

  const exportText = useMemo(
    () => (result ? ergebnisAlsText(result, input) : ""),
    [result, input],
  );

  const copy = () => {
    if (exportText) navigator.clipboard.writeText(exportText).catch(() => {});
  };
  const download = () => {
    const blob = new Blob([exportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `npo-pruefnotiz-${result?.tool ?? "fall"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border/60 bg-card/40">
          <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
            <div className="flex items-start gap-3">
              <span
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-primary-foreground"
                style={{ background: "var(--cyan)" }}
              >
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                  NPO-Prüfassistent
                </h1>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                  Sachverhalt eingeben, Prüfungstool auswählen, strukturierte Prüfnotiz erhalten.
                  Sphären, Zweckbetrieb, Spenden, Zuschüsse, Mittelweitergabe, Rücklagen und USt.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Form */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-2xl border border-border bg-card p-4 shadow-card-soft sm:p-5">
                <h2 className="text-sm font-semibold text-foreground">1. Sachverhalt</h2>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="text-xs text-muted-foreground">Kurzbeschreibung</label>
                    <Textarea
                      rows={3}
                      placeholder="z. B. Sponsoringeinnahme von lokalem Unternehmen mit Logoplatzierung"
                      value={input.beschreibung}
                      onChange={(e) => update("beschreibung", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Organisationstyp</label>
                    <select
                      className="mt-1 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                      value={input.orgTyp}
                      onChange={(e) => update("orgTyp", e.target.value as OrgTyp)}
                    >
                      <option value="verein">Verein</option>
                      <option value="ggmbh">gGmbH</option>
                      <option value="stiftung">Stiftung</option>
                      <option value="sonstige">Sonstige NPO</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Jahr</label>
                      <Input
                        type="number"
                        value={input.jahr}
                        onChange={(e) => update("jahr", Number(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Betrag (€)</label>
                      <Input
                        type="number"
                        value={input.betrag}
                        onChange={(e) => update("betrag", Number(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-muted-foreground">
                      Beteiligte Personen / Organisationen
                    </label>
                    <Input
                      placeholder="z. B. Musterfirma GmbH; Stadt Musterstadt"
                      value={input.beteiligte}
                      onChange={(e) => update("beteiligte", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Richtung</label>
                    <select
                      className="mt-1 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                      value={input.richtung}
                      onChange={(e) => update("richtung", e.target.value as Richtung)}
                    >
                      <option value="einnahme">Einnahme</option>
                      <option value="ausgabe">Ausgabe</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Sphäre (falls bekannt)</label>
                    <select
                      className="mt-1 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                      value={input.sphaere}
                      onChange={(e) => update("sphaere", e.target.value as Sphaere)}
                    >
                      <option value="">— unbekannt —</option>
                      <option value="ideell">Ideeller Bereich</option>
                      <option value="zweckbetrieb">Zweckbetrieb</option>
                      <option value="vermoegen">Vermögensverwaltung</option>
                      <option value="wgb">wirtschaftl. Geschäftsbetrieb</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">SKR42-Konto (optional)</label>
                    <Input
                      placeholder="z. B. 4400"
                      value={input.skr42 ?? ""}
                      onChange={(e) => update("skr42", e.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {([
                    ["belegVorhanden", "Beleg vorhanden"],
                    ["vertragVorhanden", "Vertrag vorhanden"],
                    ["satzungsbezug", "Satzungsbezug"],
                    ["zweckbindung", "Zweckbindung"],
                  ] as Array<[keyof NpoInput, string]>).map(([k, l]) => (
                    <label
                      key={k}
                      className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground"
                    >
                      <Checkbox
                        checked={Boolean(input[k])}
                        onCheckedChange={(v) => update(k, Boolean(v) as never)}
                      />
                      {l}
                    </label>
                  ))}
                </div>
              </div>

              <div ref={toolsRef} className="rounded-2xl border border-border bg-card p-4 shadow-card-soft sm:p-5 touch-pan-y">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-foreground">2. Prüfungstool</h2>
                  <div className="flex items-center gap-1">
                    {TOOLS.map((t, i) => (
                      <span
                        key={t.id}
                        className={`h-1.5 w-1.5 rounded-full ${
                          i === toolIdx ? "bg-foreground" : "bg-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground sm:hidden">
                  Tipp: nach links/rechts swipen, um Tools zu wechseln.
                </p>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {TOOLS.map((t) => {
                    const active = tool === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTool(t.id)}
                        className={`rounded-lg border p-3 text-left transition-colors ${
                          active
                            ? "border-foreground/40 bg-accent"
                            : "border-border bg-background hover:bg-accent/60"
                        }`}
                      >
                        <div className="text-sm font-medium text-foreground">{t.label}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">{t.desc}</div>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <Button onClick={run} className="h-10">
                    Prüfung starten
                  </Button>
                </div>
              </div>
            </div>

            {/* Ergebnis */}
            <div className="space-y-4">
              {result ? (
                <ResultCard r={result} onCopy={copy} onDownload={download} />
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-card/60 p-6 text-sm text-muted-foreground">
                  Bitte Sachverhalt erfassen und Prüfung starten. Das Ergebnis erscheint hier als
                  strukturierte Prüfnotiz mit Ampel, Risiken, fehlenden Angaben und Textbaustein.
                </div>
              )}

              <div className="rounded-xl border border-border bg-card/60 p-4 text-xs text-muted-foreground">
                steuerstoff ist eine Arbeitshilfe. Die Einschätzung ist fachlich durch eine
                Steuerberaterin oder einen Steuerberater zu prüfen.
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function ResultCard({
  r,
  onCopy,
  onDownload,
}: {
  r: NpoErgebnis;
  onCopy: () => void;
  onDownload: () => void;
}) {
  const a = ampelStyle(r.ampel);
  const A = a.Icon;
  return (
    <div className="rounded-2xl border border-border bg-card shadow-card-soft">
      <div className={`flex items-center gap-2 rounded-t-2xl border-b ${a.border} ${a.bg} px-4 py-3`}>
        <A className={`h-4 w-4 ${a.text}`} />
        <div className={`text-sm font-semibold ${a.text}`}>{a.label}</div>
        <div className="ml-auto text-xs text-muted-foreground">{r.toolLabel}</div>
      </div>
      <div className="space-y-4 p-4 sm:p-5">
        <p className="text-sm text-foreground">{r.einschaetzung}</p>

        <Section title="Risiken" items={r.risiken} empty="Keine Risiken erkannt." />
        <Section title="Fehlende Angaben" items={r.fehlendeAngaben} empty="Keine fehlenden Angaben." />
        <Section title="Benötigte Unterlagen" items={r.unterlagen} />
        <Section title="Empfohlene Rückfragen" items={r.rueckfragen} />

        <div className="grid grid-cols-1 gap-2 rounded-lg border border-border bg-background p-3 text-xs">
          <div>
            <span className="font-medium text-foreground">Buchung / SKR42:</span>{" "}
            <span className="text-muted-foreground">{r.buchungshinweis}</span>
          </div>
          <div>
            <span className="font-medium text-foreground">Review:</span>{" "}
            <span className="text-muted-foreground">{r.reviewHinweis}</span>
          </div>
        </div>

        <div>
          <div className="mb-1 text-xs font-medium text-foreground">Textbaustein Mandantenrückfrage</div>
          <Textarea readOnly value={r.textbaustein} rows={8} className="text-xs" />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={onCopy} className="h-9">
            <Copy className="mr-1.5 h-4 w-4" /> Prüfnotiz kopieren
          </Button>
          <Button variant="outline" onClick={onDownload} className="h-9">
            <Download className="mr-1.5 h-4 w-4" /> Als .txt exportieren
          </Button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, items, empty }: { title: string; items: string[]; empty?: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</div>
      {items.length === 0 ? (
        <p className="mt-1 text-sm text-muted-foreground">{empty ?? "—"}</p>
      ) : (
        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-foreground">
          {items.map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
