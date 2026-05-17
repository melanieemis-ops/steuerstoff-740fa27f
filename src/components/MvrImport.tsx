import { useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Upload, FileSpreadsheet, Wand2, CheckCircle2, AlertTriangle, Info, Trash2, ArrowRightCircle,
} from "lucide-react";
import type { MvrState } from "@/lib/mvrStore";

type UploadKind =
  | "saldenliste"
  | "einnahmenSphaeren"
  | "ausgabenSphaeren"
  | "ruecklagenspiegel"
  | "vermoegen"
  | "kontenrahmen";

const UPLOAD_AREAS: { id: UploadKind; title: string; hint: string }[] = [
  { id: "saldenliste", title: "Summen- und Saldenliste", hint: "DATEV-SuSa, Konto, Soll, Haben, Saldo" },
  { id: "einnahmenSphaeren", title: "Einnahmen-Auswertung nach Sphären", hint: "Ideeller Bereich, Zweckbetrieb, VV, wGB" },
  { id: "ausgabenSphaeren", title: "Ausgaben-Auswertung nach Sphären", hint: "Personal, Miete, Energie, Projektausgaben" },
  { id: "ruecklagenspiegel", title: "Rücklagenspiegel", hint: "Art, Anfangsbestand, Zuführung, Entnahme" },
  { id: "vermoegen", title: "Vermögensübersicht / Bilanz", hint: "Bank, Kasse, Forderungen, Sachanlagen" },
  { id: "kontenrahmen", title: "Individueller NPO-Kontenrahmen", hint: "Konto, Bezeichnung, Sphäre" },
];

const TARGETS = [
  { value: "ignore", label: "— Ignorieren" },
  { value: "pruefen", label: "Manuell prüfen" },
  { value: "spenden", label: "Mittelzufluss · Spenden" },
  { value: "mitgliedsbeitraege", label: "Mittelzufluss · Mitgliedsbeiträge" },
  { value: "zuschuesse", label: "Mittelzufluss · Zuschüsse" },
  { value: "ideell", label: "Mittelzufluss · Ideeller Bereich (sonst.)" },
  { value: "ueberschussZweckbetrieb", label: "Mittelzufluss · Überschuss Zweckbetrieb" },
  { value: "gewinnWgB", label: "Mittelzufluss · Gewinn wGB" },
  { value: "ueberschussVV", label: "Mittelzufluss · Überschuss Vermögensverwaltung" },
  { value: "sonstigeZeitnah", label: "Mittelzufluss · sonstige zeitnah" },
  { value: "ausgIdeell", label: "Mittelverwendung · Ideeller Bereich" },
  { value: "ausgZweckbetrieb", label: "Mittelverwendung · Zweckbetrieb" },
  { value: "ausgVV", label: "Mittelverwendung · Vermögensverwaltung" },
  { value: "ausgWgB", label: "Mittelverwendung · wGB" },
  { value: "mittelweitergabe", label: "Mittelverwendung · Mittelweitergabe § 58 Nr. 1" },
  { value: "anlNutz", label: "Anlagevermögen · nutzungsgebunden (ideell/ZB)" },
  { value: "anlSonst", label: "Anlagevermögen · sonstiges (VV/wGB)" },
  { value: "darlehen", label: "Darlehen (prüfpflichtig)" },
  { value: "sonstigeVerw", label: "Mittelverwendung · sonstige" },
  { value: "bm.personal", label: "Betriebsmittelrücklage · Personal/Monat" },
  { value: "bm.miete", label: "Betriebsmittelrücklage · Miete/Monat" },
  { value: "bm.energie", label: "Betriebsmittelrücklage · Energie/Monat" },
  { value: "bm.sonstige", label: "Betriebsmittelrücklage · sonstige Fixkosten/Monat" },
  { value: "v.bank", label: "Vermögen · Bank" },
  { value: "v.kasse", label: "Vermögen · Kasse" },
  { value: "v.forderungenKurz", label: "Vermögen · Forderungen kurzfristig" },
  { value: "v.forderungenLang", label: "Vermögen · Forderungen langfristig" },
  { value: "v.verbindlichkeiten", label: "Vermögen · Verbindlichkeiten" },
  { value: "v.darlehen", label: "Vermögen · Darlehen" },
  { value: "v.rueckstellungen", label: "Vermögen · Rückstellungen" },
] as const;

