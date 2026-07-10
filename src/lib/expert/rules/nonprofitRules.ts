import type { RuleFile } from "../types";

export const nonprofitRules: RuleFile = {
  taxType: "gemeinnuetzigkeit",
  scenarios: [],
  decide: () => ({
    taxType: "gemeinnuetzigkeit",
    scenario: null,
    subCase: null,
    schemaId: "npo.4sphaeren",
    schemaSteps: [
      { id: "ideell", label: "Ideeller Bereich" },
      { id: "vermoegen", label: "Vermögensverwaltung" },
      { id: "zweckbetrieb", label: "Zweckbetrieb (§§ 65–68 AO)" },
      { id: "wgb", label: "Wirtschaftlicher Geschäftsbetrieb (§ 64 AO)" },
      { id: "mittelverwendung", label: "Mittelverwendung / Rücklagen (§ 55, § 62 AO)" },
    ],
    normen: ["§ 51 AO", "§ 52 AO", "§ 55 AO", "§ 64 AO", "§ 65 AO"],
    ergebnis: "Gemeinnützigkeitsrechtliche Prüfung nach dem 4-Sphären-Modell.",
  }),
};
