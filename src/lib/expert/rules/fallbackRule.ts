// Fallback für Steuerarten OHNE echte Rule-Datei.
// Statt ein hübsches Schein-Schema zu erfinden, wird ausdrücklich
// ausgewiesen, dass für diese Steuerart noch keine geprüfte Logik
// vorliegt. So kann die Chat-UI (und der Regressionstest) das
// erkennen und ehrlich zurückmelden.

import { TAX_TYPE_LABELS } from "../../router/taxTypes";
import type { Facts, FiredSignal, RuleResult, TaxType } from "../types";

export function fallbackRule(taxType: TaxType, _f: Facts, _s: FiredSignal[]): RuleResult {
  const label = TAX_TYPE_LABELS[taxType] ?? String(taxType);
  return {
    taxType,
    scenario: null,
    subCase: "unsupported",
    schemaId: `unsupported:${taxType}`,
    schemaSteps: [],
    normen: [],
    ergebnis:
      `Für die Steuerart „${label}“ ist im Expertensystem derzeit keine geprüfte Regel hinterlegt. ` +
      `Antworten in diesem Bereich stützen sich ausschließlich auf die Wissensdatenbank und sind nicht regelbasiert validiert.`,
    missingFacts: [`Rule-Datei für ${label} noch nicht implementiert.`],
  };
}