type TargetValue = typeof TARGETS[number]["value"];

interface ParsedRow {
  id: string;
  source: UploadKind;
  konto: string;
  bezeichnung: string;
  betrag: number;
  soll?: number;
  haben?: number;
  saldo?: number;
  sphaere?: string;
  target: TargetValue;
  note?: string;
}

// ---------- Auto-Mapping ----------
const RULES: { re: RegExp; target: TargetValue; note?: string }[] = [
  { re: /spende/i, target: "spenden" },
  { re: /mitglied(s)?beitrag|beitrag\s+mitglied/i, target: "mitgliedsbeitraege" },
  { re: /zuschuss|zuschüsse|förderung|fördermittel/i, target: "zuschuesse" },
  { re: /zweckbetrieb.*(einnahme|erlös|überschuss)|einnahme.*zweckbetrieb/i, target: "ueberschussZweckbetrieb" },
  { re: /(wirtschaftlicher? geschäftsbetrieb|wgb).*(gewinn|erlös|einnahme)/i, target: "gewinnWgB", note: "separat ausweisen" },
  { re: /vermögensverwaltung.*(zins|miete|ertrag|überschuss)|zinsertrag|miet(ertrag|einnahme)/i, target: "ueberschussVV", note: "separat ausweisen" },
  { re: /personal|gehalt|lohn|vergütung/i, target: "bm.personal", note: "mögliche Betriebsmittelrücklage" },
  { re: /^miete$|raumkost|nebenkost.*raum|pacht/i, target: "bm.miete", note: "mögliche Betriebsmittelrücklage" },
  { re: /strom|gas|energie|heizöl|fernwärme/i, target: "bm.energie", note: "mögliche Betriebsmittelrücklage" },
  { re: /bank|giro|sparkasse|kontokorrent/i, target: "v.bank", note: "Vermögensbestand" },
  { re: /kasse\b/i, target: "v.kasse", note: "Vermögensbestand" },
  { re: /forderung.*kurz|debitor/i, target: "v.forderungenKurz" },
  { re: /forderung.*lang/i, target: "v.forderungenLang" },
  { re: /verbindlichkeit|kreditor/i, target: "v.verbindlichkeiten" },
  { re: /rückstellung/i, target: "v.rueckstellungen" },
  { re: /darlehen|kredit/i, target: "darlehen", note: "prüfpflichtig" },
  { re: /(anlagevermögen|sachanlage).*(ideell|zweckbetrieb)/i, target: "anlNutz", note: "nutzungsgebunden" },
  { re: /(anlagevermögen|sachanlage).*(verwaltung|wgb|geschäftsbetrieb)/i, target: "anlSonst", note: "prüfpflichtig" },
  { re: /mittelweitergabe|weiterleitung.*körperschaft|§\s*58/i, target: "mittelweitergabe" },
  { re: /projektausgabe|projektkost|programm|maßnahme/i, target: "ausgIdeell" },
];

function autoMap(bezeichnung: string): { target: TargetValue; note?: string } {
  for (const r of RULES) if (r.re.test(bezeichnung)) return { target: r.target, note: r.note };
  return { target: "pruefen" };
}

