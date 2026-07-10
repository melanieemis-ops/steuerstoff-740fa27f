import type { RuleFile } from "../types";

export const internationalTaxRules: RuleFile = {
  taxType: "internationales_steuerrecht",
  scenarios: [],
  decide: () => ({
    taxType: "internationales_steuerrecht",
    scenario: null,
    subCase: null,
    schemaId: "istr.basis",
    schemaSteps: [
      { id: "steuerpflicht", label: "Unbeschränkte / beschränkte Steuerpflicht" },
      { id: "dba", label: "DBA-Prüfung (Ansässigkeit, Verteilungsnorm)" },
      { id: "methode", label: "Anrechnung / Freistellung (§ 34c EStG, DBA)" },
      { id: "astg", label: "AStG (Verrechnungspreise, Hinzurechnungsbesteuerung)" },
    ],
    normen: ["§ 1 EStG", "§ 34c EStG", "§ 1 AStG", "§§ 7 ff. AStG"],
    ergebnis: "Internationales Steuerrecht — DBA-Verteilung vor nationaler Methode prüfen.",
  }),
};
