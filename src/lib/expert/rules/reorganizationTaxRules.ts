import type { RuleFile } from "../types";

export const reorganizationTaxRules: RuleFile = {
  taxType: "umwandlungssteuer",
  scenarios: [],
  decide: () => ({
    taxType: "umwandlungssteuer",
    scenario: null,
    subCase: null,
    schemaId: "umwst.basis",
    schemaSteps: [
      { id: "art", label: "Umwandlungsart (Verschmelzung/Spaltung/Einbringung/Formwechsel)" },
      { id: "wertansatz", label: "Wertansatz (Buchwert/Zwischenwert/gemeiner Wert)" },
      { id: "rueckwirkung", label: "Steuerliche Rückwirkung (§ 2 UmwStG)" },
      { id: "folgewirkungen", label: "Folgewirkungen (Sperrfristen, § 22 UmwStG)" },
    ],
    normen: ["§ 2 UmwStG", "§ 3 UmwStG", "§ 20 UmwStG", "§ 24 UmwStG"],
    ergebnis: "Umwandlungssteuer — Wertansatz und Rückwirkung entscheiden über Steuerneutralität.",
  }),
};
