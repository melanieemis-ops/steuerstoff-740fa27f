import type { RuleDef } from "./ruleTypes";

export const commutingAllowanceRule: RuleDef = {
  id: "est.commutingAllowance",
  taxType: "einkommensteuer",
  priority: 100,
  matches: ({ facts, scenario }) =>
    scenario === "commutingAllowance" &&
    facts.employee === true &&
    facts.firstPlaceOfWork === true,
  apply: ({ facts }) => {
    const km = facts.oneWayDistanceKm;
    const days = facts.workDays;
    const missing: string[] = [];
    if (km === undefined) missing.push("einfache Entfernung in km");
    if (days === undefined) missing.push("Anzahl der Arbeitstage");
    return {
      taxType: "einkommensteuer",
      scenario: "employmentIncome",
      subScenario: "commutingAllowance",
      legalRefs: ["§ 9 Abs. 1 Satz 3 Nr. 4 EStG", "§ 9 Abs. 4 EStG"],
      confidence: missing.length === 0 ? 0.99 : 0.7,
      calculationId: missing.length === 0 ? "calculateCommutingAllowance" : undefined,
      headline: "Werbungskosten — Entfernungspauschale",
      narrative:
        "Der Arbeitnehmer nutzt für Fahrten zwischen Wohnung und erster Tätigkeitsstätte einen eigenen Pkw. Die Entfernungspauschale ist verkehrsmittelunabhängig anzusetzen und pro Arbeitstag nur für eine Hin- und Rückfahrt.",
      missingFacts: missing,
      schemaSteps: [
        { id: "einkunftsart", label: "Einkünfte aus nichtselbständiger Arbeit (§ 19 EStG)" },
        { id: "abzug", label: "Werbungskostenabzug (§ 9 EStG)" },
        { id: "tatbestand", label: "Erste Tätigkeitsstätte (§ 9 Abs. 4 EStG)" },
        { id: "berechnung", label: "Entfernungspauschale gestaffelt" },
      ],
    };
  },
};

export const INCOME_TAX_RULES: RuleDef[] = [commutingAllowanceRule];