// ---------- Parser ----------
function parseSheet(rows: unknown[][], source: UploadKind): ParsedRow[] {
  if (rows.length < 2) return [];
  const header = (rows[0] as unknown[]).map((c) => String(c ?? "").toLowerCase().trim());
  const idx = (names: string[]) => {
    for (const n of names) {
      const i = header.findIndex((h) => h.includes(n));
      if (i >= 0) return i;
    }
    return -1;
  };
  const iKonto = idx(["konto", "kontonr", "kontonummer"]);
  const iBez = idx(["bezeichnung", "name", "text", "beschreibung"]);
  const iBetrag = idx(["betrag", "summe", "wert"]);
  const iSoll = idx(["soll"]);
  const iHaben = idx(["haben"]);
  const iSaldo = idx(["saldo", "endsaldo"]);
  const iSph = idx(["sphäre", "sphaere", "bereich"]);

  const out: ParsedRow[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r] as unknown[];
    if (!row || row.every((c) => c == null || String(c).trim() === "")) continue;
    const konto = iKonto >= 0 ? String(row[iKonto] ?? "").trim() : "";
    const bezeichnung = iBez >= 0 ? String(row[iBez] ?? "").trim() : String(row[0] ?? "").trim();
    const toNum = (v: unknown) => {
      if (v == null || v === "") return 0;
      const s = String(v).replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "");
      const n = Number(s);
      return Number.isFinite(n) ? n : 0;
    };
    const soll = iSoll >= 0 ? toNum(row[iSoll]) : undefined;
    const haben = iHaben >= 0 ? toNum(row[iHaben]) : undefined;
    const saldo = iSaldo >= 0 ? toNum(row[iSaldo]) : undefined;
    const betrag =
      iBetrag >= 0 ? toNum(row[iBetrag])
      : saldo != null ? saldo
      : (soll ?? 0) - (haben ?? 0);
    if (!bezeichnung && !konto) continue;
    const am = autoMap(bezeichnung || konto);
    out.push({
      id: Math.random().toString(36).slice(2, 9),
      source,
      konto, bezeichnung, betrag, soll, haben, saldo,
      sphaere: iSph >= 0 ? String(row[iSph] ?? "").trim() : undefined,
      target: am.target,
      note: am.note,
    });
  }
  return out;
}

async function readFile(file: File, source: UploadKind): Promise<ParsedRow[]> {
  const buf = await file.arrayBuffer();
  const isCsv = /\.(csv|txt)$/i.test(file.name);
  const wb = isCsv
    ? XLSX.read(new TextDecoder().decode(buf), { type: "string" })
    : XLSX.read(buf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: "" });
  return parseSheet(rows, source);
}

