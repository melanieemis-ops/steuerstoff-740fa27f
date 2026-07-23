import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Car,
  CheckCircle2,
  Copy,
  Download,
  FileSpreadsheet,
  FileText,
  Info,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import {
  calculateKfz as calc,
  parseDe,
  type CostRow,
  type ElectricBenefitType,
  type Nachweis,
  type VatEvidence,
  type Vehicle,
  type VehicleType,
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
          "Unentgeltliche Wertabgabe Kfz nach der 1-%-Methode für Verbrenner, Elektro- und Plug-in-Hybridfahrzeuge mit Ertragsteuer, Umsatzsteuer, Kostendeckelung und DATEV-Werten.",
      },
    ],
  }),
});

const INPUT_CLASS =
  "h-10 bg-[hsl(38_60%_96%)] border-[hsl(32_50%_82%)] focus-visible:ring-[hsl(28_80%_55%)]";
const SELECT_CLASS =
  "flex h-10 w-full rounded-md border border-[hsl(32_50%_82%)] bg-[hsl(38_60%_96%)] px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(28_80%_55%)]";

const fmtEUR = (value: number | null | undefined) =>
  value == null || !Number.isFinite(value)
    ? "nicht berechenbar"
    : value.toLocaleString("de-DE", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

const fmtNum = (value: number | null | undefined, digits = 2) =>
  value == null || !Number.isFinite(value)
    ? "nicht angegeben"
    : value.toLocaleString("de-DE", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      });

const addNullable = (sum: number | null, value: number | null) =>
  sum == null || value == null ? null : sum + value;

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const COST_DEFS: { key: string; label: string; hint?: string }[] = [
  { key: "afa", label: "Abschreibung nach Steuerrecht" },
  { key: "leasing", label: "Leasingzahlungen" },
  { key: "miete", label: "Mietzahlungen" },
  { key: "leasingsonderzahlung", label: "Leasingsonderzahlungen" },
  { key: "zinsen", label: "Schuldzinsen", hint: "regelmäßig ohne Vorsteuer prüfen" },
  { key: "kfzst", label: "Kfz-Steuer", hint: "regelmäßig ohne Vorsteuer" },
  { key: "vers", label: "Kfz-Versicherung", hint: "regelmäßig ohne Vorsteuer" },
  {
    key: "kraft",
    label: "Kraftstoff",
    hint: "regelmäßig mit Vorsteuer bei ordnungsgemäßer Rechnung",
  },
  { key: "ladestrom", label: "Ladestrom", hint: "Vorsteuerabzug und Nachweis prüfen" },
  { key: "pflege", label: "Wagenpflege", hint: "regelmäßig mit Vorsteuer" },
  { key: "oel", label: "Öl", hint: "regelmäßig mit Vorsteuer" },
  { key: "rep", label: "Reparaturen", hint: "regelmäßig mit Vorsteuer" },
  { key: "wartung", label: "Wartungen", hint: "regelmäßig mit Vorsteuer" },
  {
    key: "verse",
    label: "Versicherungsentschädigungen (-)",
    hint: "als negativen Betrag erfassen",
  },
  { key: "garage", label: "Garagenmiete" },
  { key: "sonst", label: "Sonstige Fahrzeugkosten" },
];

