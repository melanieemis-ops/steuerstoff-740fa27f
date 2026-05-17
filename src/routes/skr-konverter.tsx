import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowRightLeft,
  Copy,
  Download,
  FileSpreadsheet,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-react";
import {
  COMPLIANCE_NOTE,
  SKR_MAPPINGS,
  OFFICIAL_MAPPINGS,
  type SkrMapping,
  type Sicherheit,
  findBySkr03,
  findByText,
  formatMappingAsText,
  listUserMappings,
  saveUserMapping,
  deleteUserMapping,
  sicherheitColor,
  sicherheitLabel,
  type UserMapping,
} from "@/lib/skrMapping";

const OFFICIAL_COUNT = OFFICIAL_MAPPINGS.length;

export const Route = createFileRoute("/skr-konverter")({
  component: SkrKonverter,
  head: () => ({
    meta: [
      { title: "SKR-Konverter · steuerstoff" },
      {
        name: "description",
        content:
          "SKR03 → SKR42 Konverter mit Konto- und Textanalyse, manueller Mapping-Pflege und Excel-Import-Vorbereitung.",
      },
    ],
  }),
});

type Mode = "konto" | "text";

function SkrKonverter() {
  const [mode, setMode] = useState<Mode>("konto");
  const [kontoInput, setKontoInput] = useState("");
  const [textInput, setTextInput] = useState("");

  const kontoResults = useMemo(() => findBySkr03(kontoInput), [kontoInput]);
  const textResults = useMemo(() => findByText(textInput), [textInput]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b border-border/60 bg-card/30">
          <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs text-muted-foreground shadow-sm">
              <ArrowRightLeft className="h-3.5 w-3.5" /> SKR03 → SKR42
            </span>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              SKR-Konverter
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Konten und Buchungstexte zwischen SKR03 und SKR42 zuordnen – auf Basis des
              individuellen Kontenrahmens mit DATEV-Kontenbeschriftungen (NPO-Arbeitsfassung,
              {" "}{OFFICIAL_COUNT.toLocaleString("de-DE")} Konten).
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          {/* Mode tabs */}
          <div className="inline-flex rounded-xl border border-border bg-card p-1 shadow-card-soft">
            <button
              type="button"
              onClick={() => setMode("konto")}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                mode === "konto"
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Konto-Suche
            </button>
            <button
              type="button"
              onClick={() => setMode("text")}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                mode === "text"
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Textanalyse
            </button>
          </div>

          {mode === "konto" ? (
            <div className="mt-5 rounded-2xl border border-border bg-card p-4 shadow-card-soft sm:p-6">
              <label className="text-sm font-medium text-foreground">SKR03-Konto eingeben</label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    inputMode="numeric"
                    value={kontoInput}
                    onChange={(e) => setKontoInput(e.target.value)}
                    placeholder="z. B. 4210, 4650, 4920…"
                    className="pl-9"
                  />
                </div>
                <Button variant="outline" onClick={() => setKontoInput("")}>
                  Zurücksetzen
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["4210", "4910", "8400", "1200", "4650", "4670"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setKontoInput(s)}
                    className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>

              <ResultsList
                results={kontoResults}
                empty={
                  kontoInput.trim()
                    ? `Kein Treffer in der Demo-Mapping-Tabelle für „${kontoInput}". Manuelle Zuordnung anlegen oder Excel-Import nutzen.`
                    : "Konto eingeben, um den SKR42-Vorschlag zu sehen."
                }
              />
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-border bg-card p-4 shadow-card-soft sm:p-6">
              <label className="text-sm font-medium text-foreground">Buchungs-/Belegtext</label>
              <Textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="z. B. Berlin Recycling GmbH · Miete Büro · Softwarelizenz · Bewirtung Mandant · Reisekosten Vorstand"
                className="mt-2 min-h-[88px]"
              />
              <div className="mt-3 flex flex-wrap gap-1.5">
                {[
                  "Berlin Recycling GmbH",
                  "Miete Büro",
                  "Softwarelizenz",
                  "Bewirtung",
                  "Reisekosten Vorstand",
                ].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setTextInput(s)}
                    className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>

              <ResultsList
                results={textResults}
                empty={
                  textInput.trim()
                    ? "Kein Mustertreffer. Manuelles Mapping erfassen oder Konto-Suche nutzen."
                    : "Belegtext eingeben, um Kontovorschläge zu sehen."
                }
              />
            </div>
          )}

          {/* Compliance */}
          <p className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-card/50 p-3 text-xs text-muted-foreground">
            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {COMPLIANCE_NOTE}
          </p>

          {/* Mapping table with filters */}
          <MappingExplorer />

          {/* Manual mapping form */}
          <ManualMappingSection />

          {/* Excel import preparation */}
          <ExcelImportSection />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

/* ============================================================== */

function ResultsList({ results, empty }: { results: SkrMapping[]; empty: string }) {
  if (results.length === 0) {
    return (
      <p className="mt-5 rounded-lg border border-dashed border-border bg-background/50 p-4 text-sm text-muted-foreground">
        {empty}
      </p>
    );
  }
  return (
    <div className="mt-5 space-y-3">
      {results.map((m, i) => (
        <ResultCard key={`${m.skr03}-${m.skr42}-${i}`} m={m} />
      ))}
    </div>
  );
}

function ResultCard({ m }: { m: SkrMapping }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(formatMappingAsText(m));
    } catch {}
  };
  const exportText = () => {
    const blob = new Blob([formatMappingAsText(m)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `skr-${m.skr03}-${m.skr42}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-card-soft sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md border border-border bg-background px-2 py-0.5 text-xs font-mono text-foreground">
          SKR03 {m.skr03}
        </span>
        <ArrowRightLeft className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="rounded-md border border-border bg-background px-2 py-0.5 text-xs font-mono text-foreground">
          SKR42 {m.skr42}
        </span>
        <SicherheitBadge s={m.sicherheit} />
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] ${
            m.oneToOne
              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
          }`}
        >
          {m.oneToOne ? "1:1-Zuordnung" : "prüfpflichtig"}
        </span>
        {m.npoRelevant && (
          <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[11px] text-violet-700 dark:text-violet-300">
            NPO / SKR42
          </span>
        )}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted-foreground">SKR03-Bezeichnung</p>
          <p className="text-sm text-foreground">{m.skr03Name}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">SKR42-Bezeichnung</p>
          <p className="text-sm text-foreground">{m.skr42Name}</p>
        </div>
      </div>

      <div className="mt-3">
        <p className="text-xs text-muted-foreground">Buchungslogik / Hinweis</p>
        <p className="text-sm text-foreground">{m.hinweis}</p>
      </div>

      <div className="mt-3 rounded-lg border border-border bg-background/60 p-3">
        <p className="text-xs text-muted-foreground">Beispiel-Buchungstext</p>
        <p className="font-mono text-sm text-foreground">{m.beispiel}</p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={copy}>
          <Copy className="mr-1.5 h-3.5 w-3.5" /> Kopieren
        </Button>
        <Button size="sm" variant="ghost" onClick={exportText}>
          <Download className="mr-1.5 h-3.5 w-3.5" /> Export .txt
        </Button>
      </div>
    </article>
  );
}

function SicherheitBadge({ s }: { s: Sicherheit }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]"
      style={{ color: sicherheitColor(s), borderColor: sicherheitColor(s) + "55" }}
    >
      {s === "hoch" ? (
        <ShieldCheck className="h-3 w-3" />
      ) : (
        <ShieldAlert className="h-3 w-3" />
      )}
      Sicherheit: {sicherheitLabel(s)}
    </span>
  );
}

