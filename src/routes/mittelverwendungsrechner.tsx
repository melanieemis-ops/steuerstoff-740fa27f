import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Calculator, Save, Copy, Download, Plus, Trash2, AlertTriangle, CheckCircle2, Info, ChevronLeft, ChevronRight,
} from "lucide-react";
import {
  loadState, saveState, REVIEW_NOTE, type MvrState,
  gesamtEinnahmen, schwelleAmpel, zeitnahZuVerwendendeMittel, zweckentsprechendeVerwendung,
  pruefpflichtigeVerwendung, betriebsmittelSumme, berechneFreieRuecklage, vermoegenszufuehrungSumme,
  summeZulaessigeRuecklagen, berechneErgebnis, fristStatus, ampelClass, ampelLabel, fmt, buildExport,
  analysiere, buildKurz, buildPruefnotiz, buildMandant, buildVorstand, buildRueckfragen, buildTodos,
  type RuecklageArt,
} from "@/lib/mvrStore";
import { Term } from "@/components/MvrGlossary";
import { MvrImport } from "@/components/MvrImport";

export const Route = createFileRoute("/mittelverwendungsrechner")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Mittelverwendungsrechner · steuerstoff" },
      {
        name: "description",
        content:
          "Mittelverwendungsrechner für NPOs: zeitnahe Mittelverwendung, Rücklagen nach § 62 AO, Mittelvortrag und Verwendungsüberhang strukturiert prüfen.",
      },
    ],
  }),
});

const STEPS = [
  "Daten importieren", "Stammdaten", "45.000-€-Schwelle", "Mittelzuflüsse", "Mittelverwendung",
  "Vermögen", "Rücklagen § 62 AO", "Mittelvortrag", "Rücklagenspiegel", "Ergebnis", "Export",
] as const;

function uid() { return Math.random().toString(36).slice(2, 10); }

function NumField({ label, value, onChange, hint }: { label: string; value: number; onChange: (n: number) => void; hint?: string }) {
  return (
    <label className="block text-sm">
      <span className="text-foreground/80">{label}</span>
      <Input
        type="number"
        inputMode="decimal"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="mt-1"
      />
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (s: string) => void; placeholder?: string }) {
  return (
    <label className="block text-sm">
      <span className="text-foreground/80">{label}</span>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-1" />
    </label>
  );
}

