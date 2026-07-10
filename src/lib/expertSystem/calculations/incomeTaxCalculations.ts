// Berechnungsfunktionen für Einkommensteuer.
// Aktuelle Rechtslage (ab VZ 2022): 0,30 €/km bis 20 km, 0,38 €/km ab dem 21. km.

export interface CommutingAllowanceInput {
  oneWayDistanceKm: number;
  workDays: number;
}

export interface CommutingAllowanceResult {
  total: number;
  breakdown: { label: string; amount: number }[];
  formula: string;
  legalBasis: string[];
}

export function calculateCommutingAllowance(
  input: CommutingAllowanceInput,
): CommutingAllowanceResult {
  const km = Math.max(0, Math.floor(input.oneWayDistanceKm));
  const days = Math.max(0, Math.floor(input.workDays));
  const lowKm = Math.min(km, 20);
  const highKm = Math.max(0, km - 20);
  const lowAmount = lowKm * 0.30 * days;
  const highAmount = highKm * 0.38 * days;
  const total = lowAmount + highAmount;
  return {
    total: round2(total),
    breakdown: [
      { label: `${lowKm} km × 0,30 € × ${days} Tage`, amount: round2(lowAmount) },
      { label: `${highKm} km × 0,38 € × ${days} Tage (ab 21. km)`, amount: round2(highAmount) },
    ],
    formula: "min(km, 20) · 0,30 € · Tage + max(km − 20, 0) · 0,38 € · Tage",
    legalBasis: ["§ 9 Abs. 1 Satz 3 Nr. 4 EStG", "§ 9 Abs. 1 Satz 3 Nr. 4 Satz 8 EStG"],
  };
}

/** Homeoffice-Pauschale ab VZ 2023: 6 €/Tag, max. 210 Tage, max. 1.260 €. */
export interface HomeOfficeResult {
  total: number;
  cappedDays: number;
  formula: string;
  legalBasis: string[];
}
export function calculateHomeOfficeAllowance(days: number): HomeOfficeResult {
  const d = Math.max(0, Math.min(210, Math.floor(days)));
  const total = Math.min(1260, d * 6);
  return {
    total: round2(total),
    cappedDays: d,
    formula: "min(Tage, 210) · 6 € (Höchstbetrag 1.260 €)",
    legalBasis: ["§ 4 Abs. 5 Satz 1 Nr. 6c EStG", "§ 9 Abs. 5 Satz 1 EStG"],
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
