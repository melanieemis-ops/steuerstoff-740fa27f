export type Nachweis = "ja" | "nein" | "unklar";
export type VehicleType = "combustion" | "electric" | "plugin-hybrid";
export type ElectricBenefitType = "none" | "half" | "quarter" | "battery-deduction";
export type VatEvidence = "ja" | "nein";

export interface CostRow {
  key: string;
  label: string;
  hint?: string;
  totalNet: string;
  withoutVat: string;
}

export interface CostAllocation {
  key: string;
  label: string;
  totalNet: number | null;
  withoutVat: number | null;
  withVat: number | null;
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
  vehicleType?: VehicleType;
  firstRegistration?: string;
  co2Input?: string;
  electricRangeInput?: string;
  batteryCapacityInput?: string;
  vehicleCode?: string;
  classificationNote?: string;
  vatEvidence?: VatEvidence;
}

export interface ElectricVehicleBenefit {
  benefitType: ElectricBenefitType;
  taxableListPriceFactor: number | null;
  reductionPercent: number | null;
  batteryDeduction: number | null;
  applicableRule: string;
  explanation: string;
  warnings: string[];
}

export interface Calc {
  vehicleType: VehicleType;
  taxYear: number | null;
  acquisitionYear: number | null;
  firstRegistrationYear: number | null;
  electricBenefit: ElectricVehicleBenefit;
  originalListPrice: number | null;
  originalRoundedListPrice: number | null;
  incomeTaxRelevantListPrice: number | null;
  vatRelevantListPrice: number | null;
  /** @deprecated Kompatibilitätsfeld: entspricht incomeTaxRelevantListPrice. */
  roundedListPrice: number | null;
  months: number | null;
  distanceKm: number | null;
  fullDistanceKm: number | null;
  workdays: number | null;
  monthlyPrivateUseIncomeTax: number | null;
  privateUseIncomeTax: number | null;
  /** Kompatibilitätsfeld: ertragsteuerlicher Zeitraumwert der 1-%-Methode. */
  onePercentValue: number | null;
  vatOnePercentValue: number | null;
  vatNonInputTaxDeduction: number | null;
  /** Kompatibilitätsfeld: entspricht vatNonInputTaxDeduction. */
  nonVatDeduction20: number | null;
  vatBaseBeforeCap: number | null;
  vatBeforeCap: number | null;
  commuteValue: number | null;
  distanceAllowanceRateLabel: string;
  distanceAllowancePerDayValue: number | null;
  nonDeductibleCommuteExpense: number | null;
  commuteCorrection: number | null;
  pauschalIncomeTaxValues: number | null;
  incomeTaxCorrectionBeforeCap: number | null;
  incomeTaxValuesAfterCap: number | null;
  incomeTaxCorrectionAfterCap: number | null;
  costAllocations: CostAllocation[];
  totalVehicleCostsNet: number;
  nonVatVehicleCosts: number;
  vatVehicleCostsNet: number | null;
  leasingRentalVatCostsNet: number | null;
  leasingRentalNonVatCosts: number | null;
  otherVatCostsNet: number | null;
  otherNonVatCosts: number | null;
  costCapApplies: boolean | null;
  vatEvidenceAvailable: boolean;
  vatPrivateSharePercent: number | null;
  vatBaseByEstimate: number | null;
  vatDueByEstimate: number | null;
  vatBase8921: number | null;
  vatDue: number | null;
  rawAmount8924: number | null;
  amount8924: number | null;
  totalBeforeCap: number | null;
  totalAfterCap: number | null;
  warnings: string[];
}

interface ParsedDate {
  year: number;
  month: number;
  day: number;
  key: number;
}

interface BatteryRule {
  amountPerKwh: number;
  maximum: number;
}

const LEASING_RENTAL_KEYS = new Set(["leasing", "miete", "leasingsonderzahlung"]);

export function parseDe(input: string | undefined): number | null {
  const s = input?.trim() ?? "";
  if (!s) return null;
  const normalized = s.includes(",")
    ? s.replace(/\./g, "").replace(",", ".")
    : /^\d+\.\d{1,2}$/.test(s)
      ? s
      : s.replace(/\./g, "");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

export function parseDateInput(input: string | undefined): ParsedDate | null {
  const value = input?.trim() ?? "";
  const german = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(value);
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(value);
  const year = german ? Number(german[3]) : iso ? Number(iso[1]) : Number.NaN;
  const month = german ? Number(german[2]) : iso ? Number(iso[2]) : Number.NaN;
  const day = german ? Number(german[1]) : iso ? Number(iso[3]) : Number.NaN;
  if (![year, month, day].every(Number.isInteger)) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  )
    return null;
  return { year, month, day, key: year * 10_000 + month * 100 + day };
}

