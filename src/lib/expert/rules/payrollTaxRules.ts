import type { RuleFile } from "../types";

export const payrollTaxRules: RuleFile = {
  taxType: "lohnsteuer",
  scenarios: [],
  decide: (_f, signals) => {
    const gwv = signals.some((s) => s.id === "lst.geldwerter_vorteil");
    return {
      taxType: "lohnsteuer",
      scenario: null,
      subCase: gwv ? "geldwerter_vorteil" : null,
      schemaId: gwv ? "lst.sachbezug" : "lst.basis",
      schemaSteps: [
        { id: "arbeitslohn", label: "Arbeitslohn (§ 19 EStG, § 2 LStDV)" },
        { id: "sachbezug", label: "Sachbezug / geldwerter Vorteil (§ 8 EStG)" },
        { id: "steuerabzug", label: "Lohnsteuerabzug (§§ 38 ff. EStG)" },
        { id: "anmeldung", label: "Lohnsteueranmeldung (§ 41a EStG)" },
      ],
      normen: gwv ? ["§ 8 EStG", "§ 19 EStG"] : ["§§ 38 ff. EStG"],
      ergebnis: gwv
        ? "Geldwerter Vorteil ist Arbeitslohn — Bewertung nach § 8 EStG."
        : "Lohnsteuer — Standardabzug durch Arbeitgeber.",
    };
  },
};
