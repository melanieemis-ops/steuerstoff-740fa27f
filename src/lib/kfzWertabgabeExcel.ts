import { Capacitor } from "@capacitor/core";
import {
  calculateKfz,
  getKfzCalculationErrors,
  getKfzCalculationErrorsForVehicles,
  parseDe,
  type ElectricBenefitType,
  type Vehicle,
  type VehicleType,
} from "./kfzWertabgabe.ts";

const EURO_FORMAT = "#,##0.00 [$€-407]";
const INTEGER_FORMAT = "0";
const NUMBER_FORMAT = "0.00";
const PERCENT_FORMAT = "0.00%";
const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

type XlsxModule = typeof import("xlsx");
type Worksheet = import("xlsx").WorkSheet;
type CellValue = string | number | boolean | Date | null;

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

async function loadXlsx(): Promise<XlsxModule> {
  const mod = (await import("xlsx")) as unknown as XlsxModule & { default?: XlsxModule };
  return "utils" in mod ? mod : (mod.default as XlsxModule);
}

export interface KfzWorkpaperFile {
  bytes: ArrayBuffer;
  fileName: string;
}

export interface KfzWorkpaperDelivery {
  shared: boolean;
}

interface VehicleSheetRows {
  firstCostRow: number;
  lastCostRow: number;
  totalCostRow: number;
  capSectionRow: number;
  pauschalRow: number;
  actualCostRow: number;
  capAppliesRow: number;
  cappedValueRow: number;
  incomeTaxCorrectionRow: number;
  vatSectionRow: number;
  vatListPriceRow: number;
  vatOnePercentRow: number;
  vatDeductionRow: number;
  vatBeforeCapBaseRow: number;
  vatBeforeCapRow: number;
  vatEvidenceRow: number;
  vatShareRow: number;
  vatEstimateRow: number;
  vatBaseRow: number;
  vatDueRow: number;
  amount8924Row: number;
  commuteCorrectionRow: number;
  totalBeforeRow: number;
  totalAfterRow: number;
  warningsSectionRow: number;
}

function safeNumber(value: number | null | undefined): number {
  return value != null && Number.isFinite(value) ? value : 0;
}

function setFormula(
  sheet: Worksheet,
  address: string,
  formula: string,
  value: number | boolean,
  numberFormat?: string,
) {
  sheet[address] = {
    t: typeof value === "boolean" ? "b" : "n",
    f: formula,
    v: value,
    ...(numberFormat ? { z: numberFormat } : {}),
  };
}

function setNumberFormat(sheet: Worksheet, addresses: string[], numberFormat: string) {
  for (const address of addresses) {
    const cell = sheet[address];
    if (cell) cell.z = numberFormat;
  }
}

function addSectionMerges(XLSX: XlsxModule, sheet: Worksheet, rows: number[]) {
  sheet["!merges"] = [
    XLSX.utils.decode_range("A1:D1"),
    XLSX.utils.decode_range("A3:D3"),
    ...rows.map((row) => XLSX.utils.decode_range(`A${row}:D${row}`)),
  ];
}

function getVehicleSheetRows(vehicle: Vehicle): VehicleSheetRows {
  const firstCostRow = 43;
  const lastCostRow = firstCostRow + vehicle.costs.length - 1;
  const totalCostRow = lastCostRow + 1;
  const capSectionRow = totalCostRow + 2;
  const vatSectionRow = capSectionRow + 7;
  return {
    firstCostRow,
    lastCostRow,
    totalCostRow,
    capSectionRow,
    pauschalRow: capSectionRow + 1,
    actualCostRow: capSectionRow + 2,
    capAppliesRow: capSectionRow + 3,
    cappedValueRow: capSectionRow + 4,
    incomeTaxCorrectionRow: capSectionRow + 5,
    vatSectionRow,
    vatListPriceRow: vatSectionRow + 1,
    vatOnePercentRow: vatSectionRow + 2,
    vatDeductionRow: vatSectionRow + 3,
    vatBeforeCapBaseRow: vatSectionRow + 4,
    vatBeforeCapRow: vatSectionRow + 5,
    vatEvidenceRow: vatSectionRow + 6,
    vatShareRow: vatSectionRow + 7,
    vatEstimateRow: vatSectionRow + 8,
    vatBaseRow: vatSectionRow + 9,
    vatDueRow: vatSectionRow + 10,
    amount8924Row: vatSectionRow + 11,
    commuteCorrectionRow: vatSectionRow + 12,
    totalBeforeRow: vatSectionRow + 13,
    totalAfterRow: vatSectionRow + 14,
    warningsSectionRow: vatSectionRow + 16,
  };
}

