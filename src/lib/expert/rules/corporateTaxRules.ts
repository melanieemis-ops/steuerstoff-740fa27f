import type { RuleFile } from "../types";

export const corporateTaxRules: RuleFile = {
  taxType: "koerperschaftsteuer",
  scenarios: [],
  decide: (_f, signals) => {
    const vga = signals.some((s) => s.id === "kst.vga");
    return {
      taxType: "koerperschaftsteuer",
      scenario: null,
      subCase: vga ? "vga" : null,
      schemaId: vga ? "kst.vga" : "kst.basis",
      schemaSteps: [
        { id: "steuersubjekt", label: "Steuersubjekt (§ 1 KStG)" },
        { id: "einkommensermittlung", label: "Einkommensermittlung (§ 8 KStG i.V.m. EStG)" },
        { id: "korrekturen", label: "Außerbilanzielle Korrekturen (vGA, § 8b KStG)" },
        { id: "tarif", label: "Tarif (§ 23 KStG)" },
      ],
      normen: vga ? ["§ 8 Abs. 3 Satz 2 KStG"] : ["§ 1 KStG", "§ 8 KStG"],
      ergebnis: vga
        ? "Verdachtsfall verdeckte Gewinnausschüttung — Fremdvergleich prüfen."
        : "Körperschaftsteuer — Standard-Einkommensermittlung.",
    };
  },
};
