import type { RuleFile } from "../types";

export const balanceSheetRules: RuleFile = {
  taxType: "bilanzsteuerrecht",
  scenarios: [],
  decide: (_f, signals) => {
    const r = signals.some((s) => s.id === "bilanz.rueckstellung");
    const a = signals.some((s) => s.id === "bilanz.afa");
    const rap = signals.some((s) => s.id === "bilanz.rap");
    const subCase = r ? "rueckstellung" : rap ? "rap" : a ? "afa" : null;
    const normen = r
      ? ["§ 249 HGB", "§ 6 Abs. 1 Nr. 3a EStG"]
      : rap
      ? ["§ 250 HGB", "§ 5 Abs. 5 EStG"]
      : a
      ? ["§ 7 EStG", "§ 253 HGB"]
      : ["§ 5 EStG", "§ 252 HGB"];
    return {
      taxType: "bilanzsteuerrecht",
      scenario: null,
      subCase,
      schemaId: `bilanz.${subCase ?? "basis"}`,
      schemaSteps: [
        { id: "ansatz", label: "Ansatz dem Grunde nach" },
        { id: "bewertung", label: "Bewertung dem Werte nach" },
        { id: "ausweis", label: "Ausweis in Handels- und Steuerbilanz" },
        { id: "maßgeblichkeit", label: "Maßgeblichkeit / Durchbrechung" },
      ],
      normen,
      ergebnis: subCase
        ? `Bilanzsteuerlicher Unterfall: ${subCase}.`
        : "Bilanzsteuerrecht — Ansatz und Bewertung nach HGB/EStG prüfen.",
    };
  },
};
