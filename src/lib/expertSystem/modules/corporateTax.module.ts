import { CORPORATE_TAX_RULES } from "../rules/corporateTaxRules";
import { runFirstMatchingRule } from "./ruleRunner";
import type { RuleModule } from "./types";

const mod: RuleModule = {
  taxType: "koerperschaftsteuer",
  taxLabel: "Körperschaftsteuer",
  weakTriggers: [/\bgmbh\b/i, /\bag\b/i, /\bug\b/i, /kapitalgesellschaft/i, /k(ö|oe)rperschaft/i, /aussch(ü|ue)ttung/i],
  mediumTriggers: [
    /gesellschafter/i,
    /organschaft/i,
    /einlagekonto/i,
    /verlustvortrag/i,
    /verlustabzug/i,
    /gewinnabf(ü|ue)hrungsvertrag/i,
    /gesch(ä|ae)ftsf(ü|ue)hrer/i,
  ],
  strongTriggers: [
    /§\s*8\s*(abs\s*3|kstg)/i,
    /§\s*27\s*kstg/i,
    /§\s*14\s*kstg/i,
    /§\s*8c\s*kstg/i,
    /§\s*8d\s*kstg/i,
    /k(ö|oe)rperschaftsteuer/i,
    /kapitalertragsteuer/i,
  ],
  exclusiveTriggers: [/verdeckte\s+gewinnaussch(ü|ue)ttung/i, /\bvga\b/i, /verdeckte\s+einlage/i],
  negativeTriggers: [],
  minimumScore: 5,
  scenarioTypes: [
    "hiddenProfitDistribution",
    "hiddenContribution",
    "organschaft",
    "contributionAccount",
    "profitDistribution",
    "lossCarryforward",
  ],
  followUpQuestions: [
    "Rechtsform der Körperschaft?",
    "Beteiligungsverhältnisse?",
    "Fremdvergleich möglich?",
  ],
  knowledgeFilter: (t) => t === "koerperschaftsteuer",
  decide: (ctx) => runFirstMatchingRule(CORPORATE_TAX_RULES, ctx),
  regressionTests: [
    {
      id: "kst.vGA",
      prompt:
        "Eine GmbH zahlt ihrem Gesellschafter-Geschäftsführer ein unangemessen hohes Gehalt. Liegt eine verdeckte Gewinnausschüttung vor?",
      expect: ["verdeckte Gewinnaussch", "§ 8 Abs. 3", "Fremdvergleich"],
      mustBeTaxType: "koerperschaftsteuer",
    },
    {
      id: "kst.organschaft",
      prompt:
        "Eine deutsche Konzernmutter und ihre 100%-Tochter-GmbH schließen einen Gewinnabführungsvertrag ab. Es liegt eine Organschaft vor. Wie wird das Einkommen zugerechnet?",
      expect: ["Organschaft", "§ 14"],
      mustBeTaxType: "koerperschaftsteuer",
    },
    {
      id: "kst.einlagekonto",
      prompt: "Eine GmbH leistet eine Auszahlung aus dem steuerlichen Einlagekonto nach § 27 KStG.",
      expect: ["Einlagekonto", "§ 27 KStG"],
      mustBeTaxType: "koerperschaftsteuer",
    },
    {
      id: "kst.verlustvortrag",
      prompt:
        "Eine GmbH hat einen Verlustvortrag von 3 Mio. €. 60 % der Anteile werden veräußert. Wie wirkt § 8c KStG?",
      expect: ["§ 8c", "Verlustvortrag"],
      mustBeTaxType: "koerperschaftsteuer",
    },
  ],
};

export default mod;
