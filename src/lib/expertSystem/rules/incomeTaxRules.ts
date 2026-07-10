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

export const homeOfficeRule: RuleDef = {
  id: "est.homeOfficeAllowance",
  taxType: "einkommensteuer",
  priority: 90,
  matches: ({ facts, scenario }) =>
    scenario === "homeOfficeAllowance" &&
    facts.employee === true &&
    facts.homeOffice === true,
  apply: ({ facts }) => {
    const days = facts.homeOfficeDays ?? facts.workDays;
    const missing = days === undefined ? ["Anzahl der Homeoffice-Tage"] : [];
    return {
      taxType: "einkommensteuer",
      scenario: "employmentIncome",
      subScenario: "homeOfficeAllowance",
      legalRefs: ["§ 4 Abs. 5 Satz 1 Nr. 6c EStG", "§ 9 Abs. 5 Satz 1 EStG"],
      confidence: missing.length === 0 ? 0.95 : 0.7,
      calculationId: missing.length === 0 ? "calculateHomeOfficeAllowance" : undefined,
      headline: "Werbungskosten — Homeoffice-Pauschale",
      narrative:
        "Für jeden Kalendertag, an dem die betriebliche/berufliche Tätigkeit überwiegend in der häuslichen Wohnung ausgeübt wird, ist die Tagespauschale von 6 € (max. 210 Tage, Höchstbetrag 1.260 €) als Werbungskosten abzugsfähig.",
      missingFacts: missing,
      schemaSteps: [
        { id: "einkunftsart", label: "Einkünfte aus nichtselbständiger Arbeit (§ 19 EStG)" },
        { id: "tatbestand", label: "Überwiegende Tätigkeit in der Wohnung (§ 4 Abs. 5 Nr. 6c EStG)" },
        { id: "berechnung", label: "Tage · 6 € (Höchstbetrag 1.260 €)" },
      ],
    };
  },
};

export const INCOME_TAX_RULES: RuleDef[] = [commutingAllowanceRule, homeOfficeRule];
