// Basisschema für Steuerarten ohne feinjustierte Rule-Datei.
// Liefert ein flaches Prüfschema, damit die Antwortstruktur konsistent bleibt.

import { TAX_TYPE_LABELS } from "../../router/taxTypes";
import type { Facts, FiredSignal, RuleResult, TaxType } from "../types";

export function fallbackRule(taxType: TaxType, _f: Facts, _s: FiredSignal[]): RuleResult {
  const label = TAX_TYPE_LABELS[taxType] ?? String(taxType);
  return {
    taxType,
    scenario: null,
    subCase: null,
    schemaId: `fallback:${taxType}`,
    schemaSteps: [
      { id: "sachverhalt", label: "Sachverhalt und Beteiligte klären" },
      { id: "norm", label: "Einschlägige Vorschrift identifizieren" },
      { id: "tatbestand", label: "Tatbestandsmerkmale prüfen" },
      { id: "rechtsfolge", label: "Rechtsfolge ableiten" },
    ],
    normen: [],
    ergebnis: `Klassifiziert als ${label}. Für eine belastbare Falllösung werden die konkreten Fakten geprüft.`,
    missingFacts: ["Bitte konkretisieren Sie den Sachverhalt (Beteiligte, Zeitraum, Beträge)."],
  };
}
