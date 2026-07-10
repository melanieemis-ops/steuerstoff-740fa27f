import type { RuleFile } from "../types";

export const tradeTaxRules: RuleFile = {
  taxType: "gewerbesteuer",
  scenarios: [],
  decide: () => ({
    taxType: "gewerbesteuer",
    scenario: null,
    subCase: null,
    schemaId: "gewst.basis",
    schemaSteps: [
      { id: "gewinn", label: "Gewinn aus Gewerbebetrieb (§ 7 GewStG)" },
      { id: "hinzurechnungen", label: "Hinzurechnungen (§ 8 GewStG)" },
      { id: "kuerzungen", label: "Kürzungen (§ 9 GewStG)" },
      { id: "messbetrag", label: "Steuermessbetrag (§ 11 GewStG)" },
      { id: "hebesatz", label: "Hebesatz der Gemeinde" },
    ],
    normen: ["§ 7 GewStG", "§ 8 GewStG", "§ 9 GewStG", "§ 11 GewStG"],
    ergebnis: "Gewerbesteuer — Messbetrag × Hebesatz.",
  }),
};