function SelectField<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (s: T) => void; options: { value: T; label: string }[] }) {
  return (
    <label className="block text-sm">
      <span className="text-foreground/80">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

function CheckField({ label, value, onChange }: { label: string; value: boolean; onChange: (b: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-foreground/80">
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 rounded border-border" />
      {label}
    </label>
  );
}

function Card({ title, children, accent }: { title?: React.ReactNode; children: React.ReactNode; accent?: string }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-card-soft">
      {title && (
        <div className="mb-4 flex items-center gap-2">
          {accent && <span className="inline-block h-2 w-2 rounded-full" style={{ background: accent }} />}
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
      )}
      {children}
    </section>
  );
}

function Note({ tone = "info", children }: { tone?: "info" | "warn" | "danger" | "ok"; children: React.ReactNode }) {
  const map = {
    info: "bg-cyan-50 border-cyan-200 text-cyan-900",
    warn: "bg-amber-50 border-amber-200 text-amber-900",
    danger: "bg-red-50 border-red-200 text-red-900",
    ok: "bg-emerald-50 border-emerald-200 text-emerald-900",
  } as const;
  const Icon = tone === "warn" || tone === "danger" ? AlertTriangle : tone === "ok" ? CheckCircle2 : Info;
  return (
    <div className={`flex gap-2 rounded-lg border px-3 py-2 text-xs ${map[tone]}`}>
      <Icon className="h-4 w-4 shrink-0 mt-0.5" />
      <div>{children}</div>
    </div>
  );
}

function Page() {
  const [state, setState] = useState<MvrState>(() => loadState());
  const [step, setStep] = useState(0);

  useEffect(() => { saveState(state); }, [state]);

  const update = <K extends keyof MvrState>(key: K, value: MvrState[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border/60 bg-card/30">
          <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs text-muted-foreground shadow-sm">
              <Calculator className="h-3.5 w-3.5" /> Arbeitshilfe NPO · § 55 / § 62 AO
            </span>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Mittelverwendungsrechner
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Zeitnahe Mittelverwendung, Rücklagen nach § 62 AO, Mittelvortrag und Verwendungsüberhang
              strukturiert für gemeinnützige Körperschaften prüfen.
            </p>
            <div className="mt-4">
              <Note tone="warn">{REVIEW_NOTE}</Note>
            </div>
          </div>
        </section>

        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
          {/* Stepper */}
          <nav className="mb-6 flex flex-wrap gap-1.5">
            {STEPS.map((s, i) => (
              <button
                key={s}
                onClick={() => setStep(i)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  i === step
                    ? "border-foreground/30 bg-foreground text-background"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {i + 1}. {s}
              </button>
            ))}
          </nav>

          <div className="space-y-5">
            {step === 0 && <MvrImport state={state} onApply={setState} />}
            {step === 1 && <StepStamm state={state} update={update} />}
            {step === 2 && <StepSchwelle state={state} update={update} />}
            {step === 3 && <StepZufluesse state={state} update={update} />}
            {step === 4 && <StepVerwendung state={state} update={update} />}
            {step === 5 && <StepVermoegen state={state} update={update} />}
            {step === 6 && <StepRuecklagen state={state} update={update} />}
            {step === 7 && <StepMittelvortrag state={state} update={update} />}
            {step === 8 && <StepSpiegel state={state} update={update} />}
            {step === 9 && <StepErgebnis state={state} />}
            {step === 10 && <StepExport state={state} />}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Zurück
            </Button>
            <span className="text-xs text-muted-foreground">Schritt {step + 1} / {STEPS.length}</span>
            <Button onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} disabled={step === STEPS.length - 1}>
              Weiter <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

// -------- Stufen --------

function StepStamm({ state, update }: { state: MvrState; update: <K extends keyof MvrState>(k: K, v: MvrState[K]) => void }) {
  const s = state.stamm;
  const set = <K extends keyof typeof s>(k: K, v: typeof s[K]) => update("stamm", { ...s, [k]: v });
  return (
    <Card title="Stammdaten" accent="var(--cyan)">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label="Name der Körperschaft" value={s.name} onChange={(v) => set("name", v)} placeholder="z. B. Beispielverein e. V." />
        <SelectField label="Rechtsform" value={s.rechtsform} onChange={(v) => set("rechtsform", v)}
          options={[{ value: "Verein", label: "Verein" }, { value: "gGmbH", label: "gGmbH" }, { value: "Stiftung", label: "Stiftung" }, { value: "sonstige", label: "Sonstige" }]} />
        <TextField label="Wirtschaftsjahr / Kalenderjahr" value={s.jahr} onChange={(v) => set("jahr", v)} placeholder="2024" />
        <SelectField label="Gewinnermittlung" value={s.gewinnermittlung} onChange={(v) => set("gewinnermittlung", v)}
          options={[{ value: "EÜR", label: "EÜR" }, { value: "Bilanz", label: "Bilanz" }, { value: "unklar", label: "noch unklar" }]} />
        <SelectField label="Gemeinnützigkeit" value={s.gemeinnuetzig} onChange={(v) => set("gemeinnuetzig", v)}
          options={[{ value: "ja", label: "ja" }, { value: "nein", label: "nein" }, { value: "pruefung", label: "in Prüfung" }]} />
        <TextField label="Art der Organisation" value={s.artOrganisation} onChange={(v) => set("artOrganisation", v)} placeholder="Verein, Förderverein, operative NPO, Stiftung, gGmbH" />
        <TextField label="Bearbeiter/in" value={s.bearbeiter} onChange={(v) => set("bearbeiter", v)} />
        <SelectField label="Review-Status" value={s.reviewStatus} onChange={(v) => set("reviewStatus", v)}
          options={[{ value: "Entwurf", label: "Entwurf" }, { value: "in Prüfung", label: "in Prüfung" }, { value: "geprüft", label: "geprüft" }]} />
      </div>
    </Card>
  );
}

function StepSchwelle({ state, update }: { state: MvrState; update: <K extends keyof MvrState>(k: K, v: MvrState[K]) => void }) {
  const s = state.schwelle;
  const set = <K extends keyof typeof s>(k: K, v: number) => update("schwelle", { ...s, [k]: v });
  const sum = gesamtEinnahmen(s);
  const a = schwelleAmpel(s);
  return (
    <Card title="45.000-€-Schwellenprüfung" accent="var(--violet)">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumField label="Einnahmen ideeller Bereich (€)" value={s.ideell} onChange={(v) => set("ideell", v)} />
        <NumField label="Einnahmen Zweckbetrieb (€)" value={s.zweckbetrieb} onChange={(v) => set("zweckbetrieb", v)} />
        <NumField label="Einnahmen Vermögensverwaltung (€)" value={s.vermoegensverwaltung} onChange={(v) => set("vermoegensverwaltung", v)} />
        <NumField label="Einnahmen steuerpfl. wirt. Geschäftsbetrieb (€)" value={s.wgB} onChange={(v) => set("wgB", v)} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className={`rounded-full border px-3 py-1 text-xs font-medium ${ampelClass(a.ampel)}`}>
          Ampel: {ampelLabel(a.ampel)}
        </span>
        <span className="text-sm text-foreground">Gesamteinnahmen: <strong>{fmt(sum)}</strong></span>
      </div>
      <div className="mt-3"><Note tone={a.ampel === "gruen" ? "ok" : "warn"}>{a.hinweis}</Note></div>
    </Card>
  );
}

function StepZufluesse({ state, update }: { state: MvrState; update: <K extends keyof MvrState>(k: K, v: MvrState[K]) => void }) {
  const z = state.zufluesse;
  const set = <K extends keyof typeof z>(k: K, v: typeof z[K]) => update("zufluesse", { ...z, [k]: v });
  return (
    <div className="space-y-5">
      <Card title="Zeitnah zu verwendende Mittel" accent="var(--cyan)">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumField label="Spenden (€)" value={z.spenden} onChange={(v) => set("spenden", v)} />
          <NumField label="Mitgliedsbeiträge (€)" value={z.mitgliedsbeitraege} onChange={(v) => set("mitgliedsbeitraege", v)} />
          <NumField label="Zuschüsse (€)" value={z.zuschuesse} onChange={(v) => set("zuschuesse", v)} />
          <NumField label="Einnahmen ideeller Bereich (€)" value={z.ideell} onChange={(v) => set("ideell", v)} />
          <NumField label="Überschüsse Zweckbetrieb (€)" value={z.ueberschussZweckbetrieb} onChange={(v) => set("ueberschussZweckbetrieb", v)} />
          <NumField label="Gewinne steuerpfl. wGB (€)" value={z.gewinnWgB} onChange={(v) => set("gewinnWgB", v)} />
          <NumField label="Überschüsse Vermögensverwaltung (€)" value={z.ueberschussVV} onChange={(v) => set("ueberschussVV", v)} />
          <NumField label="Sonstige zeitnah zu verwendende Mittel (€)" value={z.sonstigeZeitnah} onChange={(v) => set("sonstigeZeitnah", v)} />
          <TextField label="Zuflussjahr" value={z.zuflussjahr} onChange={(v) => set("zuflussjahr", v)} />
        </div>
        <div className="mt-3 text-sm">
          Zeitnah zu verwenden: <strong>{fmt(zeitnahZuVerwendendeMittel(z))}</strong>
        </div>
      </Card>

      <Card title="Vermögen / nicht zeitnah zu verwendende Mittel" accent="var(--magenta)">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumField label="Vermögenszuführungen § 62 Abs. 3 AO (€)" value={z.vermoegenszufuehrung62Abs3} onChange={(v) => set("vermoegenszufuehrung62Abs3", v)} />
          <NumField label="Grundstockvermögen / Stiftungskapital (€)" value={z.grundstockvermoegen} onChange={(v) => set("grundstockvermoegen", v)} />
          <NumField label="Einlagen von Stiftern (€)" value={z.einlagenStifter} onChange={(v) => set("einlagenStifter", v)} />
        </div>
        <div className="mt-3 space-y-2">
          <Note tone="info">Grundstockvermögen und Stiftungseinlagen werden nicht als zeitnah zu verwendende Mittel behandelt.</Note>
          <Note tone="info">Mittel aus der Vermögensverwaltung dürfen für die 10 %-Rücklage nicht doppelt berücksichtigt werden.</Note>
        </div>
      </Card>
    </div>
  );
}

function StepVerwendung({ state, update }: { state: MvrState; update: <K extends keyof MvrState>(k: K, v: MvrState[K]) => void }) {
  const v = state.verwendung;
  const set = <K extends keyof typeof v>(k: K, val: number) => update("verwendung", { ...v, [k]: val });
  return (
    <div className="space-y-5">
      <Card title="Zweckentsprechend verwendete Mittel" accent="var(--cyan)">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumField label="Ausgaben ideeller Bereich (€)" value={v.ausgIdeell} onChange={(x) => set("ausgIdeell", x)} />
          <NumField label="Ausgaben Zweckbetrieb (€)" value={v.ausgZweckbetrieb} onChange={(x) => set("ausgZweckbetrieb", x)} />
          <NumField label="Mittelweitergabe an steuerbeg. Körperschaften (€)" value={v.mittelweitergabe} onChange={(x) => set("mittelweitergabe", x)} />
          <NumField label="Nutzungsgebundenes Anlagevermögen (€)" value={v.anlagevermoegenNutzungsgebunden} onChange={(x) => set("anlagevermoegenNutzungsgebunden", x)} />
        </div>
        <div className="mt-3 text-sm">Summe zweckentsprechend: <strong>{fmt(zweckentsprechendeVerwendung(v))}</strong></div>
      </Card>

      <Card title="Prüfpflichtige Mittelverwendung" accent="var(--magenta)">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumField label="Ausgaben Vermögensverwaltung (€)" value={v.ausgVV} onChange={(x) => set("ausgVV", x)} />
          <NumField label="Ausgaben steuerpfl. wGB (€)" value={v.ausgWgB} onChange={(x) => set("ausgWgB", x)} />
          <NumField label="Sonstiges Anlagevermögen (€)" value={v.anlagevermoegenSonstiges} onChange={(x) => set("anlagevermoegenSonstiges", x)} />
          <NumField label="Darlehensvergabe (€)" value={v.darlehen} onChange={(x) => set("darlehen", x)} />
          <NumField label="Sonstige Mittelverwendung (€)" value={v.sonstige} onChange={(x) => set("sonstige", x)} />
        </div>
        <div className="mt-3 text-sm">Summe prüfpflichtig: <strong>{fmt(pruefpflichtigeVerwendung(v))}</strong></div>
        {v.darlehen > 0 && (
          <div className="mt-3">
            <Note tone="warn">
              Darlehen aus zeitnah zu verwendenden Mitteln sind nur in engen Fällen unschädlich, wenn die Darlehensvergabe selbst der unmittelbaren Zweckverwirklichung dient. Andernfalls Finanzierung aus nicht zeitnah zu verwendenden Mitteln (z. B. freier Rücklage) prüfen.
            </Note>
          </div>
        )}
      </Card>
    </div>
  );
}

function StepVermoegen({ state, update }: { state: MvrState; update: <K extends keyof MvrState>(k: K, v: MvrState[K]) => void }) {
  const v = state.vermoegen;
  const set = <K extends keyof typeof v>(k: K, val: number) => update("vermoegen", { ...v, [k]: val });
  return (
    <Card title="Vermögensbestandteile" accent="var(--violet)">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumField label="Bankguthaben (€)" value={v.bank} onChange={(x) => set("bank", x)} />
        <NumField label="Kasse (€)" value={v.kasse} onChange={(x) => set("kasse", x)} />
        <NumField label="Forderungen kurzfristig (€)" value={v.forderungenKurz} onChange={(x) => set("forderungenKurz", x)} />
        <NumField label="Forderungen langfristig (€)" value={v.forderungenLang} onChange={(x) => set("forderungenLang", x)} />
        <NumField label="Sachanlagen ideell / Zweckbetrieb (€)" value={v.saIdeell} onChange={(x) => set("saIdeell", x)} />
        <NumField label="Sachanlagen Vermögensverwaltung (€)" value={v.saVV} onChange={(x) => set("saVV", x)} />
        <NumField label="Sachanlagen wGB (€)" value={v.saWgB} onChange={(x) => set("saWgB", x)} />
        <NumField label="Sonstiges Anlagevermögen (€)" value={v.saSonstiges} onChange={(x) => set("saSonstiges", x)} />
        <NumField label="Verbindlichkeiten (€)" value={v.verbindlichkeiten} onChange={(x) => set("verbindlichkeiten", x)} />
        <NumField label="Darlehen (€)" value={v.darlehen} onChange={(x) => set("darlehen", x)} />
        <NumField label="Rückstellungen (€)" value={v.rueckstellungen} onChange={(x) => set("rueckstellungen", x)} />
      </div>
      <div className="mt-3 space-y-2">
        <Note tone="info">Nutzungsgebundenes Anlagevermögen im ideellen Bereich / Zweckbetrieb gilt als zweckentsprechend verwendet.</Note>
        <Note tone="warn">Sonstiges Anlagevermögen in VV oder wGB ist prüfpflichtig und darf nur durch nicht zeitnah zu verwendende Mittel gedeckt sein.</Note>
      </div>
    </Card>
  );
}

function StepRuecklagen({ state, update }: { state: MvrState; update: <K extends keyof MvrState>(k: K, v: MvrState[K]) => void }) {
  const fr = berechneFreieRuecklage(state.freieRuecklage);
  const bm = betriebsmittelSumme(state.betriebsmittel);

  return (
    <div className="space-y-5">
      {/* A. Zweckgebunden */}
      <Card title="A. Zweckgebundene Rücklage" accent="var(--cyan)">
        <Note tone="warn">Eine bloße Absicht reicht nicht aus. Konkrete Zeit- und Finanzierungsvorstellungen sollten dokumentiert sein.</Note>
        <div className="mt-4 space-y-3">
          {state.zweckRuecklagen.map((r, i) => (
            <div key={r.id} className="rounded-lg border border-border bg-background p-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <TextField label="Projekt" value={r.projekt} onChange={(v) => {
                  const arr = [...state.zweckRuecklagen]; arr[i] = { ...r, projekt: v }; update("zweckRuecklagen", arr);
                }} />
                <TextField label="Satzungsmäßiger Zweck" value={r.zweck} onChange={(v) => {
                  const arr = [...state.zweckRuecklagen]; arr[i] = { ...r, zweck: v }; update("zweckRuecklagen", arr);
                }} />
                <NumField label="Geplante Kosten (€)" value={r.geplant} onChange={(v) => {
                  const arr = [...state.zweckRuecklagen]; arr[i] = { ...r, geplant: v }; update("zweckRuecklagen", arr);
                }} />
                <NumField label="Bisher angespart (€)" value={r.bisher} onChange={(v) => {
                  const arr = [...state.zweckRuecklagen]; arr[i] = { ...r, bisher: v }; update("zweckRuecklagen", arr);
                }} />
                <NumField label="Zuführung im Jahr (€)" value={r.zufuehrung} onChange={(v) => {
                  const arr = [...state.zweckRuecklagen]; arr[i] = { ...r, zufuehrung: v }; update("zweckRuecklagen", arr);
                }} />
                <TextField label="Geplanter Verwendungszeitpunkt" value={r.verwendungAm} onChange={(v) => {
                  const arr = [...state.zweckRuecklagen]; arr[i] = { ...r, verwendungAm: v }; update("zweckRuecklagen", arr);
                }} />
              </div>
              <div className="mt-3 flex flex-wrap gap-4">
                <CheckField label="Finanzierungsplan vorhanden" value={r.finanzplan} onChange={(b) => {
                  const arr = [...state.zweckRuecklagen]; arr[i] = { ...r, finanzplan: b }; update("zweckRuecklagen", arr);
                }} />
                <CheckField label="Vorstandsbeschluss vorhanden" value={r.beschluss} onChange={(b) => {
                  const arr = [...state.zweckRuecklagen]; arr[i] = { ...r, beschluss: b }; update("zweckRuecklagen", arr);
                }} />
                <CheckField label="Beleg / Dokumentation" value={r.beleg} onChange={(b) => {
                  const arr = [...state.zweckRuecklagen]; arr[i] = { ...r, beleg: b }; update("zweckRuecklagen", arr);
                }} />
                <Button variant="ghost" size="sm" className="ml-auto" onClick={() => {
                  update("zweckRuecklagen", state.zweckRuecklagen.filter((x) => x.id !== r.id));
                }}><Trash2 className="mr-1 h-3 w-3" /> Entfernen</Button>
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => update("zweckRuecklagen", [
            ...state.zweckRuecklagen,
            { id: uid(), projekt: "", zweck: "", geplant: 0, bisher: 0, zufuehrung: 0, verwendungAm: "", finanzplan: false, beschluss: false, beleg: false },
          ])}><Plus className="mr-1 h-3 w-3" /> Zweckrücklage hinzufügen</Button>
        </div>
      </Card>

      {/* B. Betriebsmittel */}
      <Card title={<>B. <Term name="Betriebsmittelrücklage" /></>} accent="var(--violet)">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumField label="Personalkosten / Monat (€)" value={state.betriebsmittel.personal} onChange={(v) => update("betriebsmittel", { ...state.betriebsmittel, personal: v })} />
          <NumField label="Miete / Monat (€)" value={state.betriebsmittel.miete} onChange={(v) => update("betriebsmittel", { ...state.betriebsmittel, miete: v })} />
          <NumField label="Energie / Monat (€)" value={state.betriebsmittel.energie} onChange={(v) => update("betriebsmittel", { ...state.betriebsmittel, energie: v })} />
          <NumField label="Sonstige Fixkosten / Monat (€)" value={state.betriebsmittel.sonstige} onChange={(v) => update("betriebsmittel", { ...state.betriebsmittel, sonstige: v })} />
          <NumField label="Zeitraum (Monate)" value={state.betriebsmittel.monate} onChange={(v) => update("betriebsmittel", { ...state.betriebsmittel, monate: v })} hint="Orientierung: 3 bis 12 Monate" />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <CheckField label="Vorstandsbeschluss vorhanden" value={state.betriebsmittel.beschluss} onChange={(b) => update("betriebsmittel", { ...state.betriebsmittel, beschluss: b })} />
          <span className="text-sm">Betriebsmittelrücklage: <strong>{fmt(bm)}</strong></span>
        </div>
        {state.betriebsmittel.monate > 12 && (
          <div className="mt-3"><Note tone="warn">Zeitraum über 12 Monate – bitte besonders begründen und prüfen.</Note></div>
        )}
      </Card>

      {/* C. Wiederbeschaffung */}
      <Card title="C. Wiederbeschaffungsrücklage" accent="var(--magenta)">
        <div className="space-y-3">
          {state.wiederbeschaffung.map((r, i) => (
            <div key={r.id} className="rounded-lg border border-border bg-background p-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <TextField label="Wirtschaftsgut" value={r.wirtschaftsgut} onChange={(v) => {
                  const arr = [...state.wiederbeschaffung]; arr[i] = { ...r, wirtschaftsgut: v }; update("wiederbeschaffung", arr);
                }} />
                <NumField label="Anschaffungskosten (€)" value={r.ak} onChange={(v) => {
                  const arr = [...state.wiederbeschaffung]; arr[i] = { ...r, ak: v }; update("wiederbeschaffung", arr);
                }} />
                <NumField label="Nutzungsdauer (Jahre)" value={r.nutzungsdauer} onChange={(v) => {
                  const arr = [...state.wiederbeschaffung]; arr[i] = { ...r, nutzungsdauer: v }; update("wiederbeschaffung", arr);
                }} />
                <NumField label="Jährliche AfA (€)" value={r.afa} onChange={(v) => {
                  const arr = [...state.wiederbeschaffung]; arr[i] = { ...r, afa: v }; update("wiederbeschaffung", arr);
                }} />
                <TextField label="Geplanter Ersatzzeitpunkt" value={r.ersatzAm} onChange={(v) => {
                  const arr = [...state.wiederbeschaffung]; arr[i] = { ...r, ersatzAm: v }; update("wiederbeschaffung", arr);
                }} />
                <NumField label="Jährliche Zuführung (€)" value={r.zufuehrung} onChange={(v) => {
                  const arr = [...state.wiederbeschaffung]; arr[i] = { ...r, zufuehrung: v }; update("wiederbeschaffung", arr);
                }} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <CheckField label="Vorstandsbeschluss vorhanden" value={r.beschluss} onChange={(b) => {
                  const arr = [...state.wiederbeschaffung]; arr[i] = { ...r, beschluss: b }; update("wiederbeschaffung", arr);
                }} />
                {r.afa > 0 && r.zufuehrung > r.afa && (
                  <span className="text-xs text-amber-700">Zuführung übersteigt AfA – fachlich prüfen.</span>
                )}
                <Button variant="ghost" size="sm" className="ml-auto" onClick={() => {
                  update("wiederbeschaffung", state.wiederbeschaffung.filter((x) => x.id !== r.id));
                }}><Trash2 className="mr-1 h-3 w-3" /> Entfernen</Button>
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => update("wiederbeschaffung", [
            ...state.wiederbeschaffung,
            { id: uid(), wirtschaftsgut: "", ak: 0, nutzungsdauer: 0, afa: 0, ersatzAm: "", zufuehrung: 0, beschluss: false },
          ])}><Plus className="mr-1 h-3 w-3" /> Wiederbeschaffungsrücklage hinzufügen</Button>
        </div>
        <div className="mt-3"><Note tone="info">Zulässige jährliche Zuführung orientiert sich grundsätzlich an der jährlichen AfA.</Note></div>
      </Card>

      {/* D. Freie Rücklage */}
      <Card title={<>D. <Term name="freie Rücklage">Freie Rücklage</Term></>} accent="var(--deep-blue)">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumField label="Überschuss Vermögensverwaltung (€)" value={state.freieRuecklage.ueberschussVV} onChange={(v) => update("freieRuecklage", { ...state.freieRuecklage, ueberschussVV: v })} />
          <NumField label="Unterdeckung VV aus Vorjahren (€)" value={state.freieRuecklage.unterdeckungVorjahre} onChange={(v) => update("freieRuecklage", { ...state.freieRuecklage, unterdeckungVorjahre: v })} />
          <NumField label="Sonstige zeitnah zu verwendende Mittel (€)" value={state.freieRuecklage.sonstigeZeitnah} onChange={(v) => update("freieRuecklage", { ...state.freieRuecklage, sonstigeZeitnah: v })} />
          <NumField label="Nicht ausgeschöpft Vorjahr 1 (€)" value={state.freieRuecklage.nichtAusgeschoepftVJ1} onChange={(v) => update("freieRuecklage", { ...state.freieRuecklage, nichtAusgeschoepftVJ1: v })} />
          <NumField label="Nicht ausgeschöpft Vorjahr 2 (€)" value={state.freieRuecklage.nichtAusgeschoepftVJ2} onChange={(v) => update("freieRuecklage", { ...state.freieRuecklage, nichtAusgeschoepftVJ2: v })} />
          <NumField label="Geplante Zuführung freie Rücklage (€)" value={state.freieRuecklage.geplanteZufuehrung} onChange={(v) => update("freieRuecklage", { ...state.freieRuecklage, geplanteZufuehrung: v })} />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2 rounded-lg border border-border bg-background p-3 text-sm sm:grid-cols-2">
          <div>Verrechenbarer Überschuss VV: <strong>{fmt(fr.verrechenbarerVV)}</strong></div>
          <div>Unterdeckung Vortrag: <strong>{fmt(fr.unterdeckungVortrag)}</strong></div>
          <div>1/3 aus VV: <strong>{fmt(fr.drittelVV)}</strong></div>
          <div>10 % sonstige Mittel: <strong>{fmt(fr.zehnProzentSonstige)}</strong></div>
          <div>Nachholung Vorjahre: <strong>{fmt(fr.nachholung)}</strong></div>
          <div className="sm:col-span-2">Max. zulässige freie Rücklage: <strong>{fmt(fr.maxZuluessig)}</strong></div>
          <div className="sm:col-span-2">Differenz zur geplanten Zuführung: <strong>{fmt(fr.differenz)}</strong></div>
        </div>
        <div className="mt-3">
          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${ampelClass(fr.ampel)}`}>Ampel: {ampelLabel(fr.ampel)}</span>
        </div>
        <div className="mt-3"><Note tone="info">Mittel aus der Vermögensverwaltung dürfen nicht zusätzlich in die Bemessungsgrundlage der 10 %-Rücklage einbezogen werden.</Note></div>
      </Card>

      {/* E. Gesellschaftsrechte */}
      <Card title="E. Rücklage zum Erwerb von Gesellschaftsrechten" accent="var(--magenta)">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CheckField label="Bestehende Beteiligung vorhanden" value={state.gesellschaftsrechte.vorhanden} onChange={(b) => update("gesellschaftsrechte", { ...state.gesellschaftsrechte, vorhanden: b })} />
          <SelectField label="Zweck" value={state.gesellschaftsrechte.zweck} onChange={(v) => update("gesellschaftsrechte", { ...state.gesellschaftsrechte, zweck: v })}
            options={[{ value: "erhaltung", label: "Erhaltung der Beteiligungsquote" }, { value: "erstmalig", label: "Erstmaliger Erwerb" }]} />
          <NumField label="Beteiligungshöhe bisher (€)" value={state.gesellschaftsrechte.bisher} onChange={(v) => update("gesellschaftsrechte", { ...state.gesellschaftsrechte, bisher: v })} />
          <NumField label="Beteiligungshöhe nach Kapitalmaßnahme (€)" value={state.gesellschaftsrechte.nachher} onChange={(v) => update("gesellschaftsrechte", { ...state.gesellschaftsrechte, nachher: v })} />
          <NumField label="Rücklagenbetrag (€)" value={state.gesellschaftsrechte.betrag} onChange={(v) => update("gesellschaftsrechte", { ...state.gesellschaftsrechte, betrag: v })} />
        </div>
        {state.gesellschaftsrechte.zweck === "erstmalig" && (
          <div className="mt-3"><Note tone="warn">Diese Rücklage ist nach der hinterlegten Logik nicht für den erstmaligen Erwerb vorgesehen. Finanzierung aus freier Rücklage prüfen.</Note></div>
        )}
      </Card>

      {/* F. Vermögenszuführung 62 Abs 3 */}
      <Card title="F. Vermögenszuführungen § 62 Abs. 3 AO" accent="var(--violet)">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumField label="Zuwendung von Todes wegen (€)" value={state.vz62Abs3.todesfall} onChange={(v) => update("vz62Abs3", { ...state.vz62Abs3, todesfall: v })} />
          <NumField label="Ausdrückliche Vermögensausstattung (€)" value={state.vz62Abs3.ausstattung} onChange={(v) => update("vz62Abs3", { ...state.vz62Abs3, ausstattung: v })} />
          <NumField label="Spendenaufruf zur Vermögensaufstockung (€)" value={state.vz62Abs3.spendenaufruf} onChange={(v) => update("vz62Abs3", { ...state.vz62Abs3, spendenaufruf: v })} />
          <NumField label="Sachzuwendung zur Vermögensbildung (€)" value={state.vz62Abs3.sachzuwendung} onChange={(v) => update("vz62Abs3", { ...state.vz62Abs3, sachzuwendung: v })} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <CheckField label="Nachweis vorhanden" value={state.vz62Abs3.nachweis} onChange={(b) => update("vz62Abs3", { ...state.vz62Abs3, nachweis: b })} />
          <span className="text-sm">Summe Vermögenszuführung: <strong>{fmt(vermoegenszufuehrungSumme(state.vz62Abs3))}</strong></span>
        </div>
      </Card>

      <div className="rounded-lg border border-border bg-background p-3 text-sm">
        Summe zulässiger Rücklagen (gesamt): <strong>{fmt(summeZulaessigeRuecklagen(state))}</strong>
      </div>
    </div>
  );
}

function StepMittelvortrag({ state, update }: { state: MvrState; update: <K extends keyof MvrState>(k: K, v: MvrState[K]) => void }) {
  const curYear = Number(state.stamm.jahr) || new Date().getFullYear();
  return (
    <Card title={<><Term name="Mittelvortrag" /> · Zwei-Jahres-Frist</>} accent="var(--cyan)">
      <Note tone="info">
        Mittel müssen spätestens in den beiden auf das Jahr des Zuflusses folgenden Kalender- oder
        Wirtschaftsjahren verwendet werden. Beispiel: Zufluss 2024 → Verwendung bis Ende 2026.
      </Note>
      <div className="mt-4 space-y-3">
        {state.mittelvortrag.map((m, i) => {
          const st = fristStatus(m, curYear);
          const tone = st.status === "ueberschritten" ? "danger" : st.status === "endetBald" ? "warn" : "ok";
          return (
            <div key={m.id} className="rounded-lg border border-border bg-background p-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <NumField label="Zuflussjahr" value={m.zuflussjahr} onChange={(v) => {
                  const arr = [...state.mittelvortrag]; arr[i] = { ...m, zuflussjahr: v }; update("mittelvortrag", arr);
                }} />
                <NumField label="Betrag (€)" value={m.betrag} onChange={(v) => {
                  const arr = [...state.mittelvortrag]; arr[i] = { ...m, betrag: v }; update("mittelvortrag", arr);
                }} />
                <NumField label="Verwendet im Zuflussjahr (€)" value={m.verwendetZufluss} onChange={(v) => {
                  const arr = [...state.mittelvortrag]; arr[i] = { ...m, verwendetZufluss: v }; update("mittelvortrag", arr);
                }} />
                <NumField label="Verwendet Folgejahr 1 (€)" value={m.verwendetFolge1} onChange={(v) => {
                  const arr = [...state.mittelvortrag]; arr[i] = { ...m, verwendetFolge1: v }; update("mittelvortrag", arr);
                }} />
                <NumField label="Verwendet Folgejahr 2 (€)" value={m.verwendetFolge2} onChange={(v) => {
                  const arr = [...state.mittelvortrag]; arr[i] = { ...m, verwendetFolge2: v }; update("mittelvortrag", arr);
                }} />
                <NumField label="In Rücklage eingestellt (€)" value={m.inRuecklage} onChange={(v) => {
                  const arr = [...state.mittelvortrag]; arr[i] = { ...m, inRuecklage: v }; update("mittelvortrag", arr);
                }} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <span>Fristende: <strong>{st.fristende}</strong></span>
                <span>Offen: <strong>{fmt(st.offen)}</strong></span>
                <span className={`rounded-full border px-2 py-0.5 text-xs ${ampelClass(tone === "danger" ? "rot" : tone === "warn" ? "gelb" : "gruen")}`}>
                  {st.status === "ueberschritten" ? "Frist überschritten" : st.status === "endetBald" ? "Frist läuft bald ab" : "Noch innerhalb Frist"}
                </span>
                <Button variant="ghost" size="sm" className="ml-auto" onClick={() => {
                  update("mittelvortrag", state.mittelvortrag.filter((x) => x.id !== m.id));
                }}><Trash2 className="mr-1 h-3 w-3" /> Entfernen</Button>
              </div>
            </div>
          );
        })}
        <Button variant="outline" size="sm" onClick={() => update("mittelvortrag", [
          ...state.mittelvortrag,
          { id: uid(), zuflussjahr: curYear, betrag: 0, verwendetZufluss: 0, verwendetFolge1: 0, verwendetFolge2: 0, inRuecklage: 0 },
        ])}><Plus className="mr-1 h-3 w-3" /> Mittelvortrag hinzufügen</Button>
      </div>
    </Card>
  );
}

const ART_LABEL: Record<RuecklageArt, string> = {
  frei: "Freie Rücklage",
  zweckgebunden: "Zweckgebundene Rücklage",
  betriebsmittel: "Betriebsmittelrücklage",
  wiederbeschaffung: "Wiederbeschaffungsrücklage",
  gesellschaftsrechte: "Rücklage Gesellschaftsrechte",
  vermoegenszufuehrung: "Vermögenszuführungen",
  sonstige: "Sonstige Rücklage",
};

function StepSpiegel({ state, update }: { state: MvrState; update: <K extends keyof MvrState>(k: K, v: MvrState[K]) => void }) {
  const exportText = () => {
    const lines = ["RÜCKLAGENSPIEGEL", "=".repeat(40)];
    state.spiegel.forEach((r) => {
      const end = r.anfangsbestand + r.zufuehrung - r.entnahme;
      lines.push(`${ART_LABEL[r.art]} | ${r.zweck} | Anfang ${fmt(r.anfangsbestand)} +${fmt(r.zufuehrung)} -${fmt(r.entnahme)} = ${fmt(end)} | Beschluss: ${r.beschlussdatum} | Nachweis: ${r.nachweis ? "ja" : "nein"} | Status: ${r.pruefstatus}${r.kommentar ? " | " + r.kommentar : ""}`);
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "ruecklagenspiegel.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card title="Rücklagenspiegel" accent="var(--magenta)">
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead className="bg-secondary text-secondary-foreground">
            <tr>
              {["Art", "Anfang", "Zuführung", "Entnahme", "Endbestand", "Zweck", "Beschluss", "Nachweis", "Status", "Kommentar", ""].map((h) => (
                <th key={h} className="px-2 py-2 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {state.spiegel.map((r, i) => {
              const end = r.anfangsbestand + r.zufuehrung - r.entnahme;
              return (
                <tr key={r.id} className="align-top">
                  <td className="px-2 py-2">
                    <select value={r.art} onChange={(e) => {
                      const arr = [...state.spiegel]; arr[i] = { ...r, art: e.target.value as RuecklageArt }; update("spiegel", arr);
                    }} className="rounded border border-input bg-transparent px-1 py-0.5 text-xs">
                      {(Object.keys(ART_LABEL) as RuecklageArt[]).map((k) => <option key={k} value={k}>{ART_LABEL[k]}</option>)}
                    </select>
                  </td>
                  {(["anfangsbestand", "zufuehrung", "entnahme"] as const).map((k) => (
                    <td key={k} className="px-2 py-2">
                      <Input type="number" value={r[k]} onChange={(e) => {
                        const arr = [...state.spiegel]; arr[i] = { ...r, [k]: Number(e.target.value) || 0 }; update("spiegel", arr);
                      }} className="h-7 w-24 text-xs" />
                    </td>
                  ))}
                  <td className="px-2 py-2 font-medium">{fmt(end)}</td>
                  <td className="px-2 py-2">
                    <Input value={r.zweck} onChange={(e) => { const arr = [...state.spiegel]; arr[i] = { ...r, zweck: e.target.value }; update("spiegel", arr); }} className="h-7 w-40 text-xs" />
                  </td>
                  <td className="px-2 py-2">
                    <Input value={r.beschlussdatum} onChange={(e) => { const arr = [...state.spiegel]; arr[i] = { ...r, beschlussdatum: e.target.value }; update("spiegel", arr); }} placeholder="TT.MM.JJJJ" className="h-7 w-28 text-xs" />
                    {!r.beschlussdatum && <div className="mt-1 text-[10px] text-amber-700">Beschluss fehlt</div>}
                  </td>
                  <td className="px-2 py-2">
                    <input type="checkbox" checked={r.nachweis} onChange={(e) => { const arr = [...state.spiegel]; arr[i] = { ...r, nachweis: e.target.checked }; update("spiegel", arr); }} />
                  </td>
                  <td className="px-2 py-2">
                    <select value={r.pruefstatus} onChange={(e) => { const arr = [...state.spiegel]; arr[i] = { ...r, pruefstatus: e.target.value as typeof r.pruefstatus }; update("spiegel", arr); }} className="rounded border border-input bg-transparent px-1 py-0.5 text-xs">
                      <option value="offen">offen</option>
                      <option value="geprüft">geprüft</option>
                      <option value="kritisch">kritisch</option>
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <Input value={r.kommentar} onChange={(e) => { const arr = [...state.spiegel]; arr[i] = { ...r, kommentar: e.target.value }; update("spiegel", arr); }} className="h-7 w-40 text-xs" />
                  </td>
                  <td className="px-2 py-2">
                    <Button variant="ghost" size="sm" onClick={() => update("spiegel", state.spiegel.filter((x) => x.id !== r.id))}><Trash2 className="h-3 w-3" /></Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => update("spiegel", [...state.spiegel, {
          id: uid(), art: "frei", anfangsbestand: 0, zufuehrung: 0, entnahme: 0,
          zweck: "", beschlussdatum: "", nachweis: false, pruefstatus: "offen", kommentar: "",
        }])}><Plus className="mr-1 h-3 w-3" /> Rücklage hinzufügen</Button>
        <Button variant="outline" size="sm" onClick={exportText}><Download className="mr-1 h-3 w-3" /> Spiegel exportieren</Button>
      </div>
    </Card>
  );
}

function StepErgebnis({ state }: { state: MvrState }) {
  const a = useMemo(() => analysiere(state), [state]);
  const e = a.ergebnis;
  const sw = a.schwelle;
  const [mode, setMode] = useState<"kurz" | "pruef" | "mandant" | "vorstand" | "fragen" | "todos">("kurz");

  const text = useMemo(() => {
    switch (mode) {
      case "kurz": return buildKurz(state);
      case "pruef": return buildPruefnotiz(state);
      case "mandant": return buildMandant(state);
      case "vorstand": return buildVorstand(state);
      case "fragen": return buildRueckfragen(state);
      case "todos": return buildTodos(state);
    }
  }, [mode, state]);

  const [copied, setCopied] = useState(false);
  const copy = async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  const download = () => {
    const names: Record<typeof mode, string> = {
      kurz: "kurze-einschaetzung.txt", pruef: "pruefnotiz.txt", mandant: "mandantenhinweis.txt",
      vorstand: "vorstandsvorlage.txt", fragen: "rueckfragen.txt", todos: "todo-mvr.txt",
    };
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = names[mode]; link.click(); URL.revokeObjectURL(url);
  };

  const modes: { key: typeof mode; label: string }[] = [
    { key: "kurz", label: "1 · Kurze Einschätzung" },
    { key: "pruef", label: "2 · Prüfnotiz (Kanzlei)" },
    { key: "mandant", label: "3 · Mandantenerklärung" },
    { key: "vorstand", label: "4 · Vorstandsvorlage" },
    { key: "fragen", label: "5 · Rückfragen" },
    { key: "todos", label: "6 · To-do-Liste" },
  ];

  return (
    <div className="space-y-5">
      {/* Header-Karte mit Ampel + Kernsatz */}
      <Card title="Gesamtergebnis" accent="var(--violet)">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${ampelClass(a.gesamt)}`}>
            Ampel: {ampelLabel(a.gesamt)}
          </span>
          <span className="text-xs text-muted-foreground">{a.findings.length} Hinweis(e) erkannt</span>
        </div>
        <p className="mt-3 text-sm text-foreground/90">{a.kernsatz}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-card/40 p-3 text-xs">
            <div className="font-medium text-foreground">Wichtigste Auffälligkeit</div>
            <p className="mt-1 text-foreground/80">{a.hauptauffaelligkeit}</p>
          </div>
          <div className="rounded-lg border border-border bg-card/40 p-3 text-xs">
            <div className="font-medium text-foreground">Nächster Schritt</div>
            <p className="mt-1 text-foreground/80">{a.naechsterSchritt}</p>
          </div>
        </div>
        <div className="mt-4"><Note tone="warn">Nicht verbindlich. Bitte steuerlich prüfen lassen.</Note></div>
      </Card>

      {/* Zahlenüberblick */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card title="Zeitnah"><div className="text-base font-semibold">{fmt(e.zeitnah)}</div></Card>
        <Card title="Zweckentsprechend"><div className="text-base font-semibold">{fmt(e.zweckentsprechend)}</div></Card>
        <Card title="Rücklagen"><div className="text-base font-semibold">{fmt(e.ruecklagen)}</div></Card>
        <Card title={<>Verwendungsüberhang</>}>
          <div className="text-base font-semibold">{fmt(e.verwendungsueberhang)}</div>
        </Card>
        <Card title="§ 62 Abs. 3 AO"><div className="text-base font-semibold">{fmt(e.vz62)}</div></Card>
        <Card title="Mittelvortrag offen"><div className="text-base font-semibold">{fmt(e.mittelvortragOffen)}</div></Card>
        <Card title="45.000-€-Schwelle">
          <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${ampelClass(sw.ampel)}`}>{ampelLabel(sw.ampel)}</span>
        </Card>
        <Card title="Freie Rücklage">
          <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${ampelClass(a.freie.ampel)}`}>{ampelLabel(a.freie.ampel)}</span>
        </Card>
      </div>

      {/* Findings */}
      <Card title="Findings (Risikologik)" accent="var(--magenta)">
        {a.findings.length === 0 ? (
          <p className="text-xs text-muted-foreground">Keine Auffälligkeiten erkannt.</p>
        ) : (
          <ul className="space-y-1.5 text-xs">
            {a.findings.map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className={`mt-0.5 inline-flex shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${ampelClass(f.level)}`}>{ampelLabel(f.level)}</span>
                <span className="text-foreground/85">{f.text}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Antwortmodi */}
      <Card title="Antwortmodi" accent="var(--cyan)">
        <div className="flex flex-wrap gap-1.5">
          {modes.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                mode === m.key
                  ? "border-foreground/30 bg-foreground text-background"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" onClick={copy}><Copy className="mr-1 h-3.5 w-3.5" /> {copied ? "Kopiert" : "Kopieren"}</Button>
          <Button size="sm" variant="outline" onClick={download}><Download className="mr-1 h-3.5 w-3.5" /> Als .txt</Button>
        </div>
        <Textarea value={text} readOnly className="mt-4 min-h-[360px] font-mono text-xs" />
      </Card>

      <Note tone="warn">{REVIEW_NOTE}</Note>
    </div>
  );
}

function StepExport({ state }: { state: MvrState }) {
  const text = useMemo(() => buildExport(state), [state]);
  const [copied, setCopied] = useState(false);
  const copy = async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  const download = (name: string) => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
  };
  return (
    <Card title="Export · Prüfnotiz" accent="var(--cyan)">
      <div className="flex flex-wrap gap-2">
        <Button onClick={copy}><Copy className="mr-1 h-4 w-4" /> {copied ? "Kopiert" : "Ergebnis kopieren"}</Button>
        <Button variant="outline" onClick={() => download("mittelverwendung.txt")}><Download className="mr-1 h-4 w-4" /> Als .txt</Button>
        <Button variant="outline" onClick={() => download("pruefnotiz.txt")}><Save className="mr-1 h-4 w-4" /> Prüfnotiz</Button>
        <Button variant="outline" onClick={() => download("mandantenuebersicht.txt")}><Save className="mr-1 h-4 w-4" /> Mandanten-/Vorstandsübersicht</Button>
      </div>
      <Textarea value={text} readOnly className="mt-4 min-h-[420px] font-mono text-xs" />
    </Card>
  );
}