// ---------- Demo-Daten ----------
const DEMO: Record<UploadKind, ParsedRow[]> = {
  saldenliste: [
    { id: "d1", source: "saldenliste", konto: "8200", bezeichnung: "Spenden ideeller Bereich", betrag: 42000, target: "spenden", note: "auto" },
    { id: "d2", source: "saldenliste", konto: "8210", bezeichnung: "Mitgliedsbeiträge", betrag: 12500, target: "mitgliedsbeitraege" },
    { id: "d3", source: "saldenliste", konto: "8230", bezeichnung: "Öffentliche Zuschüsse", betrag: 18000, target: "zuschuesse" },
    { id: "d4", source: "saldenliste", konto: "4120", bezeichnung: "Gehälter Geschäftsstelle", betrag: 6500, target: "bm.personal", note: "Betriebsmittelrücklage" },
    { id: "d5", source: "saldenliste", konto: "4210", bezeichnung: "Miete Geschäftsstelle", betrag: 1850, target: "bm.miete", note: "Betriebsmittelrücklage" },
    { id: "d6", source: "saldenliste", konto: "4240", bezeichnung: "Stromkosten / Energie", betrag: 420, target: "bm.energie", note: "Betriebsmittelrücklage" },
    { id: "d7", source: "saldenliste", konto: "1200", bezeichnung: "Bank Girokonto", betrag: 87340, target: "v.bank", note: "Vermögensbestand" },
    { id: "d8", source: "saldenliste", konto: "1000", bezeichnung: "Kasse", betrag: 340, target: "v.kasse" },
    { id: "d9", source: "saldenliste", konto: "0860", bezeichnung: "Darlehen an Tochter-gGmbH", betrag: 25000, target: "darlehen", note: "prüfpflichtig" },
  ],
  einnahmenSphaeren: [
    { id: "e1", source: "einnahmenSphaeren", konto: "—", bezeichnung: "Vermögensverwaltung Zinsertrag", betrag: 3200, target: "ueberschussVV", note: "separat ausweisen" },
    { id: "e2", source: "einnahmenSphaeren", konto: "—", bezeichnung: "Zweckbetrieb Kursgebühren Überschuss", betrag: 8400, target: "ueberschussZweckbetrieb" },
    { id: "e3", source: "einnahmenSphaeren", konto: "—", bezeichnung: "wGB Cafeteria Gewinn", betrag: 2100, target: "gewinnWgB", note: "separat ausweisen" },
  ],
  ausgabenSphaeren: [
    { id: "a1", source: "ausgabenSphaeren", konto: "—", bezeichnung: "Projektausgaben Bildungsangebot", betrag: 14500, target: "ausgIdeell" },
    { id: "a2", source: "ausgabenSphaeren", konto: "—", bezeichnung: "Mittelweitergabe Partnerverein § 58", betrag: 5000, target: "mittelweitergabe" },
  ],
  ruecklagenspiegel: [
    { id: "r1", source: "ruecklagenspiegel", konto: "—", bezeichnung: "Freie Rücklage", betrag: 12000, target: "pruefen", note: "manuell zuordnen" },
  ],
  vermoegen: [
    { id: "v1", source: "vermoegen", konto: "1200", bezeichnung: "Bank", betrag: 87340, target: "v.bank" },
    { id: "v2", source: "vermoegen", konto: "1700", bezeichnung: "Verbindlichkeiten aus L+L", betrag: 4200, target: "v.verbindlichkeiten" },
    { id: "v3", source: "vermoegen", konto: "0400", bezeichnung: "Sachanlage Therapieraum (ideell)", betrag: 18000, target: "anlNutz", note: "nutzungsgebunden" },
  ],
  kontenrahmen: [
    { id: "k1", source: "kontenrahmen", konto: "8200", bezeichnung: "Spenden", betrag: 0, target: "spenden" },
    { id: "k2", source: "kontenrahmen", konto: "8210", bezeichnung: "Mitgliedsbeiträge", betrag: 0, target: "mitgliedsbeitraege" },
  ],
};

// ---------- Apply to MvrState ----------
function apply(state: MvrState, rows: ParsedRow[]): { next: MvrState; applied: number; ignored: number; pruefen: number } {
  const next: MvrState = JSON.parse(JSON.stringify(state));
  let applied = 0, ignored = 0, pruefen = 0;
  for (const r of rows) {
    const v = Math.abs(r.betrag) || 0;
    if (r.target === "ignore") { ignored++; continue; }
    if (r.target === "pruefen") { pruefen++; continue; }
    if (r.target.startsWith("bm.")) {
      const k = r.target.slice(3) as "personal" | "miete" | "energie" | "sonstige";
      next.betriebsmittel[k] = (next.betriebsmittel[k] || 0) + v;
    } else if (r.target.startsWith("v.")) {
      const k = r.target.slice(2) as "bank" | "kasse" | "forderungenKurz" | "forderungenLang" | "verbindlichkeiten" | "darlehen" | "rueckstellungen";
      next.vermoegen[k] = (next.vermoegen[k] || 0) + v;
    } else if (r.target === "anlNutz") {
      next.verwendung.anlagevermoegenNutzungsgebunden += v;
    } else if (r.target === "anlSonst") {
      next.verwendung.anlagevermoegenSonstiges += v;
    } else if (r.target === "darlehen") {
      next.verwendung.darlehen += v;
    } else if (r.target === "sonstigeVerw") {
      next.verwendung.sonstige += v;
    } else if (r.target === "ausgIdeell" || r.target === "ausgZweckbetrieb" || r.target === "ausgVV" || r.target === "ausgWgB" || r.target === "mittelweitergabe") {
      next.verwendung[r.target] += v;
    } else {
      const k = r.target as "spenden" | "mitgliedsbeitraege" | "zuschuesse" | "ideell" | "ueberschussZweckbetrieb" | "gewinnWgB" | "ueberschussVV" | "sonstigeZeitnah";
      if (typeof next.zufluesse[k] === "number") next.zufluesse[k] = (next.zufluesse[k] as number) + v;
    }
    applied++;
  }
  return { next, applied, ignored, pruefen };
}