export function roundListPrice(value: number | null): number | null {
  if (value == null || !Number.isFinite(value) || value < 0) return null;
  return Math.floor(value / 100) * 100;
}

function batteryRuleForYear(year: number): BatteryRule | null {
  if (year <= 2013) return { amountPerKwh: 500, maximum: 10_000 };
  if (year <= 2022)
    return {
      amountPerKwh: 500 - (year - 2013) * 50,
      maximum: 10_000 - (year - 2013) * 500,
    };
  return null;
}

function unresolvedBenefit(
  applicableRule: string,
  explanation: string,
  warnings: string[],
): ElectricVehicleBenefit {
  return {
    benefitType: "none",
    taxableListPriceFactor: null,
    reductionPercent: null,
    batteryDeduction: null,
    applicableRule,
    explanation,
    warnings,
  };
}

function fractionBenefit(
  benefitType: "half" | "quarter",
  applicableRule: string,
  explanation: string,
  warnings: string[] = [],
): ElectricVehicleBenefit {
  const taxableListPriceFactor = benefitType === "quarter" ? 0.25 : 0.5;
  return {
    benefitType,
    taxableListPriceFactor,
    reductionPercent: (1 - taxableListPriceFactor) * 100,
    batteryDeduction: 0,
    applicableRule,
    explanation,
    warnings,
  };
}

function noBenefit(explanation: string, warnings: string[] = []): ElectricVehicleBenefit {
  return {
    benefitType: "none",
    taxableListPriceFactor: 1,
    reductionPercent: 0,
    batteryDeduction: 0,
    applicableRule: "Regelansatz – § 6 Abs. 1 Nr. 4 Satz 2 EStG",
    explanation,
    warnings,
  };
}

function electricQuarterLimit(acquisitionKey: number): number {
  if (acquisitionKey >= 20_250_701) return 100_000;
  if (acquisitionKey >= 20_240_101) return 70_000;
  return 60_000;
}

function batteryBenefit(
  vehicle: Vehicle,
  originalListPrice: number,
  acquisition: ParsedDate,
  warnings: string[],
): ElectricVehicleBenefit {
  const firstRegistration = parseDateInput(vehicle.firstRegistration);
  const batteryCapacity = parseDe(vehicle.batteryCapacityInput);
  if (!firstRegistration)
    return unresolvedBenefit(
      "Pauschaler Batterieabschlag – § 6 Abs. 1 Nr. 4 Satz 2 Nr. 1 EStG",
      "Für den Batterieabschlag muss das Jahr der Erstzulassung geprüft werden.",
      [...warnings, "Erstzulassungsdatum fehlt oder ist ungültig."],
    );
  if (batteryCapacity == null || batteryCapacity <= 0)
    return unresolvedBenefit(
      "Pauschaler Batterieabschlag – § 6 Abs. 1 Nr. 4 Satz 2 Nr. 1 EStG",
      "Die Batteriekapazität ist für den pauschalen Abschlag erforderlich.",
      [...warnings, "Batteriekapazität fehlt oder ist nicht positiv."],
    );
  const isUsedVehicle = firstRegistration.key < acquisition.key;
  const tableYear = isUsedVehicle ? firstRegistration.year : acquisition.year;
  const rule = batteryRuleForYear(tableYear);
  if (!rule)
    return noBenefit(
      "Für das maßgebliche Jahr ist kein pauschaler Batterieabschlag vorgesehen.",
      warnings,
    );

  const batteryDeduction = Math.min(
    originalListPrice,
    batteryCapacity * rule.amountPerKwh,
    rule.maximum,
  );
  return {
    benefitType: "battery-deduction",
    taxableListPriceFactor: 1,
    reductionPercent: originalListPrice > 0 ? (batteryDeduction / originalListPrice) * 100 : null,
    batteryDeduction,
    applicableRule: "Pauschaler Batterieabschlag – § 6 Abs. 1 Nr. 4 Satz 2 Nr. 1 EStG",
    explanation: `${isUsedVehicle ? "Gebrauchtfahrzeug: Erstzulassungsjahr" : "Anschaffungsjahr"} ${tableYear}, ${rule.amountPerKwh} € je kWh, höchstens ${rule.maximum.toLocaleString("de-DE")} €.`,
    warnings,
  };
}

