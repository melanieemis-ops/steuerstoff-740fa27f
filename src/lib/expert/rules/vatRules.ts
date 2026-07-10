// USt-Rule — deterministisches Prüfschema.
// Kernentscheidungen basieren auf Signalen aus signals.ts.
// Feinjustierte Sonderfälle (Werklieferung, § 13b, Reihen-/Dreiecksgeschäft)
// werden vorerst weiter in chatHeuristics.classifyUst gerendert; die Rule
// liefert das strukturierte Prüfschema und den Scenario-Typ.

import type { RuleFile, RuleResult } from "../types";

const SCHEMA = [
  { id: "sachverhalt", label: "Sachverhaltsart bestimmen (Lieferung/sonstige Leistung/Werk)" },
  { id: "steuerbarkeit", label: "Steuerbarkeit (§ 1 UStG)" },
  { id: "ort", label: "Ort der Leistung (§§ 3, 3a, 3b, 3c, 3e, 3g UStG)" },
  { id: "befreiung", label: "Steuerbefreiung (§ 4 UStG, § 6a UStG, § 6 UStG)" },
  { id: "bmg", label: "Bemessungsgrundlage (§ 10 UStG)" },
  { id: "steuersatz", label: "Steuersatz (§ 12 UStG)" },
  { id: "schuldner", label: "Steuerschuldnerschaft (§ 13a / § 13b UStG)" },
  { id: "entstehung", label: "Entstehung der Steuer (§ 13 UStG)" },
  { id: "vorsteuer", label: "Vorsteuerabzug (§ 15 UStG)" },
];

export const vatRules: RuleFile = {
  taxType: "umsatzsteuer",
  scenarios: [
    "innergemeinschaftlicher_erwerb",
    "innergemeinschaftliche_lieferung",
    "reverse_charge",
    "werklieferung",
    "werkleistung",
    "ausfuhrlieferung",
    "einfuhr",
    "reihengeschaeft",
    "dreiecksgeschaeft",
  ],
  decide: (_facts, signals) => {
    const scenarioSig = signals.find((s) => s.id.startsWith("ust.") && s.scenarios?.length);
    const scenario = scenarioSig?.scenarios?.[0] ?? null;
    const result: RuleResult = {
      taxType: "umsatzsteuer",
      scenario,
      subCase: null,
      schemaId: "ust.9punkte",
      schemaSteps: SCHEMA,
      normen: ["§ 1 UStG", "§ 3 UStG", "§ 3a UStG", "§ 4 UStG", "§ 13b UStG", "§ 15 UStG"],
      ergebnis: scenario
        ? `Erkanntes Szenario: ${scenario}. Detailprüfung erfolgt im 9-Punkte-Schema.`
        : "Sachverhaltsart offen — bitte präzisieren (Lieferung, sonstige Leistung, Werk?).",
    };
    return result;
  },
};