function createVehicleSheet(XLSX: XlsxModule, vehicle: Vehicle, index: number): Worksheet {
  const result = calculateKfz(vehicle);
  const rowNumbers = getVehicleSheetRows(vehicle);
  const {
    firstCostRow,
    lastCostRow,
    totalCostRow,
    capSectionRow,
    pauschalRow,
    actualCostRow,
    capAppliesRow,
    cappedValueRow,
    incomeTaxCorrectionRow,
    vatSectionRow,
    vatListPriceRow,
    vatOnePercentRow,
    vatDeductionRow,
    vatBeforeCapBaseRow,
    vatBeforeCapRow,
    vatEvidenceRow,
    vatShareRow,
    vatEstimateRow,
    vatBaseRow,
    vatDueRow,
    amount8924Row,
    commuteCorrectionRow,
    totalBeforeRow,
    totalAfterRow,
    warningsSectionRow,
  } = rowNumbers;

  const rows: CellValue[][] = [
    [`steuerstoff · Kfz-Wertabgabe · Fahrzeug ${index + 1}`, null, null, null],
    ["Erstellt am", new Date(), null, null],
    [
      "Arbeitspapier nach Rechtsstand 2026 – Elektro-/Hybridprüfung, Ertragsteuer, Umsatzsteuer und DATEV",
      null,
      null,
      null,
    ],
    [null, null, null, null],
    ["1. Fahrzeugdaten", null, null, null],
    ["Fahrzeugart", VEHICLE_TYPE_LABELS[result.vehicleType], null, null],
    ["Fahrzeug / Bezeichnung", vehicle.bez || "—", null, null],
    ["PKW-Kennzeichen", vehicle.kennz || "—", null, null],
    ["Fahrzeugführer", vehicle.fuehrer || "—", null, null],
    ["Anschaffung / Übernahme", vehicle.anschaffung, null, null],
    ["Erstzulassung", vehicle.firstRegistration || "—", null, null],
    ["Veranlagungsjahr", safeNumber(result.taxYear), null, null],
    [
      "Ursprünglicher inländischer Bruttolistenpreis",
      safeNumber(result.originalListPrice),
      null,
      null,
    ],
    [
      "Ursprünglicher Bruttolistenpreis, auf volle 100 € abgerundet",
      safeNumber(result.originalRoundedListPrice),
      null,
      null,
    ],
    [
      "Ergebnis Elektro-/Hybridbegünstigung",
      BENEFIT_LABELS[result.electricBenefit.benefitType],
      null,
      null,
    ],
    [
      "Steuerpflichtiger Listenpreisfaktor",
      safeNumber(result.electricBenefit.taxableListPriceFactor),
      null,
      null,
    ],
    ["Kürzung in Prozent", safeNumber(result.electricBenefit.reductionPercent) / 100, null, null],
    [
      "Pauschaler Batterieabschlag",
      safeNumber(result.electricBenefit.batteryDeduction),
      null,
      null,
    ],
    [
      "Ertragsteuerlicher maßgeblicher Bruttolistenpreis",
      safeNumber(result.incomeTaxRelevantListPrice),
      null,
      null,
    ],
    [
      "Umsatzsteuerlicher ungekürzter Bruttolistenpreis",
      safeNumber(result.vatRelevantListPrice),
      null,
      null,
    ],
    ["Nutzungsmonate", safeNumber(result.months), null, null],
    ["Entfernung Wohnung–Betrieb (volle km)", safeNumber(result.fullDistanceKm), null, null],
    ["Tatsächliche Arbeitstage", safeNumber(result.workdays), null, null],
    ["Nachweis betriebliche Nutzung > 50 %", vehicle.nachweis, null, null],
    ["CO₂-Ausstoß (g/km)", parseDe(vehicle.co2Input) ?? "—", null, null],
    ["Elektrische Reichweite (km)", parseDe(vehicle.electricRangeInput) ?? "—", null, null],
    ["Batteriekapazität (kWh)", parseDe(vehicle.batteryCapacityInput) ?? "—", null, null],
    ["Fahrzeugcode Feld 10", vehicle.vehicleCode || "—", null, null],
    ["Einordnungsnotiz", vehicle.classificationNote || "—", null, null],
    [null, null, null, null],
    ["2. Privatfahrten — Ertragsteuer", null, null, null],
    ["Monatlicher 1-%-Wert", safeNumber(result.monthlyPrivateUseIncomeTax), null, null],
    ["Zeitraumwert Privatfahrten", safeNumber(result.privateUseIncomeTax), null, null],
    [null, null, null, null],
    ["3. Fahrten Wohnung / Betrieb", null, null, null],
    ["0,03-%-Wert", safeNumber(result.commuteValue), null, null],
    [
      `Entfernungspauschale je Arbeitstag (${result.distanceAllowanceRateLabel})`,
      safeNumber(result.distanceAllowancePerDayValue),
      null,
      null,
    ],
    ["Entfernungspauschale gesamt", safeNumber(result.nonDeductibleCommuteExpense), null, null],
    ["Positive außerbilanzielle Korrektur", safeNumber(result.commuteCorrection), null, null],
    [null, null, null, null],
    ["4. Fahrzeugkosten", null, null, null],
    ["Kostenart", "Gesamt netto", "Davon ohne VSt", "Mit VSt belastet"],
    ...vehicle.costs.map((cost) => [
      cost.label,
      safeNumber(parseDe(cost.totalNet)),
      safeNumber(parseDe(cost.withoutVat)),
      0,
    ]),
    [
      "Summe Fahrzeugkosten",
      result.totalVehicleCostsNet,
      result.nonVatVehicleCosts,
      result.vatVehicleCostsNet,
    ],
    [null, null, null, null],
    ["5. Ertragsteuerliche Kostendeckelung", null, null, null],
    [
      "Pauschale Wertansätze (Privat + 0,03 %)",
      safeNumber(result.pauschalIncomeTaxValues),
      null,
      null,
    ],
    ["Tatsächliche Gesamtfahrzeugkosten", result.totalVehicleCostsNet, null, null],
    ["Kostendeckelung greift", result.costCapApplies === true, null, null],
    ["Wertansätze nach Kostendeckelung", safeNumber(result.incomeTaxValuesAfterCap), null, null],
    [
      "Ertragsteuerliche Korrektur nach Entfernungspauschale",
      safeNumber(result.incomeTaxCorrectionAfterCap),
      null,
      null,
    ],
    [null, null, null, null],
    ["6. Umsatzsteuer / DATEV", null, null, null],
    [
      "Umsatzsteuerlicher ungekürzter Bruttolistenpreis",
      safeNumber(result.vatRelevantListPrice),
      null,
      null,
    ],
    ["Umsatzsteuerlicher 1-%-Wert", safeNumber(result.vatOnePercentValue), null, null],
    [
      "20-%-Abschlag für nicht vorsteuerbelastete Kosten",
      safeNumber(result.vatNonInputTaxDeduction),
      null,
      null,
    ],
    ["BMG vor Kostendeckelung", safeNumber(result.vatBaseBeforeCap), null, null],
    ["USt 19 % vor Kostendeckelung", safeNumber(result.vatBeforeCap), null, null],
    ["Geeignete Unterlagen vorhanden", result.vatEvidenceAvailable ? "ja" : "nein", null, null],
    ["Geschätzter USt-Privatanteil", safeNumber(result.vatPrivateSharePercent) / 100, null, null],
    ["BMG aus sachgerechter Schätzung", safeNumber(result.vatBaseByEstimate), null, null],
    ["BMG ⇨ DATEV 8921 0", safeNumber(result.vatBase8921), null, null],
    ["Abzuführende USt 19 %", safeNumber(result.vatDue), null, null],
    ["Anteil ohne USt ⇨ DATEV 8924 0", safeNumber(result.amount8924), null, null],
    ["Korrektur Wohnung–Betriebsstätte", safeNumber(result.commuteCorrection), null, null],
    ["Gesamtwert vor Kostendeckelung", safeNumber(result.totalBeforeCap), null, null],
    ["Gesamtwert nach Kostendeckelung", safeNumber(result.totalAfterCap), null, null],
    [null, null, null, null],
    ["7. Warnhinweise / Review", null, null, null],
    ...(result.warnings.length
      ? result.warnings.map((warning) => [`• ${warning}`, null, null, null])
      : [["Keine Warnhinweise.", null, null, null]]),
    [null, null, null, null],
    [
      "Review-Hinweis",
      "Arbeitshilfe nach Rechtsstand 2026. Fahrzeugunterlagen, Begünstigung, Kosten, Vorsteueraufteilung und DATEV-Vorschläge fachlich prüfen.",
      null,
      null,
    ],
  ];

  const sheet = XLSX.utils.aoa_to_sheet(rows, { cellDates: true });
  setFormula(
    sheet,
    "B14",
    "ROUNDDOWN(B13/100,0)*100",
    safeNumber(result.originalRoundedListPrice),
    EURO_FORMAT,
  );
  const incomeListPriceFormula =
    result.electricBenefit.benefitType === "battery-deduction"
      ? "ROUNDDOWN(MAX(0,B13-B18)/100,0)*100"
      : "ROUNDDOWN((B13*B16)/100,0)*100";
  setFormula(
    sheet,
    "B19",
    incomeListPriceFormula,
    safeNumber(result.incomeTaxRelevantListPrice),
    EURO_FORMAT,
  );
  setFormula(sheet, "B20", "B14", safeNumber(result.vatRelevantListPrice), EURO_FORMAT);
  setFormula(sheet, "B32", "B19*1%", safeNumber(result.monthlyPrivateUseIncomeTax), EURO_FORMAT);
  setFormula(sheet, "B33", "B32*B21", safeNumber(result.privateUseIncomeTax), EURO_FORMAT);
  setFormula(
    sheet,
    "B36",
    "B19*0.03%*ROUNDDOWN(B22,0)*B21",
    safeNumber(result.commuteValue),
    EURO_FORMAT,
  );
  setFormula(
    sheet,
    "B37",
    "IF(B12>=2026,ROUNDDOWN(B22,0)*0.38,IF(B12>=2024,MIN(ROUNDDOWN(B22,0),20)*0.3+MAX(0,ROUNDDOWN(B22,0)-20)*0.38,IF(B12>=2021,MIN(ROUNDDOWN(B22,0),20)*0.3+MAX(0,ROUNDDOWN(B22,0)-20)*0.35,ROUNDDOWN(B22,0)*0.3)))",
    safeNumber(result.distanceAllowancePerDayValue),
    EURO_FORMAT,
  );
  setFormula(sheet, "B38", "B23*B37", safeNumber(result.nonDeductibleCommuteExpense), EURO_FORMAT);
  setFormula(sheet, "B39", "MAX(0,B36-B38)", safeNumber(result.commuteCorrection), EURO_FORMAT);

  for (let row = firstCostRow; row <= lastCostRow; row += 1) {
    const cost = vehicle.costs[row - firstCostRow];
    const total = safeNumber(parseDe(cost.totalNet));
    const withoutVat = safeNumber(parseDe(cost.withoutVat));
    setFormula(
      sheet,
      `D${row}`,
      `MAX(0,B${row}-C${row})`,
      Math.max(0, total - withoutVat),
      EURO_FORMAT,
    );
  }
  setFormula(
    sheet,
    `B${totalCostRow}`,
    `SUM(B${firstCostRow}:B${lastCostRow})`,
    result.totalVehicleCostsNet,
    EURO_FORMAT,
  );
  setFormula(
    sheet,
    `C${totalCostRow}`,
    `SUM(C${firstCostRow}:C${lastCostRow})`,
    result.nonVatVehicleCosts,
    EURO_FORMAT,
  );
  setFormula(
    sheet,
    `D${totalCostRow}`,
    `SUM(D${firstCostRow}:D${lastCostRow})`,
    result.vatVehicleCostsNet,
    EURO_FORMAT,
  );
  setFormula(
    sheet,
    `B${pauschalRow}`,
    "B33+B36",
    safeNumber(result.pauschalIncomeTaxValues),
    EURO_FORMAT,
  );
  setFormula(
    sheet,
    `B${actualCostRow}`,
    `B${totalCostRow}`,
    result.totalVehicleCostsNet,
    EURO_FORMAT,
  );
  setFormula(
    sheet,
    `B${capAppliesRow}`,
    `B${pauschalRow}>B${actualCostRow}`,
    result.costCapApplies === true,
  );
  setFormula(
    sheet,
    `B${cappedValueRow}`,
    `IF(B${capAppliesRow},B${actualCostRow},B${pauschalRow})`,
    safeNumber(result.incomeTaxValuesAfterCap),
    EURO_FORMAT,
  );
  setFormula(
    sheet,
    `B${incomeTaxCorrectionRow}`,
    `IF(B${capAppliesRow},MAX(0,B${actualCostRow}-B38),B33+B39)`,
    safeNumber(result.incomeTaxCorrectionAfterCap),
    EURO_FORMAT,
  );
  setFormula(
    sheet,
    `B${vatListPriceRow}`,
    "B20",
    safeNumber(result.vatRelevantListPrice),
    EURO_FORMAT,
  );
  setFormula(
    sheet,
    `B${vatOnePercentRow}`,
    `B${vatListPriceRow}*1%*B21`,
    safeNumber(result.vatOnePercentValue),
    EURO_FORMAT,
  );
  setFormula(
    sheet,
    `B${vatDeductionRow}`,
    `B${vatOnePercentRow}*20%`,
    safeNumber(result.vatNonInputTaxDeduction),
    EURO_FORMAT,
  );
  setFormula(
    sheet,
    `B${vatBeforeCapBaseRow}`,
    `B${vatOnePercentRow}-B${vatDeductionRow}`,
    safeNumber(result.vatBaseBeforeCap),
    EURO_FORMAT,
  );
  setFormula(
    sheet,
    `B${vatBeforeCapRow}`,
    `B${vatBeforeCapBaseRow}*19%`,
    safeNumber(result.vatBeforeCap),
    EURO_FORMAT,
  );
  setFormula(
    sheet,
    `B${vatEstimateRow}`,
    `IF(B${capAppliesRow},D${totalCostRow}*B${vatShareRow},0)`,
    safeNumber(result.vatBaseByEstimate),
    EURO_FORMAT,
  );
  setFormula(
    sheet,
    `B${vatBaseRow}`,
    `IF(B${capAppliesRow},B${vatEstimateRow},B${vatBeforeCapBaseRow})`,
    safeNumber(result.vatBase8921),
    EURO_FORMAT,
  );
  setFormula(sheet, `B${vatDueRow}`, `B${vatBaseRow}*19%`, safeNumber(result.vatDue), EURO_FORMAT);
  setFormula(
    sheet,
    `B${amount8924Row}`,
    `MAX(0,B${incomeTaxCorrectionRow}-B${vatBaseRow})`,
    safeNumber(result.amount8924),
    EURO_FORMAT,
  );
  setFormula(
    sheet,
    `B${commuteCorrectionRow}`,
    "B39",
    safeNumber(result.commuteCorrection),
    EURO_FORMAT,
  );
  setFormula(
    sheet,
    `B${totalBeforeRow}`,
    `B33+B39+B${vatBeforeCapRow}`,
    safeNumber(result.totalBeforeCap),
    EURO_FORMAT,
  );
  setFormula(
    sheet,
    `B${totalAfterRow}`,
    `B${incomeTaxCorrectionRow}+B${vatDueRow}`,
    safeNumber(result.totalAfterCap),
    EURO_FORMAT,
  );

  setNumberFormat(sheet, ["B2"], "dd.mm.yyyy hh:mm");
  setNumberFormat(sheet, ["B12", "B21", "B22", "B23"], INTEGER_FORMAT);
  setNumberFormat(sheet, ["B16", "B17", `B${vatShareRow}`], PERCENT_FORMAT);
  setNumberFormat(sheet, ["B25", "B26", "B27"], NUMBER_FORMAT);
  setNumberFormat(sheet, ["B13", "B14", "B18", "B19", "B20"], EURO_FORMAT);
  for (let row = firstCostRow; row <= totalCostRow; row += 1)
    setNumberFormat(sheet, [`B${row}`, `C${row}`, `D${row}`], EURO_FORMAT);
  for (let row = 32; row <= totalAfterRow; row += 1) {
    if (sheet[`B${row}`]?.t === "n" && row !== vatShareRow) sheet[`B${row}`].z = EURO_FORMAT;
  }

  addSectionMerges(XLSX, sheet, [5, 31, 35, 41, capSectionRow, vatSectionRow, warningsSectionRow]);
  sheet["!cols"] = [{ wch: 63 }, { wch: 27 }, { wch: 22 }, { wch: 22 }];
  sheet["!rows"] = [{ hpt: 28 }, { hpt: 20 }, { hpt: 34 }];
  sheet["!autofilter"] = { ref: `A42:D${lastCostRow}` };
  sheet["!margins"] = {
    left: 0.4,
    right: 0.4,
    top: 0.6,
    bottom: 0.6,
    header: 0.2,
    footer: 0.2,
  };
  return sheet;
}