export function determineElectricVehicleBenefit(vehicle: Vehicle): ElectricVehicleBenefit {
  const vehicleType = vehicle.vehicleType ?? "combustion";
  if (vehicleType === "combustion")
    return noBenefit("Für Verbrenner und sonstige Fahrzeuge gilt der ungekürzte Listenpreis.");

  const acquisition = parseDateInput(vehicle.anschaffung);
  const originalListPrice = parseDe(vehicle.blpInput);
  const warnings: string[] = [];
  if (!acquisition)
    return unresolvedBenefit(
      "Prüfung nicht möglich",
      "Der Anschaffungszeitpunkt bestimmt die anwendbare Elektro-/Hybridregelung.",
      ["Anschaffungsdatum fehlt oder ist ungültig."],
    );
  if (originalListPrice == null || originalListPrice <= 0)
    return unresolvedBenefit(
      "Prüfung nicht möglich",
      "Die Begünstigung kann ohne positiven ursprünglichen Bruttolistenpreis nicht geprüft werden.",
      ["Bruttolistenpreis fehlt oder ist nicht positiv."],
    );
  if (acquisition.key < 20_130_101)
    warnings.push(
      "Der Anschaffungszeitpunkt liegt vor dem hinterlegten Anwendungszeitraum ab 2013. Einzelfall prüfen.",
    );
  if (acquisition.key >= 20_310_101)
    return noBenefit(
      "Der Anschaffungszeitpunkt liegt nach dem hinterlegten Förderzeitraum bis 31.12.2030.",
      [
        ...warnings,
        "Anschaffung nach dem hinterlegten Rechtsstand: Begünstigung fachlich neu prüfen.",
      ],
    );

  if (vehicleType === "electric") {
    const co2 = parseDe(vehicle.co2Input);
    if (co2 != null && co2 !== 0)
      return unresolvedBenefit(
        "Fahrzeugeinordnung widersprüchlich",
        "Ein reines Elektrofahrzeug darf keine CO₂-Emission je gefahrenem Kilometer haben.",
        [...warnings, "CO₂-Angabe widerspricht der Auswahl „Reines Elektrofahrzeug“."],
      );
    if (acquisition.key >= 20_190_101) {
      const quarterLimit = electricQuarterLimit(acquisition.key);
      if (originalListPrice <= quarterLimit)
        return fractionBenefit(
          "quarter",
          "Viertelansatz – § 6 Abs. 1 Nr. 4 Satz 2 Nr. 3 EStG",
          `Reines Elektrofahrzeug ohne CO₂-Emissionen; der Listenpreis überschreitet die für den Anschaffungszeitpunkt geltende Grenze von ${quarterLimit.toLocaleString("de-DE")} € nicht.`,
          warnings,
        );
      return fractionBenefit(
        "half",
        "Halbansatz – § 6 Abs. 1 Nr. 4 Satz 2 Nr. 2 bis 5 EStG",
        `Der Listenpreis überschreitet die Grenze von ${quarterLimit.toLocaleString("de-DE")} € für den Viertelansatz. Für das reine Elektrofahrzeug wird nachrangig der Halbansatz angewendet.`,
        warnings,
      );
    }
    return batteryBenefit(vehicle, originalListPrice, acquisition, warnings);
  }

  const co2 = parseDe(vehicle.co2Input);
  const electricRange = parseDe(vehicle.electricRangeInput);
  if (co2 == null || electricRange == null)
    return unresolvedBenefit(
      "Prüfung Plug-in-Hybrid nicht vollständig",
      "Für die Einordnung des Plug-in-Hybrids sind CO₂-Ausstoß und elektrische Reichweite anhand der Fahrzeugunterlagen zu erfassen.",
      [
        ...warnings,
        ...(co2 == null ? ["CO₂-Ausstoß fehlt oder ist ungültig."] : []),
        ...(electricRange == null ? ["Elektrische Reichweite fehlt oder ist ungültig."] : []),
      ],
    );
  if (co2 < 0 || electricRange < 0)
    return unresolvedBenefit(
      "Prüfung Plug-in-Hybrid nicht vollständig",
      "CO₂-Ausstoß und elektrische Reichweite dürfen nicht negativ sein.",
      [...warnings, "Negative Fahrzeugwerte sind unzulässig."],
    );

  if (acquisition.key >= 20_190_101 && acquisition.key < 20_310_101) {
    const minimumRange = acquisition.key < 20_220_101 ? 40 : acquisition.key < 20_250_101 ? 60 : 80;
    const qualifiesByCo2 = co2 <= 50;
    const qualifiesByRange = electricRange >= minimumRange;
    if (qualifiesByCo2 || qualifiesByRange)
      return fractionBenefit(
        "half",
        "Halbansatz – § 6 Abs. 1 Nr. 4 Satz 2 Nr. 2, 4 oder 5 EStG",
        qualifiesByCo2
          ? `Das CO₂-Kriterium von höchstens 50 g/km ist erfüllt (${co2} g/km).`
          : `Die elektrische Mindestreichweite von ${minimumRange} km ist erfüllt (${electricRange} km).`,
        warnings,
      );
    if (acquisition.key < 20_230_101)
      return batteryBenefit(vehicle, originalListPrice, acquisition, warnings);
    return noBenefit(
      `Weder das CO₂-Kriterium von höchstens 50 g/km noch die elektrische Mindestreichweite von ${minimumRange} km ist erfüllt.`,
      warnings,
    );
  }

  if (acquisition.key < 20_230_101)
    return batteryBenefit(vehicle, originalListPrice, acquisition, warnings);
  return noBenefit("Für den Anschaffungszeitpunkt ist keine Begünstigung hinterlegt.", warnings);
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

function validPercentage(value: number | null): number | null {
  return value != null && value >= 0 && value <= 100 ? value : null;
}

export function calculateKfz(vehicle: Vehicle): Calc {
  const vehicleType = vehicle.vehicleType ?? "combustion";
  const originalListPrice = parseDe(vehicle.blpInput);
  const originalRoundedListPrice = roundListPrice(originalListPrice);
  const acquisition = parseDateInput(vehicle.anschaffung);
  const firstRegistration = parseDateInput(vehicle.firstRegistration);
  const yearValue = parseDe(vehicle.yearInput);
  const taxYear = yearValue != null ? Math.trunc(yearValue) : null;
  const electricBenefit = determineElectricVehicleBenefit(vehicle);
  const benefitBase =
    originalListPrice != null && originalListPrice > 0
      ? electricBenefit.benefitType === "battery-deduction"
        ? electricBenefit.batteryDeduction != null
          ? Math.max(0, originalListPrice - electricBenefit.batteryDeduction)
          : null
        : electricBenefit.taxableListPriceFactor != null
          ? originalListPrice * electricBenefit.taxableListPriceFactor
          : null
      : null;
  const incomeTaxRelevantListPrice = roundListPrice(benefitBase);
  const vatRelevantListPrice = originalRoundedListPrice;
  const months = parseDe(vehicle.monateInput);
  const validMonths =
    months != null && Number.isInteger(months) && months >= 1 && months <= 12 ? months : null;
  const distanceKm = parseDe(vehicle.distanceInput);
  const fullDistanceKm = distanceKm != null && distanceKm >= 0 ? Math.floor(distanceKm) : null;
  const workdays = parseDe(vehicle.workdaysInput);

  const monthlyPrivateUseIncomeTax =
    incomeTaxRelevantListPrice != null ? incomeTaxRelevantListPrice * 0.01 : null;
  const privateUseIncomeTax =
    monthlyPrivateUseIncomeTax != null && validMonths != null
      ? monthlyPrivateUseIncomeTax * validMonths
      : null;
  const vatOnePercentValue =
    vatRelevantListPrice != null && validMonths != null
      ? vatRelevantListPrice * 0.01 * validMonths
      : null;
  const vatNonInputTaxDeduction = vatOnePercentValue != null ? vatOnePercentValue * 0.2 : null;
  const vatBaseBeforeCap =
    vatOnePercentValue != null && vatNonInputTaxDeduction != null
      ? vatOnePercentValue - vatNonInputTaxDeduction
      : null;
  const vatBeforeCap = vatBaseBeforeCap != null ? vatBaseBeforeCap * 0.19 : null;

  const commuteValue =
    incomeTaxRelevantListPrice != null && fullDistanceKm != null && validMonths != null
      ? incomeTaxRelevantListPrice * 0.0003 * fullDistanceKm * validMonths
      : null;
  const distanceAllowancePerDayValue =
    fullDistanceKm != null && taxYear != null
      ? distanceAllowancePerDay(taxYear, fullDistanceKm)
      : null;
  const nonDeductibleCommuteExpense =
    workdays != null && workdays >= 0 && distanceAllowancePerDayValue != null
      ? workdays * distanceAllowancePerDayValue
      : null;
  const commuteCorrection =
    commuteValue != null && nonDeductibleCommuteExpense != null
      ? Math.max(0, commuteValue - nonDeductibleCommuteExpense)
      : null;

  let totalVehicleCostsNet = 0;
  let nonVatVehicleCosts = 0;
  let leasingRentalVatCostsNet = 0;
  let leasingRentalNonVatCosts = 0;
  let otherVatCostsNet = 0;
  let otherNonVatCosts = 0;
  let hasVehicleCostInput = false;
  let invalidCostAllocation = false;
  let incompleteCostAllocation = false;
  const costAllocations: CostAllocation[] = [];
  for (const cost of vehicle.costs) {
    const total = parseDe(cost.totalNet);
    const withoutVat = parseDe(cost.withoutVat);
    if (total != null) {
      totalVehicleCostsNet += total;
      hasVehicleCostInput = true;
    }
    if (withoutVat != null) nonVatVehicleCosts += withoutVat;
    if ((total == null) !== (withoutVat == null)) incompleteCostAllocation = true;
    if (total != null && withoutVat != null && withoutVat > total) invalidCostAllocation = true;
    const vatValue =
      total != null && withoutVat != null && withoutVat <= total
        ? Math.max(0, total - withoutVat)
        : null;
    costAllocations.push({
      key: cost.key,
      label: cost.label,
      totalNet: total,
      withoutVat,
      withVat: vatValue,
    });
    const nonVatValue = withoutVat ?? 0;
    if (LEASING_RENTAL_KEYS.has(cost.key)) {
      leasingRentalVatCostsNet += vatValue ?? 0;
      leasingRentalNonVatCosts += nonVatValue;
    } else {
      otherVatCostsNet += vatValue ?? 0;
      otherNonVatCosts += nonVatValue;
    }
  }
  const rawVatVehicleCostsNet = totalVehicleCostsNet - nonVatVehicleCosts;
  const costAllocationUsable =
    !incompleteCostAllocation && !invalidCostAllocation && rawVatVehicleCostsNet >= 0;
  const vatVehicleCostsNet = costAllocationUsable ? rawVatVehicleCostsNet : null;
  const leasingRentalVatCostsResult = costAllocationUsable ? leasingRentalVatCostsNet : null;
  const leasingRentalNonVatCostsResult = costAllocationUsable ? leasingRentalNonVatCosts : null;
  const otherVatCostsResult = costAllocationUsable ? otherVatCostsNet : null;
  const otherNonVatCostsResult = costAllocationUsable ? otherNonVatCosts : null;

  const pauschalIncomeTaxValues =
    privateUseIncomeTax != null && commuteValue != null ? privateUseIncomeTax + commuteValue : null;
  const incomeTaxCorrectionBeforeCap =
    privateUseIncomeTax != null && commuteCorrection != null
      ? privateUseIncomeTax + commuteCorrection
      : null;
  const costCapApplies =
    hasVehicleCostInput && totalVehicleCostsNet > 0 && pauschalIncomeTaxValues != null
      ? pauschalIncomeTaxValues > totalVehicleCostsNet
      : null;
  const incomeTaxValuesAfterCap =
    costCapApplies === true
      ? totalVehicleCostsNet
      : costCapApplies === false
        ? pauschalIncomeTaxValues
        : null;
  const incomeTaxCorrectionAfterCap =
    costCapApplies === true && nonDeductibleCommuteExpense != null
      ? Math.max(0, totalVehicleCostsNet - nonDeductibleCommuteExpense)
      : costCapApplies === false
        ? incomeTaxCorrectionBeforeCap
        : null;

  const vatEvidenceAvailable = (vehicle.vatEvidence ?? "nein") === "ja";
  const parsedVatPrivateShare = parseDe(vehicle.vatPrivateShareInput);
  const hasVatPrivateShareInput = (vehicle.vatPrivateShareInput?.trim() ?? "") !== "";
  const vatPrivateSharePercent = hasVatPrivateShareInput
    ? validPercentage(parsedVatPrivateShare)
    : vatEvidenceAvailable
      ? null
      : 50;
  const vatBaseByEstimate =
    costCapApplies === true && vatPrivateSharePercent != null && vatVehicleCostsNet != null
      ? vatVehicleCostsNet * (vatPrivateSharePercent / 100)
      : null;
  const vatDueByEstimate = vatBaseByEstimate != null ? vatBaseByEstimate * 0.19 : null;
  const vatBase8921 =
    costCapApplies === true
      ? vatBaseByEstimate
      : costCapApplies === false
        ? vatBaseBeforeCap
        : null;
  const vatDue =
    costCapApplies === true ? vatDueByEstimate : vatBase8921 != null ? vatBase8921 * 0.19 : null;
  const rawAmount8924 =
    incomeTaxCorrectionAfterCap != null && vatBase8921 != null
      ? incomeTaxCorrectionAfterCap - vatBase8921
      : null;
  const amount8924 = rawAmount8924 != null ? Math.max(0, rawAmount8924) : null;

  const totalBeforeCap =
    incomeTaxCorrectionBeforeCap != null && vatBeforeCap != null
      ? incomeTaxCorrectionBeforeCap + vatBeforeCap
      : null;
  const totalAfterCap =
    incomeTaxCorrectionAfterCap != null && vatDue != null
      ? incomeTaxCorrectionAfterCap + vatDue
      : null;

  const warnings = [...electricBenefit.warnings];
  if (originalListPrice == null || originalListPrice <= 0)
    warnings.push("Bruttolistenpreis fehlt oder ist nicht positiv.");
  if (!acquisition) warnings.push("Anschaffungsdatum fehlt oder ist ungültig.");
  if (taxYear == null)
    warnings.push("Veranlagungsjahr fehlt – Entfernungspauschale nicht berechenbar.");
  if (taxYear != null && taxYear > 2026)
    warnings.push(
      "Das gewählte Jahr liegt nach dem hinterlegten Rechtsstand 2026. Entfernungspauschale und Begünstigungen bitte prüfen.",
    );
  if (months == null) warnings.push("Nutzungsmonate fehlen.");
  if (months != null && validMonths == null)
    warnings.push("Nutzungsmonate müssen als ganze Zahl zwischen 1 und 12 angegeben werden.");
  if (distanceKm == null) warnings.push("Entfernung Wohnung–Betriebsstätte fehlt.");
  if (distanceKm != null && distanceKm < 0) warnings.push("Entfernung darf nicht negativ sein.");
  if (distanceKm != null && fullDistanceKm != null && distanceKm !== fullDistanceKm)
    warnings.push(
      "Für 0,03-%-Wert und Entfernungspauschale werden nur volle Entfernungskilometer berücksichtigt.",
    );
  if (workdays == null) warnings.push("Arbeitstage fehlen.");
  if (workdays != null && workdays < 0) warnings.push("Arbeitstage dürfen nicht negativ sein.");
  if (vehicle.nachweis !== "ja")
    warnings.push(
      "Die 1-%-Methode setzt eine betriebliche Nutzung von mehr als 50 % voraus. Nachweis prüfen.",
    );
  if (!hasVehicleCostInput || totalVehicleCostsNet <= 0)
    warnings.push("Kostendeckelung nicht prüfbar: Es fehlen positive Gesamtfahrzeugkosten.");
  if (incompleteCostAllocation)
    warnings.push(
      "Kostenaufteilung unvollständig: Bei erfassten Kosten muss der Anteil ohne Vorsteuer ausdrücklich angegeben werden; gegebenenfalls 0 €.",
    );
  if (invalidCostAllocation || rawVatVehicleCostsNet < 0)
    warnings.push(
      "Kosten ohne Vorsteuer übersteigen die zugehörigen Gesamtfahrzeugkosten. Kostenaufteilung prüfen.",
    );
  if (costCapApplies === true)
    warnings.push(
      "Ertragsteuerliche Kostendeckelung greift. Die Umsatzsteuer wird davon getrennt sachgerecht geschätzt.",
    );
  if (costCapApplies === false) warnings.push("Ertragsteuerliche Kostendeckelung greift nicht.");
  if (costCapApplies === true && !vatEvidenceAvailable && !hasVatPrivateShareInput)
    warnings.push(
      "Mangels geeigneter Unterlagen wird für die Umsatzsteuer widerlegbar ein Privatanteil von 50 % geschätzt.",
    );
  if (costCapApplies === true && vatEvidenceAvailable && vatPrivateSharePercent == null)
    warnings.push(
      "Geeignete Unterlagen sind vorhanden; der daraus abgeleitete USt-Privatanteil fehlt.",
    );
  if (hasVatPrivateShareInput && vatPrivateSharePercent == null)
    warnings.push("Der USt-Privatanteil muss zwischen 0 % und 100 % liegen.");
  if (vatPrivateSharePercent != null && vatPrivateSharePercent < 50)
    warnings.push(
      "Ein USt-Privatanteil unter 50 % erfordert geeignete Unterlagen oder nachweisbare besondere Verhältnisse.",
    );
  if (rawAmount8924 != null && rawAmount8924 < 0)
    warnings.push(
      "Die rechnerische Differenz für Konto 8924 wäre negativ. Es werden 0 € ausgegeben; Eingaben und fachliche Zuordnung prüfen.",
    );
  if (commuteCorrection != null && commuteCorrection > 0)
    warnings.push(
      "Fahrten Wohnung–Betriebsstätte gesondert prüfen und außerbilanziell korrigieren.",
    );
  if (vehicleType !== "combustion")
    warnings.push(
      "Die ertragsteuerliche Kürzung des Bruttolistenpreises wird für Umsatzsteuerzwecke nicht übernommen.",
    );
  if (
    vehicleType !== "combustion" &&
    (electricBenefit.benefitType === "half" || electricBenefit.benefitType === "quarter")
  )
    warnings.push(
      "AfA sowie Miet-/Leasingkosten können für die ertragsteuerliche Kostendeckelung gesondert anzupassen sein. Eingegebene Kosten fachlich prüfen.",
    );

  return {
    vehicleType,
    taxYear,
    acquisitionYear: acquisition?.year ?? null,
    firstRegistrationYear: firstRegistration?.year ?? null,
    electricBenefit,
    originalListPrice,
    originalRoundedListPrice,
    incomeTaxRelevantListPrice,
    vatRelevantListPrice,
    roundedListPrice: incomeTaxRelevantListPrice,
    months,
    distanceKm,
    fullDistanceKm,
    workdays,
    monthlyPrivateUseIncomeTax,
    privateUseIncomeTax,
    onePercentValue: privateUseIncomeTax,
    vatOnePercentValue,
    vatNonInputTaxDeduction,
    nonVatDeduction20: vatNonInputTaxDeduction,
    vatBaseBeforeCap,
    vatBeforeCap,
    commuteValue,
    distanceAllowanceRateLabel: distanceAllowanceRateLabel(taxYear),
    distanceAllowancePerDayValue,
    nonDeductibleCommuteExpense,
    commuteCorrection,
    pauschalIncomeTaxValues,
    incomeTaxCorrectionBeforeCap,
    incomeTaxValuesAfterCap,
    incomeTaxCorrectionAfterCap,
    costAllocations,
    totalVehicleCostsNet,
    nonVatVehicleCosts,
    vatVehicleCostsNet,
    leasingRentalVatCostsNet: leasingRentalVatCostsResult,
    leasingRentalNonVatCosts: leasingRentalNonVatCostsResult,
    otherVatCostsNet: otherVatCostsResult,
    otherNonVatCosts: otherNonVatCostsResult,
    costCapApplies,
    vatEvidenceAvailable,
    vatPrivateSharePercent,
    vatBaseByEstimate,
    vatDueByEstimate,
    vatBase8921,
    vatDue,
    rawAmount8924,
    amount8924,
    totalBeforeCap,
    totalAfterCap,
    warnings: [...new Set(warnings)],
  };
}

export function getKfzCalculationErrors(vehicle: Vehicle, index = 0): string[] {
  const prefix = `Fahrzeug ${index + 1}`;
  const result = calculateKfz(vehicle);
  const errors: string[] = [];
  const acquisition = parseDateInput(vehicle.anschaffung);

  if (!acquisition) errors.push(`${prefix}: Anschaffungsdatum fehlt oder ist ungültig.`);
  if (result.originalListPrice == null || result.originalListPrice <= 0)
    errors.push(`${prefix}: Bruttolistenpreis fehlt oder ist nicht positiv.`);
  if (result.taxYear == null) errors.push(`${prefix}: Veranlagungsjahr fehlt.`);
  if (
    result.months == null ||
    !Number.isInteger(result.months) ||
    result.months < 1 ||
    result.months > 12
  )
    errors.push(`${prefix}: Nutzungsmonate müssen ganze Zahlen zwischen 1 und 12 sein.`);
  if (result.distanceKm == null || result.distanceKm < 0)
    errors.push(`${prefix}: Entfernung fehlt oder ist negativ.`);
  if (result.workdays == null || result.workdays < 0)
    errors.push(`${prefix}: Arbeitstage fehlen oder sind negativ.`);
  if (vehicle.nachweis !== "ja")
    errors.push(`${prefix}: Nachweis der betrieblichen Nutzung über 50 % fehlt.`);

  if (result.vehicleType === "plugin-hybrid") {
    if (parseDe(vehicle.co2Input) == null)
      errors.push(`${prefix}: CO₂-Ausstoß des Plug-in-Hybrids fehlt.`);
    if (parseDe(vehicle.electricRangeInput) == null)
      errors.push(`${prefix}: Elektrische Reichweite des Plug-in-Hybrids fehlt.`);
  }
  if (
    result.vehicleType !== "combustion" &&
    result.electricBenefit.taxableListPriceFactor == null
  ) {
    if (
      result.electricBenefit.warnings.some((warning) =>
        warning.toLowerCase().includes("erstzulassungsdatum"),
      )
    )
      errors.push(`${prefix}: Erstzulassungsdatum für den Batterieabschlag fehlt.`);
    if (
      result.electricBenefit.warnings.some((warning) =>
        warning.toLowerCase().includes("batteriekapazität"),
      )
    )
      errors.push(`${prefix}: Batteriekapazität für den Batterieabschlag fehlt.`);
    errors.push(`${prefix}: Elektro-/Hybridbegünstigung ist noch nicht vollständig prüfbar.`);
  }
  if (result.vehicleType !== "combustion" && acquisition != null && acquisition.key >= 20_310_101)
    errors.push(`${prefix}: Anschaffung liegt außerhalb des Rechtsstands bis 2030.`);
  if (result.vehicleType !== "combustion" && acquisition != null && acquisition.key < 20_130_101)
    errors.push(`${prefix}: Anschaffung liegt vor dem hinterlegten Rechtsstand ab 2013.`);

  for (const cost of vehicle.costs) {
    const total = parseDe(cost.totalNet);
    const withoutVat = parseDe(cost.withoutVat);
    if (cost.totalNet.trim() && total == null)
      errors.push(`${prefix}: Ungültiger Gesamtbetrag bei „${cost.label}“.`);
    if (cost.withoutVat.trim() && withoutVat == null)
      errors.push(`${prefix}: Ungültiger Betrag ohne Vorsteuer bei „${cost.label}“.`);
    if (withoutVat != null && total == null)
      errors.push(`${prefix}: Gesamtbetrag bei „${cost.label}“ fehlt.`);
    if (total != null && withoutVat == null)
      errors.push(
        `${prefix}: Betrag ohne Vorsteuer bei „${cost.label}“ fehlt; gegebenenfalls 0 eingeben.`,
      );
    if (total != null && withoutVat != null && withoutVat > total)
      errors.push(
        `${prefix}: Betrag ohne Vorsteuer übersteigt den Gesamtbetrag bei „${cost.label}“.`,
      );
  }
  if (result.totalVehicleCostsNet <= 0)
    errors.push(`${prefix}: Positive Gesamtfahrzeugkosten fehlen.`);
  if (
    result.costCapApplies === true &&
    result.vatEvidenceAvailable &&
    result.vatPrivateSharePercent == null
  )
    errors.push(`${prefix}: USt-Privatanteil aus den geeigneten Unterlagen fehlt.`);
  if (
    result.privateUseIncomeTax == null ||
    result.commuteCorrection == null ||
    result.vatBase8921 == null ||
    result.vatDue == null ||
    result.amount8924 == null ||
    result.totalAfterCap == null
  )
    errors.push(`${prefix}: Berechnung ist noch nicht vollständig.`);

  return [...new Set(errors)];
}

export function getKfzCalculationErrorsForVehicles(vehicles: Vehicle[]): string[] {
  if (vehicles.length === 0) return ["Mindestens ein Fahrzeug ist erforderlich."];
  return vehicles.flatMap((vehicle, index) => getKfzCalculationErrors(vehicle, index));
}
