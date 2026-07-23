import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  Copy,
  Download,
  AlertTriangle,
  Info,
  Car,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  calculateKfz as calc,
  type CostRow,
  type Nachweis,
  type Vehicle,
} from "@/lib/kfzWertabgabe";
import {
  createKfzWorkpaper,
  deliverKfzWorkpaper,
  getKfzWorkpaperErrors,
} from "@/lib/kfzWertabgabeExcel";

export const Route = createFileRoute("/kfz-wertabgabe")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Kfz-Wertabgaben-Rechner · steuerstoff" },
      {
        name: "description",
        content:
          "Unentgeltliche Wertabgabe Kfz nach 1-%-Methode: Fahrten Wohnung/Betrieb, USt-Aufteilung (Konto 8921/8924) und Kostendeckelung berechnen.",
      },
    ],
  }),
});

const fmtEUR = (n: number | null | undefined) =>
  n == null || !Number.isFinite(n)
    ? "nicht angegeben"
    : n.toLocaleString("de-DE", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
const fmtNum = (n: number | null | undefined, d = 2) =>
  n == null || !Number.isFinite(n)
    ? "nicht angegeben"
    : n.toLocaleString("de-DE", { minimumFractionDigits: d, maximumFractionDigits: d });

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const COST_DEFS: { key: string; label: string; hint?: string }[] = [
  { key: "afa", label: "Abschreibungen (Steuerrecht)" },
  { key: "leasing", label: "Leasingzahlungen / Raten / Sonderzahlungen" },
  { key: "zinsen", label: "Schuldzinsen", hint: "regelmäßig ohne Vorsteuer prüfen" },
  { key: "kfzst", label: "Kfz-Steuer", hint: "regelmäßig ohne Vorsteuer" },
  { key: "vers", label: "Kfz-Versicherung", hint: "regelmäßig ohne Vorsteuer" },
  {
    key: "kraft",
    label: "Kraftstoff",
    hint: "regelmäßig mit Vorsteuer, sofern ordnungsgemäße Rechnung vorliegt",
  },
  { key: "pflege", label: "Wagenpflege / Öl", hint: "regelmäßig mit Vorsteuer" },
  { key: "rep", label: "Reparaturen", hint: "regelmäßig mit Vorsteuer" },
  {
    key: "verse",
    label: "Versicherungsentschädigungen (-)",
    hint: "als negativer Betrag erfassen",
  },
  { key: "garage", label: "Garagenmiete" },
  { key: "sonst", label: "Sonstige Kosten" },
];

function emptyCosts(): CostRow[] {
  return COST_DEFS.map((c) => ({
    key: c.key,
    label: c.label,
    hint: c.hint,
    totalNet: "",
    withoutVat: "",
  }));
}
function emptyVehicle(): Vehicle {
  return {
    id: uid(),
    bez: "",
    kennz: "",
    fuehrer: "",
    anschaffung: "",
    yearInput: "2026",
    blpInput: "",
    monateInput: "",
    distanceInput: "",
    workdaysInput: "",
    vatPrivateShareInput: "50",
    nachweis: "ja",
    costs: emptyCosts(),
  };
}

const REVIEW =
  "Diese Berechnung ist eine Arbeitshilfe und ersetzt keine fachliche Prüfung. Bitte insbesondere Bruttolistenpreis, Nutzungsmonate, Fahrten Wohnung/Betrieb, Vorsteueranteile und DATEV-Buchungen prüfen.";

function buildExport(vehicles: Vehicle[]): string {
  const lines: string[] = [];
  lines.push("Kfz-Wertabgaben-Rechner — Arbeitspapier");
  lines.push("=".repeat(48));
  let sum8921Base = 0,
    sum8921Vat = 0,
    sum8924 = 0,
    sumCommute = 0,
    sumTotal = 0;
  vehicles.forEach((v, i) => {
    const c = calc(v);
    lines.push("");
    lines.push(
      `Fahrzeug ${i + 1}: ${v.bez || "(ohne Bezeichnung)"} ${v.kennz ? "[" + v.kennz + "]" : ""}`.trim(),
    );
    lines.push("-".repeat(48));
    lines.push("1) Fahrzeugdaten");
    lines.push(`  Führer: ${v.fuehrer || "—"}  Anschaffung: ${v.anschaffung || "—"}`);
    lines.push(`  Veranlagungsjahr: ${c.taxYear ?? "nicht angegeben"}`);
    lines.push(`  Bruttolistenpreis (abgerundet): ${fmtEUR(c.roundedListPrice)}`);
    lines.push(
      `  Nutzungsmonate: ${fmtNum(c.months, 0)}  Entfernung: ${fmtNum(c.distanceKm, 0)} km  Arbeitstage: ${fmtNum(c.workdays, 0)}`,
    );
    lines.push(`  Nachweis > 50 %: ${v.nachweis}`);
    lines.push("2) 1-%-Methode (Privatfahrten)");
    lines.push(`  1-%-Wert: ${fmtEUR(c.onePercentValue)}`);
    lines.push(`  20-%-Abschlag: ${fmtEUR(c.nonVatDeduction20)}`);
    lines.push(`  BMG vor Deckel: ${fmtEUR(c.vatBaseBeforeCap)}`);
    lines.push(`  USt 19 % vor Deckel: ${fmtEUR(c.vatBeforeCap)}`);
    lines.push("3) Fahrten Wohnung/Betrieb");
    lines.push(`  0,03-%-Wert: ${fmtEUR(c.commuteValue)}`);
    lines.push(
      `  Entfernungspauschale (${c.distanceAllowanceRateLabel}): ${fmtEUR(c.nonDeductibleCommuteExpense)}`,
    );
    lines.push(`  Positive Korrektur Fahrten W/B: ${fmtEUR(c.commuteCorrection)}`);
    lines.push("4) Ertragsteuerliche Kostendeckelung");
    lines.push(`  Gesamtfahrzeugkosten netto: ${fmtEUR(c.totalVehicleCostsNet)}`);
    lines.push(`  nicht mit Vorsteuer belastet: ${fmtEUR(c.nonVatVehicleCosts)}`);
    lines.push(`  mit Vorsteuer belastet netto: ${fmtEUR(c.vatVehicleCostsNet)}`);
    lines.push(`  Pauschale Wertansätze (1 % + 0,03 %): ${fmtEUR(c.pauschalIncomeTaxValues)}`);
    lines.push(
      `  Kostendeckelung greift: ${c.costCapApplies == null ? "nicht prüfbar" : c.costCapApplies ? "ja" : "nein"}`,
    );
    lines.push(
      `  Ertragsteuerliche Korrektur nach Deckelung: ${fmtEUR(c.incomeTaxCorrectionAfterCap)}`,
    );
    lines.push("5) Umsatzsteuer und DATEV-Buchungswerte");
    lines.push(
      `  USt-Methode: ${
        c.costCapApplies
          ? `sachgerechte Schätzung mit ${fmtNum(c.vatPrivateSharePercent)} % Privatanteil`
          : "1-%-Methode mit 20-%-Abschlag"
      }`,
    );
    if (c.costCapApplies) lines.push(`  BMG aus USt-Schätzung: ${fmtEUR(c.vatBaseByEstimate)}`);
    lines.push(`  ⇨ 8921 0 BMG: ${fmtEUR(c.vatBase8921)}`);
    lines.push(`  ⇨ 8921 0 USt 19 %: ${fmtEUR(c.vatDue)}`);
    lines.push(`  ⇨ 8924 0 Betrag: ${fmtEUR(c.amount8924)}`);
    lines.push(`  Gesamtwert vor Deckel: ${fmtEUR(c.totalBeforeCap)}`);
    lines.push(`  Gesamtwert nach Deckel: ${fmtEUR(c.totalAfterCap)}`);
    if (c.warnings.length) {
      lines.push("6) Warnhinweise");
      c.warnings.forEach((w) => lines.push(`  - ${w}`));
    }
    sum8921Base += c.vatBase8921 ?? 0;
    sum8921Vat += c.vatDue ?? 0;
    sum8924 += c.amount8924 ?? 0;
    sumCommute += c.commuteCorrection ?? 0;
    sumTotal += c.totalAfterCap ?? 0;
  });
  if (vehicles.length > 1) {
    lines.push("");
    lines.push("Gesamtsummen");
    lines.push("-".repeat(48));
    lines.push(`  Summe BMG ⇨ 8921 0: ${fmtEUR(sum8921Base)}`);
    lines.push(`  Summe USt 19 %: ${fmtEUR(sum8921Vat)}`);
    lines.push(`  Summe ⇨ 8924 0: ${fmtEUR(sum8924)}`);
    lines.push(`  Summe Fahrten W/B: ${fmtEUR(sumCommute)}`);
    lines.push(`  Gesamte private Kfz-Nutzung: ${fmtEUR(sumTotal)}`);
  }
  lines.push("");
  lines.push("Review-Hinweis");
  lines.push(REVIEW);
  return lines.join("\n");
}

// ---------- UI helpers ----------
function NumInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
}: {
  value: string;
  onChange: (s: string) => void;
  placeholder?: string;
  ariaLabel?: string;
}) {
  return (
    <Input
      type="text"
      inputMode="decimal"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={ariaLabel}
      className="bg-[hsl(38_60%_96%)] border-[hsl(32_50%_82%)] focus-visible:ring-[hsl(28_80%_55%)]"
    />
  );
}
function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (s: string) => void;
  placeholder?: string;
}) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="bg-[hsl(38_60%_96%)] border-[hsl(32_50%_82%)] focus-visible:ring-[hsl(28_80%_55%)]"
    />
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="block text-xs font-medium text-foreground/70 mb-1">{children}</span>;
}