function createOverviewSheet(XLSX: XlsxModule, vehicles: Vehicle[]): Worksheet {
  const rows: CellValue[][] = [
    [
      "steuerstoff · Kfz-Wertabgaben · Übersicht",
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ],
    ["Erstellt am", new Date(), null, null, null, null, null, null, null, null, null],
    [
      "Arbeitspapier nach Rechtsstand 2026 – Detailberechnungen befinden sich in den folgenden Fahrzeugblättern.",
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ],
    [null, null, null, null, null, null, null, null, null, null, null],
    [
      "Fahrzeug",
      "Fahrzeugart",
      "Jahr",
      "Begünstigung",
      "BLP ESt",
      "BLP USt",
      "BMG ⇨ 8921 0",
      "USt 19 %",
      "Betrag ⇨ 8924 0",
      "Korrektur W/B",
      "Gesamtwert",
    ],
    ...vehicles.map((vehicle) => {
      const result = calculateKfz(vehicle);
      return [
        vehicle.bez || "Ohne Bezeichnung",
        VEHICLE_TYPE_LABELS[result.vehicleType],
        safeNumber(result.taxYear),
        BENEFIT_LABELS[result.electricBenefit.benefitType],
        0,
        0,
        0,
        0,
        0,
        0,
        0,
      ];
    }),
    ["Gesamtsummen", null, null, null, 0, 0, 0, 0, 0, 0, 0],
    [null, null, null, null, null, null, null, null, null, null, null],
    [
      "Review-Hinweis",
      "Arbeitshilfe nach Rechtsstand 2026. Fahrzeugunterlagen, Begünstigung, Kosten, Vorsteueraufteilung und DATEV-Vorschläge fachlich prüfen.",
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ],
  ];

  const sheet = XLSX.utils.aoa_to_sheet(rows, { cellDates: true });
  const firstVehicleRow = 6;
  const lastVehicleRow = firstVehicleRow + vehicles.length - 1;
  const totalRow = lastVehicleRow + 1;

  vehicles.forEach((vehicle, index) => {
    const row = firstVehicleRow + index;
    const result = calculateKfz(vehicle);
    const sheetName = `Fahrzeug ${index + 1}`;
    const detailRows = getVehicleSheetRows(vehicle);
    const mappings = [
      ["E", "B19", result.incomeTaxRelevantListPrice],
      ["F", "B20", result.vatRelevantListPrice],
      ["G", `B${detailRows.vatBaseRow}`, result.vatBase8921],
      ["H", `B${detailRows.vatDueRow}`, result.vatDue],
      ["I", `B${detailRows.amount8924Row}`, result.amount8924],
      ["J", `B${detailRows.commuteCorrectionRow}`, result.commuteCorrection],
      ["K", `B${detailRows.totalAfterRow}`, result.totalAfterCap],
    ] as const;
    for (const [column, detailAddress, value] of mappings)
      setFormula(
        sheet,
        `${column}${row}`,
        `'${sheetName}'!${detailAddress}`,
        safeNumber(value),
        EURO_FORMAT,
      );
  });

  const totalsByColumn: Record<string, (vehicle: Vehicle) => number | null> = {
    E: (vehicle) => calculateKfz(vehicle).incomeTaxRelevantListPrice,
    F: (vehicle) => calculateKfz(vehicle).vatRelevantListPrice,
    G: (vehicle) => calculateKfz(vehicle).vatBase8921,
    H: (vehicle) => calculateKfz(vehicle).vatDue,
    I: (vehicle) => calculateKfz(vehicle).amount8924,
    J: (vehicle) => calculateKfz(vehicle).commuteCorrection,
    K: (vehicle) => calculateKfz(vehicle).totalAfterCap,
  };
  for (const [column, selectValue] of Object.entries(totalsByColumn)) {
    const total = vehicles.reduce((sum, vehicle) => sum + safeNumber(selectValue(vehicle)), 0);
    setFormula(
      sheet,
      `${column}${totalRow}`,
      `SUM(${column}${firstVehicleRow}:${column}${lastVehicleRow})`,
      total,
      EURO_FORMAT,
    );
  }

  sheet["!merges"] = [
    XLSX.utils.decode_range("A1:K1"),
    XLSX.utils.decode_range("A3:K3"),
    XLSX.utils.decode_range(`A${totalRow + 2}:K${totalRow + 2}`),
  ];
  sheet["!cols"] = [
    { wch: 28 },
    { wch: 42 },
    { wch: 9 },
    { wch: 34 },
    { wch: 16 },
    { wch: 16 },
    { wch: 18 },
    { wch: 16 },
    { wch: 19 },
    { wch: 18 },
    { wch: 18 },
  ];
  sheet["!rows"] = [{ hpt: 30 }, { hpt: 20 }, { hpt: 32 }];
  sheet["!autofilter"] = { ref: `A5:K${lastVehicleRow}` };
  setNumberFormat(sheet, ["B2"], "dd.mm.yyyy hh:mm");
  setNumberFormat(
    sheet,
    Array.from({ length: vehicles.length }, (_, index) => `C${firstVehicleRow + index}`),
    INTEGER_FORMAT,
  );
  return sheet;
}