function emptyCosts(): CostRow[] {
  return COST_DEFS.map((definition) => ({
    ...definition,
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
    firstRegistration: "",
    yearInput: "2026",
    blpInput: "",
    monateInput: "",
    distanceInput: "",
    workdaysInput: "",
    vehicleType: "combustion",
    co2Input: "",
    electricRangeInput: "",
    batteryCapacityInput: "",
    vehicleCode: "",
    classificationNote: "",
    vatEvidence: "nein",
    vatPrivateShareInput: "",
    nachweis: "ja",
    costs: emptyCosts(),
  };
}

const REVIEW =
  "Rechtsstand 2026. Diese Berechnung ist eine Arbeitshilfe und ersetzt keine fachliche Prüfung. Insbesondere Fahrzeugunterlagen, Begünstigung, Kostendeckelung, Vorsteueraufteilung und DATEV-Buchungsvorschläge sind im Einzelfall zu prüfen.";

const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  combustion: "Verbrenner / sonstiges Fahrzeug",
  electric: "Reines Elektrofahrzeug",
  "plugin-hybrid": "Extern aufladbares Hybridelektrofahrzeug",
};

const BENEFIT_LABELS: Record<ElectricBenefitType, string> = {
  none: "100-%-Ansatz / keine Begünstigung",
  half: "50-%-Ansatz",
  quarter: "25-%-Ansatz",
  "battery-deduction": "Pauschaler Batterieabschlag",
};

function buildExport(vehicles: Vehicle[]): string {
  const lines = ["Kfz-Wertabgaben-Rechner — Arbeitspapier", "Rechtsstand 2026", "=".repeat(64)];
  let sum8921Base: number | null = 0;
  let sum8921Vat: number | null = 0;
  let sum8924: number | null = 0;
  let sumCommute: number | null = 0;
  let sumTotal: number | null = 0;

  vehicles.forEach((vehicle, index) => {
    const result = calc(vehicle);
    const hasCostInput = vehicle.costs.some(
      (cost) => cost.totalNet.trim() !== "" || cost.withoutVat.trim() !== "",
    );
    const fmtEnteredCost = (value: number | null) =>
      hasCostInput ? fmtEUR(value) : "nicht angegeben";
    lines.push(
      "",
      `Fahrzeug ${index + 1}: ${vehicle.bez || "(ohne Bezeichnung)"}${
        vehicle.kennz ? ` [${vehicle.kennz}]` : ""
      }`,
      "-".repeat(64),
      "1) Fahrzeugdaten",
      `  Fahrzeugart: ${VEHICLE_TYPE_LABELS[result.vehicleType]}`,
      `  Fahrzeugführer: ${vehicle.fuehrer || "—"}`,
      `  Anschaffung / Übernahme: ${vehicle.anschaffung || "—"}`,
      `  Erstzulassung: ${vehicle.firstRegistration || "—"}`,
      `  Veranlagungsjahr: ${result.taxYear ?? "nicht angegeben"}`,
      `  Ursprünglicher inländischer BLP: ${fmtEUR(result.originalListPrice)}`,
      `  Nutzungsmonate: ${fmtNum(result.months, 0)}`,
      `  Einfache Entfernung: ${fmtNum(result.distanceKm, 2)} km`,
      `  Volle Entfernungskilometer: ${fmtNum(result.fullDistanceKm, 0)} km`,
      `  Tatsächliche Arbeitstage: ${fmtNum(result.workdays, 0)}`,
      `  Nachweis betriebliche Nutzung > 50 %: ${vehicle.nachweis}`,
      "",
      "2) Prüfung Elektro-/Hybridbegünstigung",
      `  Ergebnis: ${BENEFIT_LABELS[result.electricBenefit.benefitType]}`,
      `  Angewendete Vorschrift: ${result.electricBenefit.applicableRule}`,
      `  Erklärung: ${result.electricBenefit.explanation}`,
      `  CO₂-Ausstoß: ${fmtNum(parseDe(vehicle.co2Input), 2)} g/km`,
      `  Elektrische Reichweite: ${fmtNum(parseDe(vehicle.electricRangeInput), 2)} km`,
      `  Batteriekapazität: ${fmtNum(parseDe(vehicle.batteryCapacityInput), 2)} kWh`,
      `  Fahrzeugcode Feld 10: ${vehicle.vehicleCode || "—"}`,
      `  Einordnungsnotiz: ${vehicle.classificationNote || "—"}`,
      `  Kürzung in Prozent: ${fmtNum(result.electricBenefit.reductionPercent)} %`,
      `  Batterieabschlag: ${fmtEUR(result.electricBenefit.batteryDeduction)}`,
      `  Ertragsteuerlicher maßgeblicher BLP: ${fmtEUR(result.incomeTaxRelevantListPrice)}`,
      `  Umsatzsteuerlicher ungekürzter BLP: ${fmtEUR(result.vatRelevantListPrice)}`,
      "",
      "3) Privatfahrten — Ertragsteuer",
      `  Monatlicher 1-%-Wert: ${fmtEUR(result.monthlyPrivateUseIncomeTax)}`,
      `  Zeitraumwert (${fmtNum(result.months, 0)} Monate): ${fmtEUR(result.privateUseIncomeTax)}`,
      "",
      "4) Fahrten Wohnung–Betriebsstätte",
      `  0,03-%-Wert: ${fmtEUR(result.commuteValue)}`,
      `  Entfernungspauschale je Tag (${result.distanceAllowanceRateLabel}): ${fmtEUR(
        result.distanceAllowancePerDayValue,
      )}`,
      `  Abziehbare Entfernungspauschale: ${fmtEUR(result.nonDeductibleCommuteExpense)}`,
      `  Verbleibende außerbilanzielle Korrektur: ${fmtEUR(result.commuteCorrection)}`,
      "  Buchungshinweis: Außerbilanzielle Korrektur gemäß Berechnung prüfen; Zuordnung zu 4679/4680 fachlich prüfen.",
      "",
      "5) Fahrzeugkosten",
    );
    vehicle.costs.forEach((cost, costIndex) => {
      lines.push(
        `  ${cost.label}: gesamt netto ${cost.totalNet || "—"} €; davon ohne VSt ${
          cost.withoutVat || "—"
        } €; automatisch mit VSt ${fmtEUR(result.costAllocations[costIndex]?.withVat)}`,
      );
    });
    lines.push(
      `  Gesamtfahrzeugkosten netto: ${fmtEnteredCost(result.totalVehicleCostsNet)}`,
      `  Mit Vorsteuer belastet: ${fmtEnteredCost(result.vatVehicleCostsNet)}`,
      `  Ohne Vorsteuer: ${fmtEnteredCost(result.nonVatVehicleCosts)}`,
      `  Leasing/Miete mit Vorsteuer: ${fmtEnteredCost(result.leasingRentalVatCostsNet)}`,
      `  Leasing/Miete ohne Vorsteuer: ${fmtEnteredCost(result.leasingRentalNonVatCosts)}`,
      `  Übrige Kosten mit Vorsteuer: ${fmtEnteredCost(result.otherVatCostsNet)}`,
      `  Übrige Kosten ohne Vorsteuer: ${fmtEnteredCost(result.otherNonVatCosts)}`,
      "",
      "6) Ertragsteuerliche Kostendeckelung",
      `  Pauschale Wertansätze: ${fmtEUR(result.pauschalIncomeTaxValues)}`,
      `  Tatsächliche Gesamtfahrzeugkosten: ${fmtEnteredCost(result.totalVehicleCostsNet)}`,
      `  Kostendeckelung: ${
        result.costCapApplies == null ? "nicht prüfbar" : result.costCapApplies ? "ja" : "nein"
      }`,
      `  Wertansätze nach Deckelung: ${fmtEUR(result.incomeTaxValuesAfterCap)}`,
      `  Korrektur nach Entfernungspauschale: ${fmtEUR(result.incomeTaxCorrectionAfterCap)}`,
      "",
      "7) Umsatzsteuerprüfung",
      `  Ungekürzter umsatzsteuerlicher BLP: ${fmtEUR(result.vatRelevantListPrice)}`,
      `  Umsatzsteuerlicher 1-%-Wert: ${fmtEUR(result.vatOnePercentValue)}`,
      `  20-%-Abschlag: ${fmtEUR(result.vatNonInputTaxDeduction)}`,
      `  BMG vor Kostendeckelung: ${fmtEUR(result.vatBaseBeforeCap)}`,
      `  USt 19 % vor Kostendeckelung: ${fmtEUR(result.vatBeforeCap)}`,
      `  Geeignete Unterlagen vorhanden: ${result.vatEvidenceAvailable ? "ja" : "nein"}`,
      `  Geschätzter Privatanteil: ${fmtNum(result.vatPrivateSharePercent)} %`,
      `  BMG aus sachgerechter Schätzung: ${fmtEUR(result.vatBaseByEstimate)}`,
      `  USt 19 % aus sachgerechter Schätzung: ${fmtEUR(result.vatDueByEstimate)}`,
      "",
      "8) DATEV-Buchungsvorschläge — fachlich prüfen",
      `  Konto 8921 0 — BMG: ${fmtEUR(result.vatBase8921)}`,
      `  Konto 8921 0 — USt 19 %: ${fmtEUR(result.vatDue)}`,
      `  Konto 8924 0 — Anteil ohne USt: ${fmtEUR(result.amount8924)}`,
      `  Außerbilanzielle Korrektur Wohnung–Betriebsstätte: ${fmtEUR(result.commuteCorrection)}`,
      `  Gesamtwert vor Deckelung: ${fmtEUR(result.totalBeforeCap)}`,
      `  Gesamtwert nach Deckelung: ${fmtEUR(result.totalAfterCap)}`,
    );
    if (result.warnings.length) {
      lines.push("", "9) Warnhinweise und Review");
      result.warnings.forEach((warning) => lines.push(`  - ${warning}`));
    }
    sum8921Base = addNullable(sum8921Base, result.vatBase8921);
    sum8921Vat = addNullable(sum8921Vat, result.vatDue);
    sum8924 = addNullable(sum8924, result.amount8924);
    sumCommute = addNullable(sumCommute, result.commuteCorrection);
    sumTotal = addNullable(sumTotal, result.totalAfterCap);
  });

  if (vehicles.length > 1) {
    lines.push(
      "",
      "Gesamtsummen",
      "-".repeat(64),
      `  Summe BMG ⇨ 8921 0: ${fmtEUR(sum8921Base)}`,
      `  Summe USt 19 %: ${fmtEUR(sum8921Vat)}`,
      `  Summe ⇨ 8924 0: ${fmtEUR(sum8924)}`,
      `  Summe Fahrten Wohnung–Betriebsstätte: ${fmtEUR(sumCommute)}`,
      `  Gesamte private Kfz-Nutzung: ${fmtEUR(sumTotal)}`,
    );
  }
  lines.push("", "Review-Hinweis", REVIEW);
  return lines.join("\n");
}

function NumInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
}) {
  return (
    <Input
      type="text"
      inputMode="decimal"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      aria-label={ariaLabel}
      className={INPUT_CLASS}
    />
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
}) {
  return (
    <Input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      aria-label={ariaLabel}
      className={INPUT_CLASS}
    />
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="mb-1 block text-xs font-medium text-foreground/70">{children}</span>;
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
      className={`flex items-start justify-between gap-3 border-b border-dashed border-border/70 py-1.5 text-sm ${
        strong ? "font-semibold text-foreground" : "text-foreground/85"
      }`}
    >
      <span className="min-w-0 text-foreground/70">{label}</span>
      <span className="max-w-[52%] text-right tabular-nums">{value}</span>
    </div>
  );
}

