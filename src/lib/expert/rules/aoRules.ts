import type { RuleFile } from "../types";

export const aoRules: RuleFile = {
  taxType: "abgabenordnung",
  scenarios: [],
  decide: (_f, signals) => {
    const einspruch = signals.some((s) => s.id === "ao.einspruch");
    const verj = signals.some((s) => s.id === "ao.verjaehrung");
    const aend = signals.some((s) => s.id === "ao.aenderung");
    const subCase = einspruch ? "einspruch" : verj ? "verjaehrung" : aend ? "aenderungsnormen" : null;
    return {
      taxType: "abgabenordnung",
      scenario: null,
      subCase,
      schemaId: `ao.${subCase ?? "basis"}`,
      schemaSteps: einspruch
        ? [
            { id: "statthaftigkeit", label: "Statthaftigkeit (§ 347 AO)" },
            { id: "form", label: "Form und Frist (§§ 355, 357 AO)" },
            { id: "beschwer", label: "Beschwer (§ 350 AO)" },
            { id: "begruendetheit", label: "Begründetheit" },
          ]
        : [
            { id: "sachverhalt", label: "Verfahrenssachverhalt klären" },
            { id: "norm", label: "AO-Norm identifizieren" },
            { id: "tatbestand", label: "Tatbestandsmerkmale prüfen" },
            { id: "rechtsfolge", label: "Rechtsfolge (Änderung / Verjährung / Haftung)" },
          ],
      normen: einspruch
        ? ["§ 347 AO", "§ 355 AO", "§ 357 AO", "§ 350 AO"]
        : verj
        ? ["§ 169 AO", "§ 170 AO", "§ 228 AO"]
        : aend
        ? ["§ 172 AO", "§ 173 AO", "§ 174 AO", "§ 175 AO"]
        : ["AO"],
      ergebnis: subCase ? `AO-Unterfall: ${subCase}.` : "Abgabenordnung — allgemeines Verfahrensrecht.",
    };
  },
};