function SectionTitle({ no, children }: { no: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2 border-b border-border pb-2">
      <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-foreground/90 px-1.5 text-[11px] font-semibold text-background">
        {no}
      </span>
      <h3 className="text-sm font-semibold text-foreground underline decoration-2 underline-offset-4">
        {children}
      </h3>
    </div>
  );
}

function ResultRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div
      className={`flex items-baseline justify-between gap-3 border-b border-dashed border-border/70 py-1.5 text-sm ${strong ? "font-semibold text-foreground" : "text-foreground/85"}`}
    >
      <span className="text-foreground/70">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

// ---------- Page ----------
function Page() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([emptyVehicle()]);
  const [excelStatus, setExcelStatus] = useState<"idle" | "creating" | "success" | "error">("idle");
  const [excelMessage, setExcelMessage] = useState("");

  const update = (id: string, patch: Partial<Vehicle>) =>
    setVehicles((vs) => vs.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  const updateCost = (vid: string, key: string, patch: Partial<CostRow>) =>
    setVehicles((vs) =>
      vs.map((v) =>
        v.id === vid
          ? { ...v, costs: v.costs.map((c) => (c.key === key ? { ...c, ...patch } : c)) }
          : v,
      ),
    );
  const add = () => setVehicles((vs) => [...vs, emptyVehicle()]);
  const remove = (id: string) =>
    setVehicles((vs) => (vs.length > 1 ? vs.filter((v) => v.id !== id) : vs));

  const totals = useMemo(() => {
    let b = 0,
      vat = 0,
      a8924 = 0,
      commute = 0,
      tot = 0;
    vehicles.forEach((v) => {
      const c = calc(v);
      b += c.vatBase8921 ?? 0;
      vat += c.vatDue ?? 0;
      a8924 += c.amount8924 ?? 0;
      commute += c.commuteCorrection ?? 0;
      tot += c.totalAfterCap ?? 0;
    });
    return { b, vat, a8924, commute, tot };
  }, [vehicles]);
  const workpaperErrors = useMemo(() => getKfzWorkpaperErrors(vehicles), [vehicles]);
  const workpaperReady = workpaperErrors.length === 0;

  useEffect(() => {
    setExcelStatus("idle");
    setExcelMessage("");
  }, [vehicles]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildExport(vehicles));
    } catch {
      /* ignore */
    }
  };
  const onDownload = () => {
    const blob = new Blob([buildExport(vehicles)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kfz-wertabgabe-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const onSendPruefnotiz = () => {
    try {
      sessionStorage.setItem("steuerstoff:pruefnotiz", buildExport(vehicles));
    } catch {
      /* ignore */
    }
    window.location.href = "/neue-anfrage";
  };
  const onDownloadExcel = async () => {
    if (!workpaperReady) return;
    setExcelStatus("creating");
    setExcelMessage("");
    try {
      const workpaper = await createKfzWorkpaper(vehicles);
      const delivery = await deliverKfzWorkpaper(workpaper.bytes, workpaper.fileName);
      setExcelStatus("success");
      setExcelMessage(
        delivery.shared
          ? "Excel-Arbeitspapier wurde zum Teilen geöffnet."
          : "Excel-Arbeitspapier wurde heruntergeladen.",
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setExcelStatus("idle");
        return;
      }
      setExcelStatus("error");
      setExcelMessage(
        error instanceof Error
          ? error.message
          : "Das Excel-Arbeitspapier konnte nicht erstellt werden.",
      );
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border/60 bg-card/40">
          <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Car className="h-3.5 w-3.5" />
              <span>DATEV · Umsatzsteuer · ⇨ 8921 0 / ⇨ 8924 0</span>
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Kfz-Wertabgaben-Rechner
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              1-%-Methode, Fahrten Wohnung/Betrieb (0,03 %), 20-%-Abschlag, USt-Aufteilung und
              Kostendeckelung — strukturiert wie ein Arbeitspapier.
            </p>
          </div>
        </section>

        <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6">
          {vehicles.map((v, idx) => {
            const c = calc(v);
            return (
              <article
                key={v.id}
                data-no-swipe="true"
                className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6"
              >
                <header className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-base font-semibold text-foreground">{idx + 1}. Fahrzeug</h2>
                  {vehicles.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(v.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" /> entfernen
                    </Button>
                  )}
                </header>

                {/* Abschnitt 1 */}
                <SectionTitle no="1">Fahrzeugdaten</SectionTitle>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label>
                    <FieldLabel>Fahrzeug / Bezeichnung</FieldLabel>
                    <TextInput
                      value={v.bez}
                      onChange={(s) => update(v.id, { bez: s })}
                      placeholder="z. B. BMW 320d"
                    />
                  </label>
                  <label>
                    <FieldLabel>PKW-Kennzeichen</FieldLabel>
                    <TextInput
                      value={v.kennz}
                      onChange={(s) => update(v.id, { kennz: s })}
                      placeholder="z. B. B-AB 1234"
                    />
                  </label>
                  <label>
                    <FieldLabel>Fahrzeugführer</FieldLabel>
                    <TextInput
                      value={v.fuehrer}
                      onChange={(s) => update(v.id, { fuehrer: s })}
                      placeholder="z. B. Max Mustermann"
                    />
                  </label>
                  <label>
                    <FieldLabel>Anschaffungsdatum</FieldLabel>
                    <TextInput
                      value={v.anschaffung}
                      onChange={(s) => update(v.id, { anschaffung: s })}
                      placeholder="TT.MM.JJJJ"
                    />
                  </label>
                  <label>
                    <FieldLabel>Veranlagungsjahr</FieldLabel>
                    <NumInput
                      value={v.yearInput}
                      onChange={(s) => update(v.id, { yearInput: s })}
                      placeholder="z. B. 2026"
                      ariaLabel="Veranlagungsjahr"
                    />
                  </label>
                  <label>
                    <FieldLabel>Bruttolistenpreis (€) — wird auf volle 100 € abgerundet</FieldLabel>
                    <NumInput
                      value={v.blpInput}
                      onChange={(s) => update(v.id, { blpInput: s })}
                      placeholder="z. B. 50.000"
                    />
                    {c.roundedListPrice != null && (
                      <span className="mt-1 block text-[11px] text-muted-foreground">
                        abgerundet: {fmtEUR(c.roundedListPrice)}
                      </span>
                    )}
                  </label>
                  <label>
                    <FieldLabel>Anzahl Nutzungsmonate</FieldLabel>
                    <NumInput
                      value={v.monateInput}
                      onChange={(s) => update(v.id, { monateInput: s })}
                      placeholder="z. B. 12"
                    />
                  </label>
                  <label>
                    <FieldLabel>Entfernung Wohnung–Betrieb (km, einfach)</FieldLabel>
                    <NumInput
                      value={v.distanceInput}
                      onChange={(s) => update(v.id, { distanceInput: s })}
                      placeholder="z. B. 20"
                    />
                  </label>
                  <label>
                    <FieldLabel>Arbeitstage</FieldLabel>
                    <NumInput
                      value={v.workdaysInput}
                      onChange={(s) => update(v.id, { workdaysInput: s })}
                      placeholder="z. B. 230"
                    />
                  </label>
                  <label className="sm:col-span-2">
                    <FieldLabel>Nachweis betriebliche Nutzung &gt; 50 %</FieldLabel>
                    <select
                      value={v.nachweis}
                      onChange={(e) => update(v.id, { nachweis: e.target.value as Nachweis })}
                      className="flex h-9 w-full rounded-md border border-[hsl(32_50%_82%)] bg-[hsl(38_60%_96%)] px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1"
                    >
                      <option value="ja">ja</option>
                      <option value="nein">nein</option>
                      <option value="unklar">unklar</option>
                    </select>
                  </label>
                </div>
                <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Die 1-%-Methode setzt grundsätzlich eine betriebliche Nutzung von mehr als 50 %
                  voraus. Bitte Nachweis prüfen.
                </p>

                {/* Abschnitt 2 */}
                <div className="mt-6">
                  <SectionTitle no="2">Privatfahrten — 1-%-Methode</SectionTitle>
                  <div className="rounded-lg border border-border/70 bg-background/40 p-3">
                    <ResultRow
                      label="1-%-Wert (BLP × 1 % × Monate)"
                      value={fmtEUR(c.onePercentValue)}
                    />
                    <ResultRow
                      label="20-%-Abschlag nicht vorsteuerbelastet"
                      value={fmtEUR(c.nonVatDeduction20)}
                    />
                    <ResultRow
                      label="BMG USt vor Kostendeckelung"
                      value={fmtEUR(c.vatBaseBeforeCap)}
                      strong
                    />
                    <ResultRow
                      label="USt 19 % vor Kostendeckelung"
                      value={fmtEUR(c.vatBeforeCap)}
                    />
                  </div>
                </div>

                {/* Abschnitt 3 */}
                <div className="mt-6">
                  <SectionTitle no="3">Fahrten Wohnung / Betrieb</SectionTitle>
                  <div className="rounded-lg border border-border/70 bg-background/40 p-3">
                    <ResultRow
                      label="0,03 % × BLP × Entfernung × Monate"
                      value={fmtEUR(c.commuteValue)}
                    />
                    <ResultRow
                      label={`./. Entfernungspauschale (${c.distanceAllowanceRateLabel})`}
                      value={fmtEUR(c.nonDeductibleCommuteExpense)}
                    />
                    <ResultRow
                      label="Positive Korrektur Fahrten W/B"
                      value={fmtEUR(c.commuteCorrection)}
                      strong
                    />
                  </div>
                </div>

                {/* Abschnitt 4 */}
                <div className="mt-6">
                  <SectionTitle no="4">Kfz-Kostendeckelung</SectionTitle>
                  <div className="overflow-x-auto rounded-lg border border-border/70">
                    <table className="w-full text-xs sm:text-sm">
                      <thead className="bg-foreground/5 text-left text-foreground/70">
                        <tr>
                          <th className="px-2 py-2 font-medium">Kostenart</th>
                          <th className="px-2 py-2 font-medium">Gesamt netto (€)</th>
                          <th className="px-2 py-2 font-medium">davon ohne VSt (€)</th>
                          <th className="hidden px-2 py-2 font-medium md:table-cell">Hinweis</th>
                        </tr>
                      </thead>
                      <tbody>
                        {v.costs.map((row) => (
                          <tr key={row.key} className="border-t border-border/60">
                            <td className="px-2 py-1.5 align-middle">{row.label}</td>
                            <td className="px-2 py-1.5">
                              <NumInput
                                value={row.totalNet}
                                onChange={(s) => updateCost(v.id, row.key, { totalNet: s })}
                                placeholder="z. B. 1.200,00"
                                ariaLabel={`${row.label} gesamt netto`}
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <NumInput
                                value={row.withoutVat}
                                onChange={(s) => updateCost(v.id, row.key, { withoutVat: s })}
                                placeholder="z. B. 0,00"
                                ariaLabel={`${row.label} ohne Vorsteuer`}
                              />
                            </td>
                            <td className="hidden px-2 py-1.5 text-[11px] text-muted-foreground md:table-cell">
                              {row.hint ?? ""}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Parkgebühren nicht erfassen — gehören zu Reisekosten.
                  </p>
                  <div className="mt-3 rounded-lg border border-border/70 bg-background/40 p-3">
                    <ResultRow
                      label="Gesamtfahrzeugkosten netto"
                      value={fmtEUR(c.totalVehicleCostsNet)}
                    />
                    <ResultRow
                      label="Nicht mit Vorsteuer belastet"
                      value={fmtEUR(c.nonVatVehicleCosts)}
                    />
                    <ResultRow
                      label="Mit Vorsteuer belastet (netto)"
                      value={fmtEUR(c.vatVehicleCostsNet)}
                      strong
                    />
                    <ResultRow
                      label="Pauschale Wertansätze (1 % + 0,03 %)"
                      value={fmtEUR(c.pauschalIncomeTaxValues)}
                    />
                    <ResultRow
                      label="Wertansätze nach Kostendeckelung"
                      value={fmtEUR(c.incomeTaxValuesAfterCap)}
                    />
                    <ResultRow
                      label="Ertragsteuerliche Korrektur nach Entfernungspauschale"
                      value={fmtEUR(c.incomeTaxCorrectionAfterCap)}
                      strong
                    />
                  </div>
                </div>

                {/* Abschnitt 5 */}
                <div className="mt-6">
                  <SectionTitle no="5">Prüfung der Umsatzbesteuerung</SectionTitle>
                  {c.costCapApplies === true && (
                    <label className="mb-3 block">
                      <FieldLabel>
                        Geschätzter Privatanteil für die Umsatzsteuer (%) — grundsätzlich mindestens
                        50 %
                      </FieldLabel>
                      <NumInput
                        value={v.vatPrivateShareInput}
                        onChange={(s) => update(v.id, { vatPrivateShareInput: s })}
                        placeholder="50"
                        ariaLabel="Geschätzter Privatanteil für die Umsatzsteuer"
                      />
                      <span className="mt-1 block text-[11px] text-muted-foreground">
                        Bei Kostendeckelung ist die USt-Bemessungsgrundlage sachgerecht zu schätzen.
                        Ohne geeignete Unterlagen werden mindestens 50 % angesetzt.
                      </span>
                    </label>
                  )}
                  <div className="rounded-lg border border-border/70 bg-background/40 p-3">
                    <ResultRow
                      label="BMG nach 1-%-Methode (80 %)"
                      value={fmtEUR(c.vatBaseBeforeCap)}
                    />
                    {c.costCapApplies === true && (
                      <ResultRow
                        label={`BMG aus USt-Schätzung (${fmtNum(c.vatPrivateSharePercent)} %)`}
                        value={fmtEUR(c.vatBaseByEstimate)}
                      />
                    )}
                    <ResultRow
                      label="Tatsächliche BMG ⇨ 8921 0"
                      value={fmtEUR(c.vatBase8921)}
                      strong
                    />
                    <ResultRow label="abzuführende USt 19 %" value={fmtEUR(c.vatDue)} />
                    <ResultRow
                      label="Anteil ohne USt ⇨ 8924 0"
                      value={fmtEUR(c.amount8924)}
                      strong
                    />
                  </div>
                </div>

                {/* Abschnitt 6 */}
                <div className="mt-6">
                  <SectionTitle no="6">Gesamtergebnis</SectionTitle>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-border bg-foreground/[0.03] p-3">
                      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Gesamtwert vor Kostendeckelung
                      </div>
                      <div className="text-lg font-semibold tabular-nums">
                        {fmtEUR(c.totalBeforeCap)}
                      </div>
                    </div>
                    <div className="rounded-lg border border-border bg-foreground/[0.03] p-3">
                      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Gesamtwert nach Kostendeckelung
                      </div>
                      <div className="text-lg font-semibold tabular-nums">
                        {fmtEUR(c.totalAfterCap)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Abschnitt 7 */}
                <div className="mt-6">
                  <SectionTitle no="7">DATEV-Buchungshinweise</SectionTitle>
                  <div className="space-y-2 text-sm">
                    <div className="rounded-lg border border-border/70 bg-background/40 p-3">
                      <div className="font-medium">
                        ⇨ 8921 0 — Unentgeltliche Wertabgaben Kfz 19 % USt
                      </div>
                      <ResultRow label="BMG" value={fmtEUR(c.vatBase8921)} />
                      <ResultRow label="abzuführende USt 19 %" value={fmtEUR(c.vatDue)} />
                    </div>
                    <div className="rounded-lg border border-border/70 bg-background/40 p-3">
                      <div className="font-medium">
                        ⇨ 8924 0 — Unentgeltliche Wertabgaben Kfz ohne USt
                      </div>
                      <ResultRow label="Betrag" value={fmtEUR(c.amount8924)} />
                    </div>
                    <div className="rounded-lg border border-dashed border-border bg-background/40 p-3 text-xs text-muted-foreground">
                      Fahrten Wohnung/Betrieb: außerbilanzielle Korrektur gemäß Berechnung buchen
                      per <strong>⇨4679 0 an ⇨4680 0</strong>.
                    </div>
                  </div>
                </div>

                {/* Abschnitt 8 */}
                {c.warnings.length > 0 && (
                  <div className="mt-6">
                    <SectionTitle no="8">Warnhinweise / Review</SectionTitle>
                    <ul className="space-y-1.5 text-sm">
                      {c.warnings.map((w, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-amber-900"
                        >
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            );
          })}

          <div className="flex flex-wrap gap-2">
            <Button onClick={add} variant="outline">
              <Plus className="h-4 w-4" /> Weiteres Fahrzeug hinzufügen
            </Button>
          </div>

          {vehicles.length > 1 && (
            <article className="rounded-2xl border border-border bg-card p-4 sm:p-6">
              <h2 className="mb-3 text-base font-semibold">Gesamtsummen aller Fahrzeuge</h2>
              <ResultRow label="Summe BMG ⇨ 8921 0" value={fmtEUR(totals.b)} />
              <ResultRow label="Summe USt 19 %" value={fmtEUR(totals.vat)} />
              <ResultRow label="Summe ⇨ 8924 0" value={fmtEUR(totals.a8924)} />
              <ResultRow label="Summe Fahrten W/B" value={fmtEUR(totals.commute)} />
              <ResultRow label="Gesamte private Kfz-Nutzung" value={fmtEUR(totals.tot)} strong />
            </article>
          )}

          <article className="rounded-2xl border border-border bg-card p-4 sm:p-6">
            <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
              <FileText className="h-4 w-4" /> Export
            </h2>
            {workpaperReady ? (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-950">
                <div className="mb-3 flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                  <div>
                    <div className="font-medium">Berechnung vollständig</div>
                    <p className="mt-0.5 text-xs text-emerald-800">
                      Das Excel-Arbeitspapier enthält eine Übersicht und ein detailliertes
                      Berechnungsblatt je Fahrzeug.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={onDownloadExcel}
                  disabled={excelStatus === "creating"}
                  className="w-full bg-emerald-700 text-white hover:bg-emerald-800 sm:w-auto"
                >
                  {excelStatus === "creating" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="h-4 w-4" />
                  )}
                  {excelStatus === "creating"
                    ? "Excel wird erstellt …"
                    : "Excel-Arbeitspapier herunterladen"}
                </Button>
                {excelMessage && (
                  <p
                    role="status"
                    className={`mt-2 text-xs ${
                      excelStatus === "error" ? "text-destructive" : "text-emerald-800"
                    }`}
                  >
                    {excelMessage}
                  </p>
                )}
              </div>
            ) : (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-950">
                <div className="flex items-start gap-2">
                  <FileSpreadsheet className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                  <div>
                    <div className="text-sm font-medium">
                      Excel ist nach vollständiger Eingabe verfügbar
                    </div>
                    <ul className="mt-1 space-y-0.5 text-xs text-amber-800">
                      {workpaperErrors.slice(0, 3).map((error) => (
                        <li key={error}>{error}</li>
                      ))}
                      {workpaperErrors.length > 3 && (
                        <li>Weitere {workpaperErrors.length - 3} Angaben fehlen.</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button onClick={onCopy} variant="outline">
                <Copy className="h-4 w-4" /> Text kopieren
              </Button>
              <Button onClick={onSendPruefnotiz} variant="outline">
                Als Prüfnotiz verwenden
              </Button>
              <Button onClick={onDownload} variant="outline">
                <Download className="h-4 w-4" /> Export .txt
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{REVIEW}</p>
          </article>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
