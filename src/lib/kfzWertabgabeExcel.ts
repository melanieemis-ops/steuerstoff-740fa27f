import { calculateKfz, parseDe, type Vehicle } from "./kfzWertabgabe.ts";

const EURO_FORMAT = "#,##0.00 [$€-407]";
const INTEGER_FORMAT = "0";
const PERCENT_FORMAT = "0.00%";
const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

type XlsxModule = typeof import("xlsx");
type Worksheet = import("xlsx").WorkSheet;
type CellValue = string | number | boolean | Date | null;

async function loadXlsx(): Promise<XlsxModule> {
  const module = await import("xlsx");
  return ("utils" in module ? module : module.default) as XlsxModule;
}

export interface KfzWorkpaperFile {
  bytes: ArrayBuffer;
  fileName: string;
}

export interface KfzWorkpaperDelivery {
  shared: boolean;
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

function getVehicleSheetRows(vehicle: Vehicle) {
  const firstCostRow = 32;
  const lastCostRow = firstCostRow + vehicle.costs.length - 1;
  const totalCostRow = lastCostRow + 1;
  const capSectionRow = totalCostRow + 2;
  const vatSectionRow = capSectionRow + 6;
  return {
    firstCostRow,
    lastCostRow,
    totalCostRow,
    capSectionRow,
    pauschalRow: capSectionRow + 1,
    capAppliesRow: capSectionRow + 2,
    cappedValueRow: capSectionRow + 3,
    incomeTaxCorrectionRow: capSectionRow + 4,
    vatSectionRow,
    vatShareRow: vatSectionRow + 1,
    vatOnePercentRow: vatSectionRow + 2,
    vatEstimateRow: vatSectionRow + 3,
    vatBaseRow: vatSectionRow + 4,
    vatDueRow: vatSectionRow + 5,
    amount8924Row: vatSectionRow + 6,
    totalBeforeRow: vatSectionRow + 7,
    totalAfterRow: vatSectionRow + 8,
    warningsSectionRow: vatSectionRow + 10,
  };
}

function createVehicleSheet(XLSX: XlsxModule, vehicle: Vehicle, index: number): Worksheet {
  const result = calculateKfz(vehicle);
  const enteredListPrice = safeNumber(parseDe(vehicle.blpInput));
  const year = safeNumber(result.taxYear);
  const months = safeNumber(result.months);
  const distance = safeNumber(result.distanceKm);
  const workdays = safeNumber(result.workdays);
  const vatPrivateShare = result.vatPrivateSharePercent / 100;

  const rows: CellValue[][] = [
    [`steuerstoff · Kfz-Wertabgabe · Fahrzeug ${index + 1}`, null, null, null],
    ["Erstellt am", new Date(), null, null],
    [
      "Arbeitspapier zur 1-%-Methode, Entfernungspauschale, Kostendeckelung und USt-Aufteilung",
      null,
      null,
      null,
    ],
    [null, null, null, null],
    ["1. Fahrzeugdaten", null, null, null],
    ["Fahrzeug / Bezeichnung", vehicle.bez || "—", null, null],
    ["PKW-Kennzeichen", vehicle.kennz || "—", null, null],
    ["Fahrzeugführer", vehicle.fuehrer || "—", null, null],
    ["Anschaffungsdatum", vehicle.anschaffung || "—", null, null],
    ["Veranlagungsjahr", year, null, null],
    ["Bruttolistenpreis eingegeben", enteredListPrice, null, null],
    ["Bruttolistenpreis abgerundet", safeNumber(result.roundedListPrice), null, null],
    ["Nutzungsmonate", months, null, null],
    ["Entfernung Wohnung–Betrieb (volle km)", distance, null, null],
    ["Arbeitstage", workdays, null, null],
    ["Nachweis betriebliche Nutzung > 50 %", vehicle.nachweis, null, null],
    [null, null, null, null],
    ["2. Privatfahrten — 1-%-Methode", null, null, null],
    ["1-%-Wert", safeNumber(result.onePercentValue), null, null],
    ["20-%-Abschlag nicht vorsteuerbelastet", safeNumber(result.nonVatDeduction20), null, null],
    ["BMG USt vor Kostendeckelung", safeNumber(result.vatBaseBeforeCap), null, null],
    ["USt 19 % vor Kostendeckelung", safeNumber(result.vatBeforeCap), null, null],
    [null, null, null, null],
    ["3. Fahrten Wohnung / Betrieb", null, null, null],
    ["0,03-%-Wert", safeNumber(result.commuteValue), null, null],
    [`Entfernungspauschale je Arbeitstag (${result.distanceAllowanceRateLabel})`, 0, null, null],
    ["Entfernungspauschale gesamt", safeNumber(result.nonDeductibleCommuteExpense), null, null],
    ["Positive Korrektur Fahrten W/B", safeNumber(result.commuteCorrection), null, null],
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
      "Pauschale Wertansätze (1 % + 0,03 %)",
      safeNumber(result.pauschalIncomeTaxValues),
      null,
      null,
    ],
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
    ["Geschätzter USt-Privatanteil", vatPrivateShare, null, null],
    ["BMG nach 1-%-Methode (80 %)", safeNumber(result.vatBaseBeforeCap), null, null],
    ["BMG aus USt-Schätzung", safeNumber(result.vatBaseByEstimate), null, null],
    ["Tatsächliche BMG ⇨ 8921 0", safeNumber(result.vatBase8921), null, null],
    ["Abzuführende USt 19 %", safeNumber(result.vatDue), null, null],
    ["Anteil ohne USt ⇨ 8924 0", safeNumber(result.amount8924), null, null],
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
      "Diese Berechnung ist eine Arbeitshilfe und ersetzt keine fachliche Prüfung.",
      null,
      null,
    ],
  ];

  const sheet = XLSX.utils.aoa_to_sheet(rows, { cellDates: true });
  const {
    firstCostRow,
    lastCostRow,
    totalCostRow,
    capSectionRow,
    pauschalRow,
    capAppliesRow,
    cappedValueRow,
    incomeTaxCorrectionRow,
    vatSectionRow,
    vatShareRow,
    vatOnePercentRow,
    vatEstimateRow,
    vatBaseRow,
    vatDueRow,
    amount8924Row,
    totalBeforeRow,
    totalAfterRow,
    warningsSectionRow,
  } = getVehicleSheetRows(vehicle);

  setFormula(
    sheet,
    "B12",
    "ROUNDDOWN(B11/100,0)*100",
    safeNumber(result.roundedListPrice),
    EURO_FORMAT,
  );
  setFormula(sheet, "B19", "B12*1%*B13", safeNumber(result.onePercentValue), EURO_FORMAT);
  setFormula(sheet, "B20", "B19*20%", safeNumber(result.nonVatDeduction20), EURO_FORMAT);
  setFormula(sheet, "B21", "B19-B20", safeNumber(result.vatBaseBeforeCap), EURO_FORMAT);
  setFormula(sheet, "B22", "B21*19%", safeNumber(result.vatBeforeCap), EURO_FORMAT);
  setFormula(
    sheet,
    "B25",
    "B12*0.03%*ROUNDDOWN(B14,0)*B13",
    safeNumber(result.commuteValue),
    EURO_FORMAT,
  );
  setFormula(
    sheet,
    "B26",
    "IF(B10>=2026,ROUNDDOWN(B14,0)*0.38,IF(B10>=2024,MIN(ROUNDDOWN(B14,0),20)*0.3+MAX(0,ROUNDDOWN(B14,0)-20)*0.38,IF(B10>=2021,MIN(ROUNDDOWN(B14,0),20)*0.3+MAX(0,ROUNDDOWN(B14,0)-20)*0.35,ROUNDDOWN(B14,0)*0.3)))",
    workdays > 0 ? safeNumber(result.nonDeductibleCommuteExpense) / workdays : 0,
    EURO_FORMAT,
  );
  setFormula(sheet, "B27", "B15*B26", safeNumber(result.nonDeductibleCommuteExpense), EURO_FORMAT);
  setFormula(sheet, "B28", "MAX(0,B25-B27)", safeNumber(result.commuteCorrection), EURO_FORMAT);

  for (let row = firstCostRow; row <= lastCostRow; row += 1) {
    const cost = vehicle.costs[row - firstCostRow];
    const vatCost = Math.max(
      0,
      safeNumber(parseDe(cost.totalNet)) - safeNumber(parseDe(cost.withoutVat)),
    );
    setFormula(sheet, `D${row}`, `MAX(0,B${row}-C${row})`, vatCost, EURO_FORMAT);
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
    "B19+B25",
    safeNumber(result.pauschalIncomeTaxValues),
    EURO_FORMAT,
  );
  setFormula(
    sheet,
    `B${capAppliesRow}`,
    `B${pauschalRow}>B${totalCostRow}`,
    result.costCapApplies === true,
  );
  setFormula(
    sheet,
    `B${cappedValueRow}`,
    `IF(B${capAppliesRow},B${totalCostRow},B${pauschalRow})`,
    safeNumber(result.incomeTaxValuesAfterCap),
    EURO_FORMAT,
  );
  setFormula(
    sheet,
    `B${incomeTaxCorrectionRow}`,
    `IF(B${capAppliesRow},MAX(0,B${totalCostRow}-B27),B19+B28)`,
    safeNumber(result.incomeTaxCorrectionAfterCap),
    EURO_FORMAT,
  );
  setFormula(
    sheet,
    `B${vatOnePercentRow}`,
    "B21",
    safeNumber(result.vatBaseBeforeCap),
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
    `IF(B${capAppliesRow},B${vatEstimateRow},B${vatOnePercentRow})`,
    safeNumber(result.vatBase8921),
    EURO_FORMAT,
  );
  setFormula(sheet, `B${vatDueRow}`, `B${vatBaseRow}*19%`, safeNumber(result.vatDue), EURO_FORMAT);
  setFormula(
    sheet,
    `B${amount8924Row}`,
    `B${incomeTaxCorrectionRow}-B${vatBaseRow}`,
    safeNumber(result.amount8924),
    EURO_FORMAT,
  );
  setFormula(
    sheet,
    `B${totalBeforeRow}`,
    "B19+B28+B22",
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
  setNumberFormat(sheet, ["B10", "B13", "B14", "B15"], INTEGER_FORMAT);
  setNumberFormat(sheet, ["B11", "B12"], EURO_FORMAT);
  setNumberFormat(sheet, [`B${vatShareRow}`], PERCENT_FORMAT);
  for (let row = 19; row <= totalAfterRow; row += 1) {
    if (sheet[`B${row}`]?.t === "n" && row !== vatShareRow) sheet[`B${row}`].z = EURO_FORMAT;
  }
  for (let row = firstCostRow; row <= totalCostRow; row += 1) {
    setNumberFormat(sheet, [`B${row}`, `C${row}`, `D${row}`], EURO_FORMAT);
  }

  addSectionMerges(XLSX, sheet, [5, 18, 24, 30, capSectionRow, vatSectionRow, warningsSectionRow]);
  sheet["!cols"] = [{ wch: 58 }, { wch: 22 }, { wch: 22 }, { wch: 22 }];
  sheet["!rows"] = [{ hpt: 28 }, { hpt: 20 }, { hpt: 34 }];
  sheet["!autofilter"] = { ref: `A31:D${lastCostRow}` };
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
    ["steuerstoff · Kfz-Wertabgaben · Übersicht", null, null, null, null, null, null, null],
    ["Erstellt am", new Date(), null, null, null, null, null, null],
    [
      "Arbeitspapier – Detailberechnungen befinden sich in den folgenden Fahrzeugblättern.",
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ],
    [null, null, null, null, null, null, null, null],
    [
      "Fahrzeug",
      "Kennzeichen",
      "Jahr",
      "BMG ⇨ 8921 0",
      "USt 19 %",
      "Betrag ⇨ 8924 0",
      "Korrektur W/B",
      "Gesamtwert",
    ],
    ...vehicles.map((vehicle) => [
      vehicle.bez || "Ohne Bezeichnung",
      vehicle.kennz || "—",
      safeNumber(calculateKfz(vehicle).taxYear),
      0,
      0,
      0,
      0,
      0,
    ]),
    ["Gesamtsummen", null, null, 0, 0, 0, 0, 0],
    [null, null, null, null, null, null, null, null],
    [
      "Review-Hinweis",
      "Diese Berechnung ist eine Arbeitshilfe und ersetzt keine fachliche Prüfung.",
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
    setFormula(
      sheet,
      `D${row}`,
      `'${sheetName}'!B${detailRows.vatBaseRow}`,
      safeNumber(result.vatBase8921),
      EURO_FORMAT,
    );
    setFormula(
      sheet,
      `E${row}`,
      `'${sheetName}'!B${detailRows.vatDueRow}`,
      safeNumber(result.vatDue),
      EURO_FORMAT,
    );
    setFormula(
      sheet,
      `F${row}`,
      `'${sheetName}'!B${detailRows.amount8924Row}`,
      safeNumber(result.amount8924),
      EURO_FORMAT,
    );
    setFormula(
      sheet,
      `G${row}`,
      `'${sheetName}'!B28`,
      safeNumber(result.commuteCorrection),
      EURO_FORMAT,
    );
    setFormula(
      sheet,
      `H${row}`,
      `'${sheetName}'!B${detailRows.totalAfterRow}`,
      safeNumber(result.totalAfterCap),
      EURO_FORMAT,
    );
  });
  for (const column of ["D", "E", "F", "G", "H"]) {
    const total = vehicles.reduce((sum, vehicle) => {
      const result = calculateKfz(vehicle);
      const value =
        column === "D"
          ? result.vatBase8921
          : column === "E"
            ? result.vatDue
            : column === "F"
              ? result.amount8924
              : column === "G"
                ? result.commuteCorrection
                : result.totalAfterCap;
      return sum + safeNumber(value);
    }, 0);
    setFormula(
      sheet,
      `${column}${totalRow}`,
      `SUM(${column}${firstVehicleRow}:${column}${lastVehicleRow})`,
      total,
      EURO_FORMAT,
    );
  }

  sheet["!merges"] = [
    XLSX.utils.decode_range("A1:H1"),
    XLSX.utils.decode_range("A3:H3"),
    XLSX.utils.decode_range(`A${totalRow + 2}:H${totalRow + 2}`),
  ];
  sheet["!cols"] = [
    { wch: 28 },
    { wch: 18 },
    { wch: 10 },
    { wch: 18 },
    { wch: 16 },
    { wch: 19 },
    { wch: 18 },
    { wch: 18 },
  ];
  sheet["!rows"] = [{ hpt: 30 }, { hpt: 20 }, { hpt: 32 }];
  sheet["!autofilter"] = { ref: `A5:H${lastVehicleRow}` };
  setNumberFormat(sheet, ["B2"], "dd.mm.yyyy hh:mm");
  setNumberFormat(
    sheet,
    Array.from({ length: vehicles.length }, (_, index) => `C${firstVehicleRow + index}`),
    INTEGER_FORMAT,
  );
  return sheet;
}

