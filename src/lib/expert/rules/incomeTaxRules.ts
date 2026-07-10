import type { RuleFile } from "../types";

export const incomeTaxRules: RuleFile = {
  taxType: "einkommensteuer",
  scenarios: [],
  decide: (_f, signals) => {
    const wk = signals.find((s) => s.id === "est.werbungskosten");
    const p35a = signals.find((s) => s.id === "est.35a");
    const vuv = signals.find((s) => s.id === "est.vuv");
    const kap = signals.find((s) => s.id === "est.kapital");
    const ver = signals.find((s) => s.id === "est.veraeusserung");
    let subCase: string | null = null;
    let normen: string[] = ["§ 2 EStG"];
    if (wk) { subCase = "werbungskosten"; normen = ["§ 9 EStG", "§ 9 Abs. 1 Nr. 4 EStG"]; }
    else if (p35a) { subCase = "haushaltsnahe_dienstleistungen"; normen = ["§ 35a EStG"]; }
    else if (vuv) { subCase = "vermietung_verpachtung"; normen = ["§ 21 EStG", "§ 9 EStG"]; }
    else if (kap) { subCase = "kapitalvermoegen"; normen = ["§ 20 EStG", "§ 32d EStG"]; }
    else if (ver) { subCase = "veraeusserungsgeschaeft"; normen = ["§ 23 EStG"]; }
    return {
      taxType: "einkommensteuer",
      scenario: null,
      subCase,
      schemaId: `est.${subCase ?? "basis"}`,
      schemaSteps: [
        { id: "einkunftsart", label: "Einkunftsart bestimmen (§ 2 Abs. 1 EStG)" },
        { id: "tatbestand", label: "Tatbestand der Einkunftsart prüfen" },
        { id: "einkuenfteermittlung", label: "Einkünfteermittlung (Überschuss / Gewinn)" },
        { id: "abzuege", label: "Sonderausgaben, agB, Freibeträge" },
        { id: "tarif", label: "Tarifliche Steuer (§ 32a EStG)" },
      ],
      normen,
      ergebnis: subCase
        ? `Einkommensteuerlicher Unterfall: ${subCase}.`
        : "Einkommensteuer — Unterfall wird aus dem konkreten Sachverhalt abgeleitet.",
    };
  },
};