function InfoBox({ summary, children }: { summary: string; children: React.ReactNode }) {
  return (
    <details className="rounded-lg border border-border/70 bg-background/40 text-xs text-muted-foreground">
      <summary className="cursor-pointer px-3 py-2 font-medium text-foreground/75">
        {summary}
      </summary>
      <div className="border-t border-border/60 px-3 py-2 leading-relaxed">{children}</div>
    </details>
  );
}

function CostInputs({
  row,
  withVat,
  onChange,
}: {
  row: CostRow;
  withVat: number | null;
  onChange: (patch: Partial<CostRow>) => void;
}) {
  return (
    <>
      <label>
        <FieldLabel>Gesamtbetrag netto (€)</FieldLabel>
        <NumInput
          value={row.totalNet}
          onChange={(value) => onChange({ totalNet: value })}
          placeholder="z. B. 1.200,00"
          ariaLabel={`${row.label} gesamt netto`}
        />
      </label>
      <label>
        <FieldLabel>Davon ohne Vorsteuer (€)</FieldLabel>
        <NumInput
          value={row.withoutVat}
          onChange={(value) => onChange({ withoutVat: value })}
          placeholder="z. B. 0,00"
          ariaLabel={`${row.label} ohne Vorsteuer`}
        />
      </label>
      <div className="flex items-center justify-between gap-3 rounded-md bg-foreground/[0.04] px-3 py-2 text-xs">
        <span className="text-muted-foreground">Automatisch mit Vorsteuer belastet</span>
        <span className="text-right font-medium tabular-nums">{fmtEUR(withVat)}</span>
      </div>
    </>
  );
}

