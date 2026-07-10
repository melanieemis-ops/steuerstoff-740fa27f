import { INCOME_TAX_RULES } from "../rules/incomeTaxRules";
import { runFirstMatchingRule } from "./ruleRunner";
import type { RuleModule } from "./types";

const mod: RuleModule = {
  taxType: "einkommensteuer",
  taxLabel: "Einkommensteuer",
  weakTriggers: [/\beinkommen/i, /\barbeitnehmer/i, /\bwerbungskosten/i, /\bpauschale\b/i],
  mediumTriggers: [
    /entfernungspauschal/i,
    /pendlerpauschal/i,
    /homeoffice/i,
    /home[-\s]?office/i,
    /arbeitszimmer/i,
    /sonderausgaben/i,
    /au(ß|ss)ergew(ö|oe)hnliche\s+belastung/i,
    /kapitalertr(ä|ae)ge/i,
    /vermietung\s+und\s+verpachtung/i,
    /erste[nrs]?\s+t(ä|ae)tigkeitsst(ä|ae)tte/i,
  ],
  strongTriggers: [
    /§\s*9\s*estg/i,
    /§\s*10\s*estg/i,
    /§\s*20\s*estg/i,
    /§\s*21\s*estg/i,
    /§\s*33\s*estg/i,
    /§\s*35a\s*estg/i,
    /§\s*4\s*abs\s*5\s*s\s*1\s*nr\s*6c/i,
  ],
  exclusiveTriggers: [/entfernungspauschale/i, /pendlerpauschale/i, /homeoffice-?pauschale/i],
  negativeTriggers: [],
  minimumScore: 3,
  scenarioTypes: ["commutingAllowance", "homeOfficeAllowance", "travelExpenses"],
  followUpQuestions: [
    "Wie viele Arbeitstage im Jahr?",
    "Einfache Entfernung in Kilometern?",
    "Welches Verkehrsmittel wurde genutzt?",
  ],
  knowledgeFilter: (t) => t === "einkommensteuer",
  decide: (ctx) => runFirstMatchingRule(INCOME_TAX_RULES, ctx),
  regressionTests: [
    {
      id: "est.entfernungspauschale",
      prompt:
        "Arbeitnehmer, 210 Arbeitstage, einfache Entfernung 28 km, erste Tätigkeitsstätte, privater Pkw. Wie hoch ist die Entfernungspauschale?",
      expect: ["1.898,40", "§ 9", "EStG"],
      mustBeTaxType: "einkommensteuer",
    },
    {
      id: "est.homeoffice",
      prompt:
        "Ein Arbeitnehmer arbeitete an 100 Tagen im Homeoffice. Wie hoch ist die Homeoffice-Pauschale?",
      expect: ["Homeoffice", "§ 4 Abs. 5"],
      mustBeTaxType: "einkommensteuer",
    },
  ],
};

export default mod;