export function getKfzWorkpaperValidationErrors(vehicle: Vehicle, index = 0): string[] {
  return getKfzCalculationErrors(vehicle, index);
}

export function getKfzWorkpaperErrors(vehicles: Vehicle[]): string[] {
  return getKfzCalculationErrorsForVehicles(vehicles);
}

export async function createKfzWorkpaper(vehicles: Vehicle[]): Promise<KfzWorkpaperFile> {
  const errors = getKfzWorkpaperErrors(vehicles);
  if (errors.length > 0) throw new Error(errors[0]);

  const XLSX = await loadXlsx();
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, createOverviewSheet(XLSX, vehicles), "Übersicht");
  vehicles.forEach((vehicle, index) => {
    XLSX.utils.book_append_sheet(
      workbook,
      createVehicleSheet(XLSX, vehicle, index),
      `Fahrzeug ${index + 1}`,
    );
  });
  workbook.Props = {
    Title: "Kfz-Wertabgaben-Arbeitspapier",
    Subject: "Elektro-/Hybridprüfung, 1-%-Methode, Kostendeckelung, Umsatzsteuer und DATEV",
    Author: "steuerstoff · by Melanie",
    Company: "steuerstoff",
    CreatedDate: new Date(),
  };
  const bytes = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
    compression: true,
    cellDates: true,
  }) as ArrayBuffer;
  const years = [...new Set(vehicles.map((vehicle) => calculateKfz(vehicle).taxYear))].filter(
    (year): year is number => year != null,
  );
  const yearPart = years.length === 1 ? String(years[0]) : years.join("-");
  return {
    bytes,
    fileName: `kfz-wertabgabe-arbeitspapier-${yearPart || "ohne-jahr"}.xlsx`,
  };
}

export async function deliverKfzWorkpaper(
  bytes: ArrayBuffer,
  fileName: string,
): Promise<KfzWorkpaperDelivery> {
  const blob = new Blob([bytes], { type: XLSX_MIME });

  if (Capacitor.isNativePlatform() && navigator.share) {
    const file = new File([blob], fileName, { type: XLSX_MIME });
    const shareData: ShareData = {
      title: "Kfz-Wertabgaben-Arbeitspapier",
      text: "Excel-Arbeitspapier aus steuerstoff",
      files: [file],
    };
    const canShareFile = navigator.canShare ? navigator.canShare(shareData) : true;
    if (canShareFile) {
      await navigator.share(shareData);
      return { shared: true };
    }
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return { shared: false };
}
