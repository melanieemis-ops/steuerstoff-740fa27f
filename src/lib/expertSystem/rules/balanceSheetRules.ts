import type { RuleDef } from "./ruleTypes";

export const warrantyProvisionRule: RuleDef = {
  id: "bilanz.warrantyProvision",
  taxType: "bilanzsteuerrecht",
  priority: 100,
  matches: ({ facts, scenario, subScenario }) =>
    (subScenario === "warrantyProvision" ||
      scenario === "provisions" ||
      scenario === "warrantyProvision") &&
    facts.warranty === true &&
    facts.uncertainObligation === true,
  apply: ({ facts }) => {
    const amount = facts.provisionAmount;
    const year = facts.balanceSheetYear;
    const narrative = amount
      ? `Zum Bilanzstichtag${year ? ` ${year}` : ""} liegt eine ungewisse Verbindlichkeit aus einer bereits ausgesprochenen Garantiezusage vor. Die Verpflichtung ist wirtschaftlich im abgelaufenen Geschäftsjahr verursacht (Warenverkauf mit Garantie). Nach § 249 Abs. 1 Satz 1 HGB besteht Passivierungspflicht, § 5 Abs. 1 EStG (Maßgeblichkeit) zieht die Passivierung in die Steuerbilanz. Die Höhe wird nach vernünftiger kaufmännischer Beurteilung (§ 253 Abs. 1 Satz 2 HGB) auf Basis der Vergangenheitswerte mit ${amount.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € geschätzt.`
      : "Zum Bilanzstichtag liegt eine ungewisse Verbindlichkeit aus einer Garantiezusage vor. Die Verpflichtung ist wirtschaftlich im abgelaufenen Geschäftsjahr verursacht. Nach § 249 Abs. 1 Satz 1 HGB besteht Passivierungspflicht, in die Steuerbilanz übernommen über die Maßgeblichkeit (§ 5 Abs. 1 EStG). Bewertung nach § 253 Abs. 1 Satz 2 HGB bzw. § 6 Abs. 1 Nr. 3a EStG.";
    return {
      taxType: "bilanzsteuerrecht",
      scenario: "provisions",
      subScenario: "warrantyProvision",
      legalRefs: [
        "§ 249 Abs. 1 Satz 1 HGB",
        "§ 253 Abs. 1 Satz 2 HGB",
        "§ 5 Abs. 1 EStG",
        "§ 6 Abs. 1 Nr. 3a EStG",
      ],
      confidence: 0.95,
      calculationId: amount ? "reportProvisionAmount" : undefined,
      headline: "Rückstellung für ungewisse Verbindlichkeiten (Garantie)",
      narrative,
      schemaSteps: [
        { id: "tatbestand", label: "Ungewisse Verbindlichkeit bejahen (Garantiezusage)" },
        { id: "verursachung", label: "Wirtschaftliche Verursachung vor dem Bilanzstichtag" },
        { id: "wahrscheinlichkeit", label: "Wahrscheinliche Inanspruchnahme (§ 249 Abs. 1 S. 1 HGB)" },
        { id: "massgeblichkeit", label: "Maßgeblichkeit HB → StB (§ 5 Abs. 1 EStG)" },
        { id: "bewertung", label: "Bewertung nach § 253 HGB / § 6 Abs. 1 Nr. 3a EStG" },
        { id: "buchung", label: "Aufwand (Garantieaufwand) an Rückstellung — gewinnmindernd" },
      ],
    };
  },
};

export const genericProvisionRule: RuleDef = {
  id: "bilanz.provision.generic",
  taxType: "bilanzsteuerrecht",
  priority: 50,
  matches: ({ facts, scenario }) =>
    scenario === "provisions" &&
    facts.provision === true &&
    facts.balanceSheetDate === true,
  apply: ({ facts }) => ({
    taxType: "bilanzsteuerrecht",
    scenario: "provisions",
    subScenario: "generic",
    legalRefs: ["§ 249 HGB", "§ 253 HGB", "§ 5 Abs. 1 EStG", "§ 6 Abs. 1 Nr. 3a EStG"],
    confidence: 0.9,
    headline: "Rückstellung — Grundfall",
    narrative:
      "Zum Bilanzstichtag ist zu prüfen, ob die Voraussetzungen für die Passivierung einer Rückstellung erfüllt sind: rechtliche oder wirtschaftliche Verpflichtung gegenüber Dritten, wirtschaftliche Verursachung vor dem Stichtag, Wahrscheinlichkeit der Inanspruchnahme und zuverlässige Schätzbarkeit der Höhe.",
    missingFacts: facts.warranty === true ? [] : ["Art der Verpflichtung (Garantie, Pension, Prozess, Instandhaltung?)"],
    schemaSteps: [
      { id: "art", label: "Art der Verpflichtung bestimmen" },
      { id: "verursachung", label: "Wirtschaftliche Verursachung vor Stichtag" },
      { id: "wahrscheinlichkeit", label: "Wahrscheinliche Inanspruchnahme" },
      { id: "bewertung", label: "Bewertung / ggf. Abzinsung nach § 6 Abs. 1 Nr. 3a EStG" },
    ],
  }),
};

export const BALANCE_SHEET_RULES: RuleDef[] = [warrantyProvisionRule, genericProvisionRule];
