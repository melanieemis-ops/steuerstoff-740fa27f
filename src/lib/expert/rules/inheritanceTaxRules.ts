import type { RuleFile } from "../types";

export const inheritanceTaxRules: RuleFile = {
  taxType: "erbschaftsteuer",
  scenarios: [],
  decide: () => ({
    taxType: "erbschaftsteuer",
    scenario: null,
    subCase: null,
    schemaId: "erbst.basis",
    schemaSteps: [
      { id: "erwerb", label: "Steuerpflichtiger Erwerb (§ 3 ErbStG)" },
      { id: "bewertung", label: "Bewertung (BewG, § 12 ErbStG)" },
      { id: "steuerklasse", label: "Steuerklasse (§ 15 ErbStG)" },
      { id: "freibetrag", label: "Persönlicher Freibetrag (§ 16 ErbStG)" },
      { id: "tarif", label: "Tarif (§ 19 ErbStG)" },
    ],
    normen: ["§ 3 ErbStG", "§ 15 ErbStG", "§ 16 ErbStG", "§ 19 ErbStG"],
    ergebnis: "Erbschaftsteuer — Freibetrag und Steuerklasse bestimmen den Tarif.",
  }),
};