// ---------- Component ----------
export function MvrImport({ state, onApply }: { state: MvrState; onApply: (s: MvrState) => void }) {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [activeArea, setActiveArea] = useState<UploadKind>("saldenliste");
  const [busy, setBusy] = useState(false);
  const [lastApply, setLastApply] = useState<{ applied: number; ignored: number; pruefen: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setBusy(true);
    try {
      const parsed = await readFile(file, activeArea);
      setRows((prev) => [...prev, ...parsed]);
    } catch (e) {
      alert("Datei konnte nicht gelesen werden: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const loadDemo = () => setRows((prev) => [...prev, ...DEMO[activeArea]]);

  const updateRow = (id: string, patch: Partial<ParsedRow>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const remove = (id: string) => setRows((rs) => rs.filter((r) => r.id !== id));

  const reAuto = () =>
    setRows((rs) => rs.map((r) => {
      const am = autoMap(r.bezeichnung || r.konto);
      return { ...r, target: am.target, note: am.note };
    }));

  const summary = useMemo(() => {
    const spheres = new Set<string>();
    const rls = rows.filter((r) => r.target.startsWith("bm.") || r.note?.toLowerCase().includes("rücklage"));
    const pruefen = rows.filter((r) => r.target === "pruefen").length;
    const warn = rows.filter((r) => r.note?.toLowerCase().includes("prüfpflichtig") || r.note?.toLowerCase().includes("separat")).length;
    rows.forEach((r) => r.sphaere && spheres.add(r.sphaere));
    rows.forEach((r) => {
      if (r.target === "ueberschussVV") spheres.add("Vermögensverwaltung");
      if (r.target === "gewinnWgB") spheres.add("wGB");
      if (r.target === "ueberschussZweckbetrieb") spheres.add("Zweckbetrieb");
      if (r.target === "spenden" || r.target === "mitgliedsbeitraege" || r.target === "ausgIdeell") spheres.add("Ideeller Bereich");
    });
    return { total: rows.length, spheres: [...spheres], ruecklagen: rls.length, pruefen, warn };
  }, [rows]);

  const doApply = () => {
    const { next, applied, ignored, pruefen } = apply(state, rows);
    onApply(next);
    setLastApply({ applied, ignored, pruefen });
  };

  return (
    <div className="space-y-5">
      {/* Upload-Bereiche */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-card-soft">
        <div className="mb-4 flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4 text-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Daten importieren</h3>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">
          Wählen Sie einen Bereich, laden Sie eine Datei (.xlsx, .csv, .txt) hoch oder fügen Sie Beispieldaten ein.
          Die App erkennt Spalten automatisch (Konto, Bezeichnung, Betrag/Soll/Haben/Saldo, Sphäre) und schlägt
          eine Zuordnung vor.
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {UPLOAD_AREAS.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setActiveArea(a.id)}
              className={`rounded-xl border p-3 text-left transition ${
                activeArea === a.id
                  ? "border-foreground/40 bg-background shadow-sm"
                  : "border-border bg-background/50 hover:border-foreground/30"
              }`}
            >
              <div className="text-sm font-medium text-foreground">{a.title}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">{a.hint}</div>
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Input
            ref={fileRef}
            type="file"
            accept=".xlsx,.csv,.txt"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); }}
            className="max-w-xs"
            disabled={busy}
          />
          <Button variant="outline" size="sm" onClick={loadDemo}>
            <Upload className="mr-1 h-3 w-3" /> Beispieldaten laden
          </Button>
          {rows.length > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={reAuto}>
                <Wand2 className="mr-1 h-3 w-3" /> Auto-Zuordnung erneut anwenden
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setRows([])}>
                <Trash2 className="mr-1 h-3 w-3" /> Alles entfernen
              </Button>
            </>
          )}
        </div>
      </section>

      {/* Vorschau */}
      {rows.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-card-soft">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">Vorschau & Spalten-Zuordnung</h3>
            <span className="ml-auto text-xs text-muted-foreground">{rows.length} Zeile(n)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-secondary text-secondary-foreground">
                <tr>
                  {["Quelle", "Konto", "Bezeichnung", "Betrag", "Soll", "Haben", "Saldo", "Sphäre", "Zielkategorie", "Hinweis", ""].map((h) => (
                    <th key={h} className="px-2 py-2 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r) => (
                  <tr key={r.id} className="align-top">
                    <td className="px-2 py-1 text-[10px] uppercase text-muted-foreground">{r.source}</td>
                    <td className="px-2 py-1">{r.konto}</td>
                    <td className="px-2 py-1">
                      <Input value={r.bezeichnung} onChange={(e) => updateRow(r.id, { bezeichnung: e.target.value })} className="h-7 w-48 text-xs" />
                    </td>
                    <td className="px-2 py-1">
                      <Input type="number" value={r.betrag} onChange={(e) => updateRow(r.id, { betrag: Number(e.target.value) || 0 })} className="h-7 w-24 text-xs" />
                    </td>
                    <td className="px-2 py-1 text-muted-foreground">{r.soll ?? ""}</td>
                    <td className="px-2 py-1 text-muted-foreground">{r.haben ?? ""}</td>
                    <td className="px-2 py-1 text-muted-foreground">{r.saldo ?? ""}</td>
                    <td className="px-2 py-1 text-muted-foreground">{r.sphaere ?? ""}</td>
                    <td className="px-2 py-1">
                      <select
                        value={r.target}
                        onChange={(e) => updateRow(r.id, { target: e.target.value as TargetValue })}
                        className="h-7 max-w-[220px] rounded border border-input bg-transparent px-1 text-xs"
                      >
                        {TARGETS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-1 text-[11px] text-amber-700">{r.note ?? ""}</td>
                    <td className="px-2 py-1">
                      <Button variant="ghost" size="sm" onClick={() => remove(r.id)}><Trash2 className="h-3 w-3" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
            <Stat icon={CheckCircle2} label="Importierte Zeilen" value={summary.total} />
            <Stat icon={Info} label="Sphären" value={summary.spheres.length} />
            <Stat icon={Info} label="Rücklagen-Hinweise" value={summary.ruecklagen} />
            <Stat icon={AlertTriangle} label="Nicht zuordenbar" value={summary.pruefen} tone="warn" />
            <Stat icon={AlertTriangle} label="Warnhinweise" value={summary.warn} tone="warn" />
          </div>
          {summary.spheres.length > 0 && (
            <div className="mt-2 text-[11px] text-muted-foreground">
              Erkannte Sphären: {summary.spheres.join(", ")}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button onClick={doApply}>
              <ArrowRightCircle className="mr-1 h-4 w-4" /> In Mittelverwendungsrechner übernehmen
            </Button>
            {lastApply && (
              <span className="text-xs text-emerald-700">
                Übernommen: {lastApply.applied} · ignoriert: {lastApply.ignored} · zur Prüfung: {lastApply.pruefen}
              </span>
            )}
          </div>
          <p className="mt-3 text-[11px] italic text-muted-foreground">
            Werte werden in die jeweiligen Felder der Mittelverwendungsrechnung addiert. Vor Abschluss bitte fachlich prüfen — insbesondere Sphärenzuordnung, Rücklagengründe und Darlehensvergaben.
          </p>
        </section>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone = "info" }: { icon: typeof CheckCircle2; label: string; value: number; tone?: "info" | "warn" }) {
  const cls = tone === "warn" ? "border-amber-200 bg-amber-50 text-amber-900" : "border-border bg-background text-foreground";
  return (
    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${cls}`}>
      <Icon className="h-4 w-4" />
      <div>
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="text-sm font-semibold">{value}</div>
      </div>
    </div>
  );
}
