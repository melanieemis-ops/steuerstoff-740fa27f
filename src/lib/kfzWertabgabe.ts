export type Nachweis = "ja" | "nein" | "unklar";

export interface CostRow {
  key: string;
  label: string;
  hint?: string;
  totalNet: string;
  withoutVat: string;
}

export interface Vehicle {
  id: string;
  bez: string;
  kennz: string;
  fuehrer: string;
  anschaffung: string;
  yearInput: string;
  blpInput: string;
  monateInput: string;
  distanceInput: string;
  workdaysInput: string;
  vatPrivateShareInput: string;
  nachweis: Nachweis;
  costs: CostRow[];
}

export interface Calc {
  taxYear: number | null;
  roundedListPrice: number | null;
  months: number | null;
  distanceKm: number | null;
  fullDistanceKm: number | null;
  workdays: number | null;
  onePercentValue: number | null;
  nonVatDeduction20: number | null;
  vatBaseBeforeCap: number | null;
  vatBeforeCap: number | null;
  commuteValue: number | null;
  distanceAllowanceRateLabel: string;
  nonDeductibleCommuteExpense: number | null;
  commuteCorrection: number | null;
  pauschalIncomeTaxValues: number | null;
  incomeTaxCorrectionBeforeCap: number | null;
  incomeTaxValuesAfterCap: number | null;
  incomeTaxCorrectionAfterCap: number | null;
  totalVehicleCostsNet: number;
  nonVatVehicleCosts: number;
  vatVehicleCostsNet: number;
  costCapApplies: boolean | null;
  vatPrivateSharePercent: number;
  vatBaseByEstimate: number | null;
  vatBase8921: number | null;
  vatDue: number | null;
  amount8924: number | null;
  totalBeforeCap: number | null;
  totalAfterCap: number | null;
  warnings: string[];
}