function Page() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([emptyVehicle()]);
  const [excelStatus, setExcelStatus] = useState<"idle" | "creating" | "success" | "error">("idle");
  const [excelMessage, setExcelMessage] = useState("");

  const update = (id: string, patch: Partial<Vehicle>) =>
    setVehicles((current) =>
      current.map((vehicle) => (vehicle.id === id ? { ...vehicle, ...patch } : vehicle)),
    );
  const updateCost = (vehicleId: string, key: string, patch: Partial<CostRow>) =>
    setVehicles((current) =>
      current.map((vehicle) =>
        vehicle.id === vehicleId
          ? {
              ...vehicle,
              costs: vehicle.costs.map((cost) => (cost.key === key ? { ...cost, ...patch } : cost)),
            }
          : vehicle,
      ),
    );
  const add = () => setVehicles((current) => [...current, emptyVehicle()]);
  const remove = (id: string) =>
    setVehicles((current) =>
      current.length > 1 ? current.filter((vehicle) => vehicle.id !== id) : current,
    );

  const totals = useMemo(
    () =>
      vehicles.reduce(
        (sum, vehicle) => {
          const result = calc(vehicle);
          return {
            base8921: addNullable(sum.base8921, result.vatBase8921),
            vat: addNullable(sum.vat, result.vatDue),
            amount8924: addNullable(sum.amount8924, result.amount8924),
            commute: addNullable(sum.commute, result.commuteCorrection),
            total: addNullable(sum.total, result.totalAfterCap),
          };
        },
        {
          base8921: 0 as number | null,
          vat: 0 as number | null,
          amount8924: 0 as number | null,
          commute: 0 as number | null,
          total: 0 as number | null,
        },
      ),
    [vehicles],
  );
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
      // Browser kann Zwischenablagezugriff ablehnen.
    }
  };
  const onDownload = () => {
    const blob = new Blob([buildExport(vehicles)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `kfz-wertabgabe-${new Date().toISOString().slice(0, 10)}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const onSendPruefnotiz = () => {
    try {
      sessionStorage.setItem("steuerstoff:pruefnotiz", buildExport(vehicles));
    } catch {
      // Die Prüfnotiz kann trotzdem über die Zielseite neu erstellt werden.
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
              <span>Rechtsstand 2026 · ESt · USt · DATEV 8921 / 8924</span>
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Kfz-Wertabgaben-Rechner
            </h1>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              Vollständige Arbeitshilfe zur 1-%-Methode für Verbrenner, reine Elektrofahrzeuge und
              Plug-in-Hybride — mit getrennter Ertrag- und Umsatzsteuerberechnung.
            </p>
          </div>
        </section>

        <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 pb-24 sm:px-6 md:pb-8">
          {vehicles.map((vehicle, index) => {
            const result = calc(vehicle);
            const hasCostInput = vehicle.costs.some(
              (cost) => cost.totalNet.trim() !== "" || cost.withoutVat.trim() !== "",
            );
            const fmtEnteredCost = (value: number | null) =>
              hasCostInput ? fmtEUR(value) : "nicht angegeben";
            const vehicleType = vehicle.vehicleType ?? "combustion";
            const isElectricVehicle = vehicleType !== "combustion";
            return (
              <article
                key={vehicle.id}
                data-no-swipe="true"
                className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6"
              >
                <header className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-base font-semibold text-foreground">{index + 1}. Fahrzeug</h2>
                  {vehicles.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(vehicle.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" /> entfernen
                    </Button>
                  )}
                </header>

                <SectionTitle no="1">Fahrzeugdaten</SectionTitle>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="sm:col-span-2">
                    <FieldLabel>Fahrzeugart</FieldLabel>
                    <select
                      value={vehicleType}
                      onChange={(event) =>
                        update(vehicle.id, {
                          vehicleType: event.target.value as VehicleType,
                        })
                      }
                      className={SELECT_CLASS}
                      aria-label="Fahrzeugart"
                    >
                      {Object.entries(VEHICLE_TYPE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <FieldLabel>Fahrzeug / Bezeichnung</FieldLabel>
                    <TextInput
                      value={vehicle.bez}
                      onChange={(value) => update(vehicle.id, { bez: value })}
                      placeholder="z. B. BMW 320d"
                      ariaLabel="Fahrzeugbezeichnung"
                    />
                  </label>
                  <label>
                    <FieldLabel>PKW-Kennzeichen</FieldLabel>
                    <TextInput
                      value={vehicle.kennz}
                      onChange={(value) => update(vehicle.id, { kennz: value })}
                      placeholder="z. B. B-AB 1234"
                      ariaLabel="PKW-Kennzeichen"
                    />
                  </label>
                  <label>
                    <FieldLabel>Fahrzeugführer</FieldLabel>
                    <TextInput
                      value={vehicle.fuehrer}
                      onChange={(value) => update(vehicle.id, { fuehrer: value })}
                      placeholder="z. B. Max Mustermann"
                      ariaLabel="Fahrzeugführer"
                    />
                  </label>
                  <label>
                    <FieldLabel>Anschaffungs- / Übernahmedatum</FieldLabel>
                    <TextInput
                      value={vehicle.anschaffung}
                      onChange={(value) => update(vehicle.id, { anschaffung: value })}
                      placeholder="TT.MM.JJJJ"
                      ariaLabel="Anschaffungs- oder Übernahmedatum"
                    />
                  </label>
                  <label>
                    <FieldLabel>Datum der Erstzulassung</FieldLabel>
                    <TextInput
                      value={vehicle.firstRegistration ?? ""}
                      onChange={(value) => update(vehicle.id, { firstRegistration: value })}
                      placeholder="TT.MM.JJJJ"
                      ariaLabel="Datum der Erstzulassung"
                    />
                  </label>
                  <label>
                    <FieldLabel>Veranlagungsjahr</FieldLabel>
                    <NumInput
                      value={vehicle.yearInput}
                      onChange={(value) => update(vehicle.id, { yearInput: value })}
                      placeholder="2026"
                      ariaLabel="Veranlagungsjahr"
                    />
                  </label>
                  <label>
                    <FieldLabel>Ursprünglicher inländischer Bruttolistenpreis (€)</FieldLabel>
                    <NumInput
                      value={vehicle.blpInput}
                      onChange={(value) => update(vehicle.id, { blpInput: value })}
                      placeholder="z. B. 80.000"
                      ariaLabel="Ursprünglicher inländischer Bruttolistenpreis"
                    />
                    {result.originalRoundedListPrice != null && (
                      <span className="mt-1 block text-[11px] text-muted-foreground">
                        ungekürzt abgerundet: {fmtEUR(result.originalRoundedListPrice)}
                      </span>
                    )}
                  </label>
                  <label>
                    <FieldLabel>Anzahl Nutzungsmonate (1–12)</FieldLabel>
                    <NumInput
                      value={vehicle.monateInput}
                      onChange={(value) => update(vehicle.id, { monateInput: value })}
                      placeholder="z. B. 12"
                      ariaLabel="Anzahl Nutzungsmonate"
                    />
                  </label>
                  <label>
                    <FieldLabel>Einfache Entfernung Wohnung–Betriebsstätte (km)</FieldLabel>
                    <NumInput
                      value={vehicle.distanceInput}
                      onChange={(value) => update(vehicle.id, { distanceInput: value })}
                      placeholder="z. B. 20"
                      ariaLabel="Einfache Entfernung Wohnung zur Betriebsstätte"
                    />
                  </label>
                  <label>
                    <FieldLabel>Tatsächliche Arbeitstage</FieldLabel>
                    <NumInput
                      value={vehicle.workdaysInput}
                      onChange={(value) => update(vehicle.id, { workdaysInput: value })}
                      placeholder="z. B. 220"
                      ariaLabel="Tatsächliche Arbeitstage"
                    />
                  </label>
                  <label>
                    <FieldLabel>Nachweis betriebliche Nutzung &gt; 50 %</FieldLabel>
                    <select
                      value={vehicle.nachweis}
                      onChange={(event) =>
                        update(vehicle.id, {
                          nachweis: event.target.value as Nachweis,
                        })
                      }
                      className={SELECT_CLASS}
                      aria-label="Nachweis betriebliche Nutzung über 50 Prozent"
                    >
                      <option value="ja">ja</option>
                      <option value="nein">nein</option>
                      <option value="unklar">unklar</option>
                    </select>
                  </label>
                </div>
                <div className="mt-3 space-y-2">
                  <InfoBox summary="Hinweise zu Anschaffung und 1-%-Methode">
                    <p>
                      Bei Leasing ist der maßgebliche Anschaffungszeitpunkt der Zeitpunkt der
                      Übernahme des Kfz. Die 1-%-Methode setzt grundsätzlich eine betriebliche
                      Nutzung von mehr als 50 % voraus.
                    </p>
                  </InfoBox>
                </div>

                <div className="mt-6">
                  <SectionTitle no="2">Prüfung Elektro-/Hybridbegünstigung</SectionTitle>
                  {isElectricVehicle ? (
                    <>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label>
                          <FieldLabel>CO₂-Ausstoß (g/km)</FieldLabel>
                          <NumInput
                            value={vehicle.co2Input ?? ""}
                            onChange={(value) => update(vehicle.id, { co2Input: value })}
                            placeholder={vehicleType === "electric" ? "0" : "z. B. 45"}
                            ariaLabel="CO2-Ausstoß in Gramm je Kilometer"
                          />
                        </label>
                        <label>
                          <FieldLabel>Elektrische Reichweite (km)</FieldLabel>
                          <NumInput
                            value={vehicle.electricRangeInput ?? ""}
                            onChange={(value) => update(vehicle.id, { electricRangeInput: value })}
                            placeholder="z. B. 85"
                            ariaLabel="Elektrische Reichweite"
                          />
                        </label>
                        <label>
                          <FieldLabel>Batteriekapazität (kWh)</FieldLabel>
                          <NumInput
                            value={vehicle.batteryCapacityInput ?? ""}
                            onChange={(value) =>
                              update(vehicle.id, { batteryCapacityInput: value })
                            }
                            placeholder="z. B. 30"
                            ariaLabel="Batteriekapazität"
                          />
                        </label>
                        <label>
                          <FieldLabel>Fahrzeugcode aus Feld 10 (optional)</FieldLabel>
                          <TextInput
                            value={vehicle.vehicleCode ?? ""}
                            onChange={(value) => update(vehicle.id, { vehicleCode: value })}
                            placeholder="z. B. 0015"
                            ariaLabel="Fahrzeugcode aus Feld 10"
                          />
                        </label>
                        <label className="sm:col-span-2">
                          <FieldLabel>Freitextnotiz zur Einordnung (optional)</FieldLabel>
                          <TextInput
                            value={vehicle.classificationNote ?? ""}
                            onChange={(value) => update(vehicle.id, { classificationNote: value })}
                            placeholder="z. B. Werte laut CoC / Zulassungsbescheinigung"
                            ariaLabel="Freitextnotiz zur Fahrzeugeinordnung"
                          />
                        </label>
                      </div>
                      <p className="mt-3 flex items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        Die ertragsteuerliche Kürzung des Bruttolistenpreises wird für
                        Umsatzsteuerzwecke nicht übernommen.
                      </p>
                    </>
                  ) : (
                    <p className="rounded-lg border border-border/70 bg-background/40 p-3 text-sm text-muted-foreground">
                      Für Verbrenner und sonstige Fahrzeuge wird der ungekürzte Listenpreis
                      angesetzt.
                    </p>
                  )}
                  <div className="mt-3 rounded-lg border border-border/70 bg-background/40 p-3">
                    <ResultRow
                      label="Fahrzeugart"
                      value={VEHICLE_TYPE_LABELS[result.vehicleType]}
                    />
                    <ResultRow
                      label="Anschaffungszeitraum"
                      value={
                        result.acquisitionYear != null
                          ? String(result.acquisitionYear)
                          : "nicht angegeben"
                      }
                    />
                    {isElectricVehicle && (
                      <>
                        <ResultRow
                          label="Ursprünglicher Bruttolistenpreis"
                          value={fmtEUR(result.originalListPrice)}
                        />
                        <ResultRow
                          label="CO₂-Ausstoß"
                          value={`${fmtNum(parseDe(vehicle.co2Input))} g/km`}
                        />
                        <ResultRow
                          label="Elektrische Reichweite"
                          value={`${fmtNum(parseDe(vehicle.electricRangeInput))} km`}
                        />
                        <ResultRow
                          label="Batteriekapazität"
                          value={`${fmtNum(parseDe(vehicle.batteryCapacityInput))} kWh`}
                        />
                      </>
                    )}
                    <ResultRow
                      label="Angewendete Vorschrift"
                      value={result.electricBenefit.applicableRule}
                    />
                    <ResultRow
                      label="Ergebnis"
                      value={BENEFIT_LABELS[result.electricBenefit.benefitType]}
                      strong
                    />
                    <ResultRow
                      label="Kürzung"
                      value={`${fmtNum(result.electricBenefit.reductionPercent)} %`}
                    />
                    {result.electricBenefit.benefitType === "battery-deduction" && (
                      <ResultRow
                        label="Pauschaler Batterieabschlag"
                        value={fmtEUR(result.electricBenefit.batteryDeduction)}
                      />
                    )}
                    <ResultRow
                      label="Ertragsteuerlicher maßgeblicher BLP"
                      value={fmtEUR(result.incomeTaxRelevantListPrice)}
                      strong
                    />
                    <ResultRow
                      label="Umsatzsteuerlicher ungekürzter BLP"
                      value={fmtEUR(result.vatRelevantListPrice)}
                      strong
                    />
                  </div>
                  <div className="mt-2">
                    <InfoBox summary="Einordnung und benötigte Fahrzeugunterlagen">
                      <p>
                        Für die steuerliche Einordnung können insbesondere Anschaffungszeitpunkt,
                        Bruttolistenpreis, CO₂-Ausstoß, elektrische Reichweite und Batteriekapazität
                        erforderlich sein. Die Daten sind anhand der Fahrzeugunterlagen zu prüfen.
                      </p>
                      <p className="mt-2">{result.electricBenefit.explanation}</p>
                    </InfoBox>
                  </div>
                </div>

                <div className="mt-6">
                  <SectionTitle no="3">Privatfahrten — Ertragsteuer</SectionTitle>
                  <div className="rounded-lg border border-border/70 bg-background/40 p-3">
                    <ResultRow
                      label="Ursprünglicher Bruttolistenpreis"
                      value={fmtEUR(result.originalListPrice)}
                    />
                    <ResultRow
                      label="Ertragsteuerlicher maßgeblicher BLP"
                      value={fmtEUR(result.incomeTaxRelevantListPrice)}
                    />
                    <ResultRow
                      label="Monatlicher 1-%-Wert"
                      value={fmtEUR(result.monthlyPrivateUseIncomeTax)}
                    />
                    <ResultRow
                      label={`Zeitraumwert (${fmtNum(result.months, 0)} Monate)`}
                      value={fmtEUR(result.privateUseIncomeTax)}
                      strong
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <SectionTitle no="4">Fahrten Wohnung–Betriebsstätte</SectionTitle>
                  <div className="rounded-lg border border-border/70 bg-background/40 p-3">
                    <ResultRow label="0,03-%-Wert" value={fmtEUR(result.commuteValue)} />
                    <ResultRow
                      label={`Entfernungspauschale je Tag (${result.distanceAllowanceRateLabel})`}
                      value={fmtEUR(result.distanceAllowancePerDayValue)}
                    />
                    <ResultRow
                      label="Abziehbare Entfernungspauschale"
                      value={fmtEUR(result.nonDeductibleCommuteExpense)}
                    />
                    <ResultRow
                      label="Verbleibende außerbilanzielle Korrektur"
                      value={fmtEUR(result.commuteCorrection)}
                      strong
                    />
                  </div>
                  <p className="mt-2 rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
                    Außerbilanzielle Korrektur für Fahrten Wohnung–Betriebsstätte gemäß Berechnung
                    prüfen; Zuordnung zu den vorgesehenen Konten 4679/4680 fachlich prüfen. Es wird
                    keine automatische Buchung erzeugt.
                  </p>
                </div>

                <div className="mt-6">
                  <SectionTitle no="5">Fahrzeugkosten</SectionTitle>
                  <div className="space-y-3 md:hidden">
                    {vehicle.costs.map((row, costIndex) => (
                      <div
                        key={row.key}
                        className="rounded-xl border border-border/70 bg-background/40 p-3"
                      >
                        <div className="mb-2 text-sm font-medium">{row.label}</div>
                        <div className="grid gap-2">
                          <CostInputs
                            row={row}
                            withVat={result.costAllocations[costIndex]?.withVat ?? null}
                            onChange={(patch) => updateCost(vehicle.id, row.key, patch)}
                          />
                        </div>
                        {row.hint && (
                          <p className="mt-2 text-[11px] text-muted-foreground">{row.hint}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="hidden overflow-hidden rounded-lg border border-border/70 md:block">
                    <table className="w-full text-sm">
                      <thead className="bg-foreground/5 text-left text-foreground/70">
                        <tr>
                          <th className="px-2 py-2 font-medium">Kostenart</th>
                          <th className="px-2 py-2 font-medium">Gesamt netto (€)</th>
                          <th className="px-2 py-2 font-medium">Davon ohne VSt (€)</th>
                          <th className="px-2 py-2 font-medium">Davon mit VSt (€)</th>
                          <th className="px-2 py-2 font-medium">Hinweis</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vehicle.costs.map((row, costIndex) => (
                          <tr key={row.key} className="border-t border-border/60">
                            <td className="px-2 py-1.5">{row.label}</td>
                            <td className="px-2 py-1.5">
                              <NumInput
                                value={row.totalNet}
                                onChange={(value) =>
                                  updateCost(vehicle.id, row.key, { totalNet: value })
                                }
                                placeholder="z. B. 1.200,00"
                                ariaLabel={`${row.label} gesamt netto`}
                              />
                            </td>
                            <td className="px-2 py-1.5 text-right tabular-nums">
                              {fmtEUR(result.costAllocations[costIndex]?.withVat)}
                            </td>
                            <td className="px-2 py-1.5">
                              <NumInput
                                value={row.withoutVat}
                                onChange={(value) =>
                                  updateCost(vehicle.id, row.key, { withoutVat: value })
                                }
                                placeholder="z. B. 0,00"
                                ariaLabel={`${row.label} ohne Vorsteuer`}
                              />
                            </td>
                            <td className="px-2 py-1.5 text-[11px] text-muted-foreground">
                              {row.hint ?? ""}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Parkgebühren und Reisekosten nicht erfassen — sie werden nicht automatisch zu
                    den Gesamtfahrzeugkosten gerechnet.
                  </p>
                  <div className="mt-3 rounded-lg border border-border/70 bg-background/40 p-3">
                    <ResultRow
                      label="Gesamtfahrzeugkosten netto"
                      value={fmtEnteredCost(result.totalVehicleCostsNet)}
                      strong
                    />
                    <ResultRow
                      label="Mit Vorsteuer belastet"
                      value={fmtEnteredCost(result.vatVehicleCostsNet)}
                    />
                    <ResultRow
                      label="Ohne Vorsteuer"
                      value={fmtEnteredCost(result.nonVatVehicleCosts)}
                    />
                    <ResultRow
                      label="Leasing/Miete mit Vorsteuer"
                      value={fmtEnteredCost(result.leasingRentalVatCostsNet)}
                    />
                    <ResultRow
                      label="Leasing/Miete ohne Vorsteuer"
                      value={fmtEnteredCost(result.leasingRentalNonVatCosts)}
                    />
                    <ResultRow
                      label="Übrige Kosten mit Vorsteuer"
                      value={fmtEnteredCost(result.otherVatCostsNet)}
                    />
                    <ResultRow
                      label="Übrige Kosten ohne Vorsteuer"
                      value={fmtEnteredCost(result.otherNonVatCosts)}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <SectionTitle no="6">Ertragsteuerliche Kostendeckelung</SectionTitle>
                  <div className="rounded-lg border border-border/70 bg-background/40 p-3">
                    <ResultRow
                      label="Pauschale Wertansätze (1 % + 0,03 %)"
                      value={fmtEUR(result.pauschalIncomeTaxValues)}
                    />
                    <ResultRow
                      label="Tatsächliche Gesamtfahrzeugkosten"
                      value={fmtEnteredCost(result.totalVehicleCostsNet)}
                    />
                    <ResultRow
                      label="Kostendeckelung"
                      value={
                        result.costCapApplies == null
                          ? "nicht prüfbar"
                          : result.costCapApplies
                            ? "ja"
                            : "nein"
                      }
                      strong
                    />
                    <ResultRow
                      label="Wertansätze nach Kostendeckelung"
                      value={fmtEUR(result.incomeTaxValuesAfterCap)}
                    />
                    <ResultRow
                      label="Korrektur nach Entfernungspauschale"
                      value={fmtEUR(result.incomeTaxCorrectionAfterCap)}
                      strong
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <SectionTitle no="7">Umsatzsteuerprüfung</SectionTitle>
                  {isElectricVehicle && (
                    <p className="mb-3 flex items-start gap-1.5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      Für die Umsatzsteuer gilt der ungekürzte ursprüngliche Bruttolistenpreis —
                      ohne Viertelung, Halbierung oder Batterieabschlag.
                    </p>
                  )}
                  {result.costCapApplies === true && (
                    <div className="mb-3 grid gap-3 sm:grid-cols-2">
                      <label>
                        <FieldLabel>Geeignete Unterlagen vorhanden</FieldLabel>
                        <select
                          value={vehicle.vatEvidence ?? "nein"}
                          onChange={(event) =>
                            update(vehicle.id, {
                              vatEvidence: event.target.value as VatEvidence,
                            })
                          }
                          className={SELECT_CLASS}
                          aria-label="Geeignete Unterlagen für den USt-Privatanteil vorhanden"
                        >
                          <option value="nein">nein</option>
                          <option value="ja">ja</option>
                        </select>
                      </label>
                      <label>
                        <FieldLabel>Geschätzter USt-Privatanteil (%)</FieldLabel>
                        <NumInput
                          value={vehicle.vatPrivateShareInput}
                          onChange={(value) => update(vehicle.id, { vatPrivateShareInput: value })}
                          placeholder={
                            (vehicle.vatEvidence ?? "nein") === "nein"
                              ? "leer = widerlegbar 50 %"
                              : "laut Unterlagen"
                          }
                          ariaLabel="Geschätzter Privatanteil für die Umsatzsteuer"
                        />
                      </label>
                    </div>
                  )}
                  <div className="rounded-lg border border-border/70 bg-background/40 p-3">
                    <ResultRow
                      label="Ungekürzter umsatzsteuerlicher BLP"
                      value={fmtEUR(result.vatRelevantListPrice)}
                    />
                    <ResultRow
                      label="Umsatzsteuerlicher 1-%-Wert"
                      value={fmtEUR(result.vatOnePercentValue)}
                    />
                    <ResultRow
                      label="20-%-Abschlag"
                      value={fmtEUR(result.vatNonInputTaxDeduction)}
                    />
                    <ResultRow
                      label="BMG vor Kostendeckelung"
                      value={fmtEUR(result.vatBaseBeforeCap)}
                    />
                    <ResultRow
                      label="USt 19 % vor Kostendeckelung"
                      value={fmtEUR(result.vatBeforeCap)}
                    />
                    {result.costCapApplies === true && (
                      <>
                        <ResultRow
                          label={`BMG aus Schätzung (${fmtNum(result.vatPrivateSharePercent)} %)`}
                          value={fmtEUR(result.vatBaseByEstimate)}
                        />
                        <ResultRow
                          label="USt 19 % aus Schätzung"
                          value={fmtEUR(result.vatDueByEstimate)}
                        />
                        <ResultRow
                          label="Geeignete Unterlagen"
                          value={result.vatEvidenceAvailable ? "ja" : "nein"}
                        />
                      </>
                    )}
                  </div>
                  {result.costCapApplies === true && !result.vatEvidenceAvailable && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Ohne geeignete Unterlagen werden 50 % ausschließlich als widerlegbare
                      Schätzung verwendet.
                    </p>
                  )}
                </div>

                <div className="mt-6">
                  <SectionTitle no="8">DATEV-Buchungswerte</SectionTitle>
                  <p className="mb-3 text-xs font-medium text-amber-800">
                    DATEV-Buchungsvorschlag – fachlich prüfen.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="rounded-lg border border-border/70 bg-background/40 p-3">
                      <div className="font-medium">
                        ⇨ 8921 0 — Unentgeltliche Wertabgaben Kfz 19 % USt
                      </div>
                      <ResultRow label="BMG" value={fmtEUR(result.vatBase8921)} />
                      <ResultRow label="USt 19 %" value={fmtEUR(result.vatDue)} />
                    </div>
                    <div className="rounded-lg border border-border/70 bg-background/40 p-3">
                      <div className="font-medium">
                        ⇨ 8924 0 — Unentgeltliche Wertabgaben Kfz ohne USt
                      </div>
                      <ResultRow label="Betrag" value={fmtEUR(result.amount8924)} />
                    </div>
                    <div className="rounded-lg border border-border/70 bg-background/40 p-3">
                      <div className="font-medium">
                        Außerbilanzielle Korrektur Wohnung–Betriebsstätte
                      </div>
                      <ResultRow label="Korrektur" value={fmtEUR(result.commuteCorrection)} />
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-border bg-foreground/[0.03] p-3">
                      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Gesamtwert vor Deckelung
                      </div>
                      <div className="text-lg font-semibold tabular-nums">
                        {fmtEUR(result.totalBeforeCap)}
                      </div>
                    </div>
                    <div className="rounded-lg border border-border bg-foreground/[0.03] p-3">
                      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Gesamtwert nach Deckelung
                      </div>
                      <div className="text-lg font-semibold tabular-nums">
                        {fmtEUR(result.totalAfterCap)}
                      </div>
                    </div>
                  </div>
                </div>

                {result.warnings.length > 0 && (
                  <div className="mt-6">
                    <SectionTitle no="9">Warnhinweise und Review</SectionTitle>
                    <ul className="space-y-1.5 text-sm" aria-label="Warnhinweise">
                      {result.warnings.map((warning) => (
                        <li
                          key={warning}
                          className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-amber-900"
                        >
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          <span>{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            );
          })}

          <Button onClick={add} variant="outline">
            <Plus className="h-4 w-4" /> Weiteres Fahrzeug hinzufügen
          </Button>

          {vehicles.length > 1 && (
            <article className="rounded-2xl border border-border bg-card p-4 sm:p-6">
              <h2 className="mb-3 text-base font-semibold">Gesamtsummen aller Fahrzeuge</h2>
              <ResultRow label="Summe BMG ⇨ 8921 0" value={fmtEUR(totals.base8921)} />
              <ResultRow label="Summe USt 19 %" value={fmtEUR(totals.vat)} />
              <ResultRow label="Summe ⇨ 8924 0" value={fmtEUR(totals.amount8924)} />
              <ResultRow
                label="Summe Fahrten Wohnung–Betriebsstätte"
                value={fmtEUR(totals.commute)}
              />
              <ResultRow label="Gesamte private Kfz-Nutzung" value={fmtEUR(totals.total)} strong />
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
                      Das Excel-Arbeitspapier enthält Übersicht, Elektro-/Hybridprüfung und
                      Detailberechnung je Fahrzeug.
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
              <div
                className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-950"
                aria-live="polite"
              >
                <div className="flex items-start gap-2">
                  <FileSpreadsheet className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                  <div>
                    <div className="text-sm font-medium">
                      Excel ist nach vollständiger Eingabe verfügbar
                    </div>
                    <ul className="mt-1 space-y-0.5 text-xs text-amber-800">
                      {workpaperErrors.slice(0, 4).map((error) => (
                        <li key={error}>{error}</li>
                      ))}
                      {workpaperErrors.length > 4 && (
                        <li>Weitere {workpaperErrors.length - 4} Angaben fehlen.</li>
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
            <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <p>{REVIEW}</p>
            </div>
          </article>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
