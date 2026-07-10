import type { RuleFile } from "../types";

export const giftTaxRules: RuleFile = {
  taxType: "schenkungsteuer",
  scenarios: [],
  decide: () => ({
    taxType: "schenkungsteuer",
    scenario: null,
    subCase: null,
    schemaId: "schenkst.basis",
    schemaSteps: [
      { id: "zuwendung", label: "Freigebige Zuwendung (§ 7 ErbStG)" },
      { id: "bewertung", label: "Bewertung (§ 12 ErbStG i.V.m. BewG)" },
      { id: "steuerklasse", label: "Steuerklasse (§ 15 ErbStG)" },
      { id: "freibetrag", label: "Freibetrag (§ 16 ErbStG), 10-Jahres-Zeitraum" },
      { id: "tarif", label: "Tarif (§ 19 ErbStG)" },
    ],
    normen: ["§ 7 ErbStG", "§ 14 ErbStG", "§ 16 ErbStG", "§ 19 ErbStG"],
    ergebnis: "Schenkungsteuer — Zusammenrechnung mehrerer Zuwendungen innerhalb 10 Jahren.",
  }),
};