export function parseDe(input: string): number | null {
  const s = input.trim();
  if (!s) return null;
  const normalized = s.includes(",")
    ? s.replace(/\./g, "").replace(",", ".")
    : /^\d+\.\d{1,2}$/.test(s)
      ? s
      : s.replace(/\./g, "");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

export function distanceAllowanceRateLabel(year: number | null): string {
  if (year == null) return "Jahr fehlt";
  if (year >= 2026) return "0,38 €/km";
  if (year >= 2024) return "0,30 €/km bis 20 km; 0,38 €/km ab dem 21. km";
  if (year >= 2021) return "0,30 €/km bis 20 km; 0,35 €/km ab dem 21. km";
  return "0,30 €/km";
}

export function distanceAllowancePerDay(year: number, distanceKm: number): number {
  const fullKm = Math.max(0, Math.floor(distanceKm));
  if (year >= 2026) return fullKm * 0.38;
  if (year >= 2024) return Math.min(fullKm, 20) * 0.3 + Math.max(0, fullKm - 20) * 0.38;
  if (year >= 2021) return Math.min(fullKm, 20) * 0.3 + Math.max(0, fullKm - 20) * 0.35;
  return fullKm * 0.3;
}

export function calculateKfz(v: Vehicle): Calc {
  const blp = parseDe(v.blpInput);
  const yearValue = parseDe(v.yearInput);
  const taxYear = yearValue != null ? Math.trunc(yearValue) : null;
  const roundedListPrice = blp != null ? Math.floor(blp / 100) * 100 : null;
  const months = parseDe(v.monateInput);
  const distanceKm = parseDe(v.distanceInput);
  const fullDistanceKm = distanceKm != null ? Math.max(0, Math.floor(distanceKm)) : null;
  const workdays = parseDe(v.workdaysInput);

  const onePercentValue =
    roundedListPrice != null && months != null ? roundedListPrice * 0.01 * months : null;
  const nonVatDeduction20 = onePercentValue != null ? onePercentValue * 0.2 : null;
  const vatBaseBeforeCap =
    onePercentValue != null && nonVatDeduction20 != null
      ? onePercentValue - nonVatDeduction20
      : null;
  const vatBeforeCap = vatBaseBeforeCap != null ? vatBaseBeforeCap * 0.19 : null;

  const commuteValue =
    roundedListPrice != null && fullDistanceKm != null && months != null
      ? roundedListPrice * 0.0003 * fullDistanceKm * months
      : null;
  const nonDeductibleCommuteExpense =
    workdays != null && fullDistanceKm != null && taxYear != null
      ? workdays * distanceAllowancePerDay(taxYear, fullDistanceKm)
      : null;
  const commuteCorrection =
    commuteValue != null && nonDeductibleCommuteExpense != null
      ? Math.max(0, commuteValue - nonDeductibleCommuteExpense)
      : null;

  let totalVehicleCostsNet = 0;
  let nonVatVehicleCosts = 0;
  let hasVehicleCostInput = false;
  for (const c of v.costs) {
    const t = parseDe(c.totalNet);
    const nv = parseDe(c.withoutVat);
    if (t != null) {
      totalVehicleCostsNet += t;
      hasVehicleCostInput = true;
    }
    if (nv != null) nonVatVehicleCosts += nv;
  }
  const rawVatVehicleCostsNet = totalVehicleCostsNet - nonVatVehicleCosts;
  const vatVehicleCostsNet = Math.max(0, rawVatVehicleCostsNet);

  const pauschalIncomeTaxValues =
    onePercentValue != null && commuteValue != null ? onePercentValue + commuteValue : null;
  const incomeTaxCorrectionBeforeCap =
    onePercentValue != null && commuteCorrection != null
      ? onePercentValue + commuteCorrection
      : null;
  const costCapApplies =
    hasVehicleCostInput && totalVehicleCostsNet > 0 && pauschalIncomeTaxValues != null
      ? pauschalIncomeTaxValues > totalVehicleCostsNet
      : null;
  const incomeTaxValuesAfterCap =
    pauschalIncomeTaxValues != null
      ? costCapApplies === true
        ? totalVehicleCostsNet
        : pauschalIncomeTaxValues
      : null;
  const incomeTaxCorrectionAfterCap =
    costCapApplies === true && nonDeductibleCommuteExpense != null
      ? Math.max(0, totalVehicleCostsNet - nonDeductibleCommuteExpense)
      : incomeTaxCorrectionBeforeCap;

  const parsedVatPrivateShare = parseDe(v.vatPrivateShareInput);
  const vatPrivateSharePercent =
    parsedVatPrivateShare == null ? 50 : Math.min(100, Math.max(0, parsedVatPrivateShare));
  const vatBaseByEstimate =
    costCapApplies === true ? vatVehicleCostsNet * (vatPrivateSharePercent / 100) : null;
  const vatBase8921 = costCapApplies === true ? vatBaseByEstimate : vatBaseBeforeCap;
  const vatDue = vatBase8921 != null ? vatBase8921 * 0.19 : null;
  const amount8924 =
    incomeTaxCorrectionAfterCap != null && vatBase8921 != null
      ? incomeTaxCorrectionAfterCap - vatBase8921
      : null;

  const totalBeforeCap =
    incomeTaxCorrectionBeforeCap != null && vatBeforeCap != null
      ? incomeTaxCorrectionBeforeCap + vatBeforeCap
      : null;
  const totalAfterCap =
    incomeTaxCorrectionAfterCap != null && vatDue != null
      ? incomeTaxCorrectionAfterCap + vatDue
      : null;

  const warnings: string[] = [];
  if (blp == null) warnings.push("Bruttolistenpreis fehlt – 1-%-Berechnung nicht möglich.");
  if (taxYear == null)
    warnings.push("Veranlagungsjahr fehlt – Entfernungspauschale nicht berechenbar.");
  if (taxYear != null && taxYear > 2026)
    warnings.push(
      "Das gewählte Jahr liegt nach dem hinterlegten Rechtsstand 2026. Entfernungspauschale bitte prüfen.",
    );
  if (months == null) warnings.push("Nutzungsmonate fehlen.");
  if (months != null && (!Number.isInteger(months) || months < 0 || months > 12))
    warnings.push("Nutzungsmonate müssen als ganze Zahl zwischen 0 und 12 angegeben werden.");
  if (distanceKm != null && distanceKm !== fullDistanceKm)
    warnings.push(
      "Für die Entfernungspauschale werden nur volle Entfernungskilometer berücksichtigt.",
    );
  if (distanceKm != null && workdays == null)
    warnings.push("Arbeitstage fehlen – Berechnung Fahrten Wohnung/Betrieb prüfen.");
  if (v.nachweis !== "ja")
    warnings.push(
      "1-%-Methode setzt betriebliche Nutzung über 50 % voraus. Bitte Nachweis prüfen.",
    );
  if (!hasVehicleCostInput || totalVehicleCostsNet <= 0)
    warnings.push(
      "Kostendeckelung kann nicht geprüft werden, weil keine positiven Gesamtfahrzeugkosten erfasst sind.",
    );
  if (rawVatVehicleCostsNet < 0)
    warnings.push(
      "Kosten ohne Vorsteuer übersteigen die Gesamtfahrzeugkosten. Bitte Kostenaufteilung prüfen.",
    );
  if (costCapApplies === true)
    warnings.push(
      "Ertragsteuerliche Kostendeckelung greift: 1-%-Wert und 0,03-%-Wert werden zusammen auf die tatsächlichen Gesamtfahrzeugkosten begrenzt.",
    );
  if (costCapApplies === false) warnings.push("Ertragsteuerliche Kostendeckelung greift nicht.");
  if (costCapApplies === true && parsedVatPrivateShare == null)
    warnings.push(
      "Für die Umsatzsteuer-Schätzung wird mangels Eingabe ein Privatanteil von 50 % verwendet.",
    );
  if (costCapApplies === true && vatPrivateSharePercent < 50)
    warnings.push(
      "Ein USt-Privatanteil unter 50 % erfordert geeignete Unterlagen oder nachweisbare besondere Verhältnisse.",
    );
  if (parsedVatPrivateShare != null && (parsedVatPrivateShare < 0 || parsedVatPrivateShare > 100))
    warnings.push(
      "Der USt-Privatanteil wurde auf den zulässigen Bereich von 0 bis 100 % begrenzt.",
    );
  if (amount8924 != null && amount8924 > 0)
    warnings.push("Ein Anteil ist ohne Umsatzsteuer auf Konto 8924 auszuweisen.");
  if (amount8924 != null && amount8924 < 0)
    warnings.push("Anteil ohne USt ist negativ. Bitte Eingaben und Aufteilung prüfen.");
  if (commuteCorrection != null && commuteCorrection > 0)
    warnings.push("Fahrten Wohnung/Betrieb gesondert prüfen und außerbilanziell korrigieren.");

  return {
    taxYear,
    roundedListPrice,
    months,
    distanceKm,
    fullDistanceKm,
    workdays,
    onePercentValue,
    nonVatDeduction20,
    vatBaseBeforeCap,
    vatBeforeCap,
    commuteValue,
    distanceAllowanceRateLabel: distanceAllowanceRateLabel(taxYear),
    nonDeductibleCommuteExpense,
    commuteCorrection,
    pauschalIncomeTaxValues,
    incomeTaxCorrectionBeforeCap,
    incomeTaxValuesAfterCap,
    incomeTaxCorrectionAfterCap,
    totalVehicleCostsNet,
    nonVatVehicleCosts,
    vatVehicleCostsNet,
    costCapApplies,
    vatPrivateSharePercent,
    vatBaseByEstimate,
    vatBase8921,
    vatDue,
    amount8924,
    totalBeforeCap,
    totalAfterCap,
    warnings,
  };
}
