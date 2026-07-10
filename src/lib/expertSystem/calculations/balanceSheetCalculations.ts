// Bilanzierung — Berechnungs-/Reportfunktionen.

export interface ProvisionReport {
  amount: number;
  narrative: string;
  bookingEntry: string;
  legalBasis: string[];
}

export function reportProvisionAmount(amount: number): ProvisionReport {
  const fmt = amount.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return {
    amount,
    narrative: `Rückstellungsbetrag laut vernünftiger kaufmännischer Beurteilung: ${fmt} €.`,
    bookingEntry: `Garantieaufwand ${fmt} € an Rückstellungen für ungewisse Verbindlichkeiten ${fmt} €`,
    legalBasis: ["§ 249 Abs. 1 Satz 1 HGB", "§ 253 Abs. 1 Satz 2 HGB", "§ 5 Abs. 1 EStG"],
  };
}