/* ============================================================== */

function MappingExplorer() {
  const [user, setUser] = useState<UserMapping[]>(() => listUserMappings());
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"alle" | "sicher" | "pruef" | "npo">("alle");

  const all: SkrMapping[] = useMemo(() => [...user, ...SKR_MAPPINGS], [user]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return all.filter((m) => {
      const matchesQ =
        !qq ||
        m.skr03.toLowerCase().includes(qq) ||
        m.skr42.toLowerCase().includes(qq) ||
        m.skr03Name.toLowerCase().includes(qq) ||
        m.skr42Name.toLowerCase().includes(qq) ||
        (m.textPatterns ?? []).some((p) => p.includes(qq));
      if (!matchesQ) return false;
      if (filter === "sicher") return m.sicherheit === "hoch";
      if (filter === "pruef") return m.sicherheit === "pruefen" || !m.oneToOne;
      if (filter === "npo") return !!m.npoRelevant;
      return true;
    });
  }, [all, q, filter]);

  const refresh = () => setUser(listUserMappings());

  return (
    <section className="mt-10">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Mapping-Tabelle
          </h2>
          <p className="text-sm text-muted-foreground">
            Demo-Mappings + eigene Zuordnungen ({all.length}).
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Konto oder Buchungstext suchen…"
            className="pl-9"
          />
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {[
          { id: "alle", label: "Alle" },
          { id: "sicher", label: "Nur sichere Zuordnungen" },
          { id: "pruef", label: "Nur prüfpflichtig" },
          { id: "npo", label: "Nur NPO / SKR42" },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id as typeof filter)}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
              filter === f.id
                ? "bg-foreground text-background"
                : "border border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-background/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2">SKR03</th>
                <th className="px-3 py-2">Bezeichnung</th>
                <th className="px-3 py-2">SKR42</th>
                <th className="px-3 py-2">Bezeichnung</th>
                <th className="px-3 py-2">Sicherheit</th>
                <th className="px-3 py-2">Typ</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((m, i) => {
                const isUser = "id" in m;
                return (
                  <tr key={i} className="hover:bg-accent/40">
                    <td className="px-3 py-2 font-mono">{m.skr03}</td>
                    <td className="px-3 py-2 text-foreground">{m.skr03Name}</td>
                    <td className="px-3 py-2 font-mono">{m.skr42}</td>
                    <td className="px-3 py-2 text-foreground">{m.skr42Name}</td>
                    <td className="px-3 py-2">
                      <span style={{ color: sicherheitColor(m.sicherheit) }}>
                        {sicherheitLabel(m.sicherheit)}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {m.oneToOne ? "1:1" : "prüfpflichtig"}
                      {m.npoRelevant ? " · NPO" : ""}
                      {isUser ? " · eigen" : ""}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {isUser && (
                        <button
                          type="button"
                          onClick={() => {
                            deleteUserMapping((m as UserMapping).id);
                            refresh();
                          }}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          aria-label="Löschen"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-sm text-muted-foreground">
                    Keine Treffer.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* ============================================================== */

function ManualMappingSection() {
  const [form, setForm] = useState({
    skr03: "",
    skr03Name: "",
    skr42: "",
    skr42Name: "",
    textPatterns: "",
    hinweis: "",
    sicherheit: "mittel" as Sicherheit,
    oneToOne: true,
    npoRelevant: false,
  });
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const canSave = form.skr03.trim() && form.skr42.trim();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    saveUserMapping({
      skr03: form.skr03.trim(),
      skr03Name: form.skr03Name.trim() || "—",
      skr42: form.skr42.trim(),
      skr42Name: form.skr42Name.trim() || "—",
      hinweis: form.hinweis.trim() || "Manuell erfasste Zuordnung.",
      beispiel: form.textPatterns.split(",")[0]?.trim() || "—",
      sicherheit: form.sicherheit,
      oneToOne: form.oneToOne,
      npoRelevant: form.npoRelevant,
      textPatterns: form.textPatterns
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
    });
    setSavedMsg("Mapping gespeichert.");
    setForm({ ...form, skr03: "", skr03Name: "", skr42: "", skr42Name: "", textPatterns: "", hinweis: "" });
    setTimeout(() => setSavedMsg(null), 2500);
  };

  return (
    <section className="mt-10 rounded-2xl border border-border bg-card p-4 shadow-card-soft sm:p-6">
      <div className="mb-3 flex items-center gap-2">
        <Plus className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Manuelles Mapping erfassen
        </h2>
      </div>
      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
        <Field label="SKR03-Konto">
          <Input value={form.skr03} onChange={(e) => setForm({ ...form, skr03: e.target.value })} placeholder="4210" />
        </Field>
        <Field label="SKR03-Bezeichnung">
          <Input value={form.skr03Name} onChange={(e) => setForm({ ...form, skr03Name: e.target.value })} placeholder="Miete" />
        </Field>
        <Field label="SKR42-Konto">
          <Input value={form.skr42} onChange={(e) => setForm({ ...form, skr42: e.target.value })} placeholder="6310" />
        </Field>
        <Field label="SKR42-Bezeichnung">
          <Input value={form.skr42Name} onChange={(e) => setForm({ ...form, skr42Name: e.target.value })} placeholder="Raummiete" />
        </Field>
        <Field label="Buchungstext-Muster (Komma-getrennt)" full>
          <Input
            value={form.textPatterns}
            onChange={(e) => setForm({ ...form, textPatterns: e.target.value })}
            placeholder="miete, raummiete, büromiete"
          />
        </Field>
        <Field label="Hinweis" full>
          <Textarea
            value={form.hinweis}
            onChange={(e) => setForm({ ...form, hinweis: e.target.value })}
            placeholder="Fachliche Anmerkung, z. B. Sphärenzuordnung."
            className="min-h-[72px]"
          />
        </Field>

        <Field label="Sicherheit">
          <select
            value={form.sicherheit}
            onChange={(e) => setForm({ ...form, sicherheit: e.target.value as Sicherheit })}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="hoch">Hoch</option>
            <option value="mittel">Mittel</option>
            <option value="pruefen">Bitte prüfen</option>
          </select>
        </Field>
        <div className="flex flex-wrap items-center gap-4 sm:col-span-1">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={form.oneToOne}
              onChange={(e) => setForm({ ...form, oneToOne: e.target.checked })}
            />
            1:1-Zuordnung
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={form.npoRelevant}
              onChange={(e) => setForm({ ...form, npoRelevant: e.target.checked })}
            />
            NPO / SKR42-relevant
          </label>
        </div>

        <div className="flex items-center gap-3 sm:col-span-2">
          <Button type="submit" disabled={!canSave}>
            Mapping speichern
          </Button>
          {savedMsg && <span className="text-sm text-emerald-600">{savedMsg}</span>}
        </div>
      </form>
    </section>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

/* ============================================================== */

function ExcelImportSection() {
  const [status, setStatus] = useState<{ kind: "skr03" | "skr42" | "mapping"; name: string }[]>([]);

  const onPick = (kind: "skr03" | "skr42" | "mapping") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setStatus((s) => [...s.filter((x) => x.kind !== kind), { kind, name: f.name }]);
  };

  return (
    <section className="mt-10 rounded-2xl border border-border bg-card p-4 shadow-card-soft sm:p-6">
      <div className="mb-3 flex items-center gap-2">
        <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Individuellen Kontenrahmen importieren
        </h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Lade individuelle Kontenrahmen und Mapping-Dateien hoch. Die echte Excel-Auswertung wird im
        nächsten Schritt angebunden – Spalten wie <em>Konto</em>, <em>Bezeichnung</em>, <em>SKR</em>,
        <em> Zuordnungskonto</em>, <em>Buchungstext-Muster</em>, <em>Hinweis</em>, <em>Sphäre</em>,
        <em> Sicherheit</em> werden dann automatisch erkannt.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <UploadCard
          label="SKR03 (individuell)"
          onChange={onPick("skr03")}
          name={status.find((s) => s.kind === "skr03")?.name}
        />
        <UploadCard
          label="SKR42 (individuell)"
          onChange={onPick("skr42")}
          name={status.find((s) => s.kind === "skr42")?.name}
        />
        <UploadCard
          label="Mapping SKR03 ↔ SKR42"
          onChange={onPick("mapping")}
          name={status.find((s) => s.kind === "mapping")?.name}
        />
      </div>

      {status.length > 0 && (
        <p className="mt-4 rounded-lg border border-dashed border-border bg-background/60 p-3 text-sm text-foreground">
          Import vorbereitet – Excel-Auswertung wird im nächsten Schritt angebunden.
        </p>
      )}
    </section>
  );
}

function UploadCard({
  label,
  name,
  onChange,
}: {
  label: string;
  name?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="flex cursor-pointer flex-col items-start gap-2 rounded-xl border border-dashed border-border bg-background/60 p-4 text-sm transition-colors hover:bg-accent/40">
      <span className="inline-flex items-center gap-2 text-foreground">
        <Upload className="h-4 w-4" /> {label}
      </span>
      <span className="text-xs text-muted-foreground">.xlsx / .csv</span>
      <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={onChange} />
      {name && (
        <span className="mt-1 truncate text-xs text-emerald-600" title={name}>
          ✓ {name}
        </span>
      )}
    </label>
  );
}