export function getKfzWorkpaperValidationErrors(vehicle: Vehicle, index = 0): string[] {
  const prefix = `Fahrzeug ${index + 1}`;
  const result = calculateKfz(vehicle);
  const errors: string[] = [];

  if (result.taxYear == null) errors.push(`${prefix}: Veranlagungsjahr fehlt.`);
  if (result.roundedListPrice == null || result.roundedListPrice <= 0)
    errors.push(`${prefix}: Bruttolistenpreis fehlt.`);
  if (
    result.months == null ||
    !Number.isInteger(result.months) ||
    result.months < 1 ||
    result.months > 12
  )
    errors.push(`${prefix}: Nutzungsmonate müssen zwischen 1 und 12 liegen.`);
  if (result.distanceKm == null || result.distanceKm < 0)
    errors.push(`${prefix}: Entfernung fehlt.`);
  if (result.workdays == null || result.workdays < 0) errors.push(`${prefix}: Arbeitstage fehlen.`);
  if (vehicle.nachweis !== "ja")
    errors.push(`${prefix}: Nachweis der betrieblichen Nutzung über 50 % fehlt.`);
  if (result.totalVehicleCostsNet <= 0)
    errors.push(`${prefix}: Positive Gesamtfahrzeugkosten fehlen.`);
  if (result.nonVatVehicleCosts > result.totalVehicleCostsNet)
    errors.push(`${prefix}: Kosten ohne Vorsteuer übersteigen die Gesamtkosten.`);
  if (
    result.vatBase8921 == null ||
    result.vatDue == null ||
    result.amount8924 == null ||
    result.totalAfterCap == null
  )
    errors.push(`${prefix}: Berechnung ist noch nicht vollständig.`);
  if (result.amount8924 != null && result.amount8924 < 0)
    errors.push(`${prefix}: Der Anteil ohne Umsatzsteuer ist negativ.`);

  return errors;
}

export function getKfzWorkpaperErrors(vehicles: Vehicle[]): string[] {
  if (vehicles.length === 0) return ["Mindestens ein Fahrzeug ist erforderlich."];
  return vehicles.flatMap((vehicle, index) => getKfzWorkpaperValidationErrors(vehicle, index));
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
    Subject: "1-%-Methode, Kostendeckelung und Umsatzsteuer",
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
  const file = new File([blob], fileName, { type: XLSX_MIME });
  const shareData: ShareData = {
    title: "Kfz-Wertabgaben-Arbeitspapier",
    text: "Excel-Arbeitspapier aus steuerstoff",
    files: [file],
  };

  if (navigator.share && navigator.canShare?.(shareData)) {
    await navigator.share(shareData);
    return { shared: true };
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
  return { shared: false };
}
