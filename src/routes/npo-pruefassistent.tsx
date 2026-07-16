import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { ShieldCheck, Copy, Download, AlertTriangle, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

function inputSignature(tool: Tool, i: NpoInput): string {
  return JSON.stringify([tool, i]);
}
function formatTime(d: Date): string {
  const diff = Date.now() - d.getTime();
  if (diff < 60_000) return "gerade eben";
  return d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

export const Route = createFileRoute("/npo-pruefassistent" as never)({
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [checkedSignature, setCheckedSignature] = useState<string | null>(null);
  const [, setNowTick] = useState(0);
  const toolsRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const id = window.setInterval(() => setNowTick((n) => n + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const update = <K extends keyof NpoInput>(k: K, v: NpoInput[K]) =>
    setInput((s) => ({ ...s, [k]: v }));

  const currentSig = inputSignature(tool, input);
  const isStale = result !== null && checkedSignature !== null && checkedSignature !== currentSig;

  const run = useCallback(async () => {
    if (!input.beschreibung.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      const r = pruefe(tool, input);
      setResult(r);
      setCheckedSignature(inputSignature(tool, input));
      setLastChecked(new Date());
      requestAnimationFrame(() => {
        const el = resultRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight || 0;
        const inView = rect.top >= 0 && rect.top < vh * 0.8;
        if (!inView && window.innerWidth < 768) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    } catch {
      setError("Die Prüfung konnte nicht erstellt werden. Bitte erneut versuchen.");
    } finally {
      setLoading(false);
    }
  }, [tool, input, loading]);

  const onRefresh = useCallback(async () => {
    setError(null);
    if (result && input.beschreibung.trim()) {
      const r = pruefe(tool, input);
      setResult(r);
      setCheckedSignature(inputSignature(tool, input));
      setLastChecked(new Date());
    } else {
      setNowTick((n) => n + 1);
    }
  }, [tool, input, result]);

  useEffect(() => {
    const handler = () => {
      void onRefresh();
    };
    window.addEventListener("steuerstoff:refresh", handler);
    return () => window.removeEventListener("steuerstoff:refresh", handler);
  }, [onRefresh]);

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

  const buttonLabel = loading ? "Prüfung läuft …" : result ? "Erneut prüfen" : "NPO-Prüfung starten";
  const lastCheckedLabel = lastChecked ? formatTime(lastChecked) : null;

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
                  Beschreibe den Vorgang kurz. steuerstoff erstellt eine erste Einschätzung und
                  fragt fehlende Angaben automatisch nach.
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
                <h2 className="text-sm font-semibold text-foreground">1. Kurzbeschreibung</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Pflicht. Alles andere ist optional und verbessert nur die Einschätzung.
                </p>
                <div className="mt-3">
                  <Textarea
                    rows={4}
                    autoFocus
                    placeholder='z. B. „Sommerfest mit Eintritt und Getränkeverkauf" oder „Verein erhält Zuschuss für Projekt 2025"'
                    value={input.beschreibung}
                    onChange={(e) => update("beschreibung", e.target.value)}
                  />
                </div>

                <Collapsible className="mt-4">
                  <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-md border border-dashed border-border bg-background px-3 py-2 text-xs text-foreground hover:bg-accent/60">
                    <span>Optionale Details ergänzen</span>
                    <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <p className="mt-3 text-[11px] text-muted-foreground">
                      Optionale Details verbessern die Einschätzung, sind aber für den Start nicht erforderlich.
                    </p>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-xs text-muted-foreground">Organisationstyp</label>
                        <select
                          className="mt-1 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                          value={input.orgTyp}
                          onChange={(e) => update("orgTyp", e.target.value as OrgTyp)}
                        >
                          <option value="">— nicht angegeben —</option>
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
                            placeholder="nicht angegeben"
                            value={input.jahr ?? ""}
                            onChange={(e) => update("jahr", e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Betrag (€)</label>
                          <Input
                            type="number"
                            placeholder="nicht angegeben"
                            value={input.betrag ?? ""}
                            onChange={(e) => update("betrag", e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs text-muted-foreground">Beteiligte Personen / Organisationen</label>
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
                          <option value="">— nicht angegeben —</option>
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
                        <label className="text-xs text-muted-foreground">SKR42-Konto</label>
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
                  </CollapsibleContent>
                </Collapsible>
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
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-h-[1.25rem] text-[11px] text-muted-foreground">
                    {error ? (
                      <span className="text-rose-700">{error}</span>
                    ) : isStale ? (
                      <span className="text-amber-700">Eingaben geändert – bitte erneut prüfen.</span>
                    ) : lastCheckedLabel ? (
                      <span>Zuletzt geprüft: {lastCheckedLabel}</span>
                    ) : null}
                  </div>
                  <Button
                    onClick={run}
                    disabled={!input.beschreibung.trim() || loading}
                    className="h-10"
                  >
                    {loading ? (
                      <RefreshCw className="mr-1.5 h-4 w-4 animate-spin" />
                    ) : result ? (
                      <RefreshCw className="mr-1.5 h-4 w-4" />
                    ) : null}
                    {buttonLabel}
                  </Button>
                </div>
              </div>
            </div>

            {/* Ergebnis */}
            <div className="space-y-4" ref={resultRef}>
              {result ? (
                <ResultCard
                  r={result}
                  onCopy={copy}
                  onDownload={download}
                  onRefresh={run}
                  loading={loading}
                  isStale={isStale}
                  lastChecked={lastCheckedLabel}
                />
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-card/60 p-6 text-sm text-muted-foreground">
                  Beschreibe den Vorgang in der Kurzbeschreibung und starte die Prüfung.
                  Auch ohne weitere Angaben erstellt steuerstoff eine erste strukturierte Einschätzung.
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
  onRefresh,
  loading,
  isStale,
  lastChecked,
}: {
  r: NpoErgebnis;
  onCopy: () => void;
  onDownload: () => void;
  onRefresh: () => void;
  loading: boolean;
  isStale: boolean;
  lastChecked: string | null;
}) {
  const a = ampelStyle(r.ampel);
  const A = a.Icon;
  const sicherheitLabel = r.sicherheit === "hoch" ? "Sicherheit: hoch" : r.sicherheit === "mittel" ? "Sicherheit: mittel" : "Sicherheit: niedrig";
  const sicherheitClass =
    r.sicherheit === "hoch"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : r.sicherheit === "mittel"
        ? "bg-amber-50 text-amber-800 border-amber-200"
        : "bg-muted text-muted-foreground border-border";
  return (
    <div className={`rounded-2xl border bg-card shadow-card-soft ${isStale ? "border-amber-300/70" : "border-border"}`}>
      <div className={`flex flex-wrap items-center gap-2 rounded-t-2xl border-b ${a.border} ${a.bg} px-4 py-3`}>
        <A className={`h-4 w-4 ${a.text}`} />
        <div className={`text-sm font-semibold ${a.text}`}>{a.label}</div>
        <span className={`rounded-full border px-2 py-0.5 text-[10px] ${sicherheitClass}`}>{sicherheitLabel}</span>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="ml-auto inline-flex items-center gap-1 rounded-full border border-border bg-background/80 px-2 py-0.5 text-[10px] text-foreground hover:bg-accent disabled:opacity-60"
          title="Aktualisieren"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          Aktualisieren
        </button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-background/50 px-4 py-2 text-[11px] text-muted-foreground">
        <div>{r.titel}</div>
        <div>
          {isStale ? (
            <span className="text-amber-700">Dieses Ergebnis basiert auf früheren Eingaben.</span>
          ) : lastChecked ? (
            <span>Zuletzt geprüft: {lastChecked}</span>
          ) : null}
        </div>
      </div>
      <div className="space-y-4 p-4 sm:p-5">
        {r.modus === "wissen" ? (
          <div className="rounded-md border border-dashed border-border bg-background p-2 text-[11px] text-muted-foreground">
            Schnellantwort auf Basis typischer Sachverhalte — kein konkreter Einzelfall geprüft.
          </div>
        ) : r.sicherheit === "niedrig" ? (
          <div className="rounded-md border border-dashed border-border bg-background p-2 text-[11px] text-muted-foreground">
            Ersteinschätzung auf Basis der Kurzbeschreibung. Für eine belastbarere Prüfung sind
            zusätzliche Angaben hilfreich.
          </div>
        ) : null}
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Wahrscheinliche Sphäre</div>
          <p className="mt-1 text-sm text-foreground">{r.einschaetzung}</p>
        </div>

        {r.begruendung && (
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Begründung</div>
            <p className="mt-1 text-sm text-foreground">{r.begruendung}</p>
          </div>
        )}

        {r.wannAnders && r.wannAnders.length > 0 && (
          <Section title="Wann wäre die Einordnung anders?" items={r.wannAnders} />
        )}

        {r.alternativen.length > 0 && (
          <Section title="Mögliche Alternativ-Einordnung" items={r.alternativen} />
        )}
        {r.annahmen.length > 0 && <Section title="Annahmen" items={r.annahmen} />}

        <Section title="Prüfpflichtige Punkte / Risiken" items={r.risiken} empty="Keine besonderen Risiken erkannt." />
        <Section
          title="Hilfreich wäre"
          items={r.fehlendeAngaben}
          empty="Angaben ausreichend."
        />
        <Section title="Benötigte Unterlagen" items={r.unterlagen} />
        <Section title="Empfohlene Rückfragen" items={r.rueckfragen} />

        <div className="grid grid-cols-1 gap-2 rounded-lg border border-border bg-background p-3 text-xs">
          <div>
            <span className="font-medium text-foreground">USt-Hinweis:</span>{" "}
            <span className="text-muted-foreground">{r.ustHinweis}</span>
          </div>
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
