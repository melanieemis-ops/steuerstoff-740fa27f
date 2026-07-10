import { BALANCE_SHEET_RULES } from "../rules/balanceSheetRules";
import { runFirstMatchingRule } from "./ruleRunner";
import type { RuleModule } from "./types";

const mod: RuleModule = {
  taxType: "bilanzsteuerrecht",
  taxLabel: "Bilanzsteuerrecht",
  weakTriggers: [/\bbilanz/i, /jahresabschluss/i, /inventar/i, /handelsbilanz/i, /steuerbilanz/i],
  mediumTriggers: [
    /r(ü|ue)ckstellung/i,
    /abschreibung/i,
    /\bafa\b/i,
    /aktivierung/i,
    /passivierung/i,
    /arap/i,
    /prap/i,
    /rechnungsabgrenz/i,
    /niederstwertprinzip/i,
    /ma(ß|ss)geblichkeit/i,
    /garantie/i,
  ],
  strongTriggers: [
    /bilanzstichtag/i,
    /§\s*249\s*hgb/i,
    /§\s*253\s*hgb/i,
    /§\s*5\s*abs\s*1\s*estg/i,
    /§\s*6\s*abs\s*1\s*nr\s*3a\s*estg/i,
    /ungewisse[rn]?\s+verbindlichkeit/i,
  ],
  exclusiveTriggers: [/garantier(ü|ue)ckstellung/i],
  negativeTriggers: [],
  minimumScore: 4,
  scenarioTypes: ["provisions", "warrantyProvision", "depreciation", "accrual"],
  followUpQuestions: [
    "Zu welchem Stichtag ist zu bilanzieren?",
    "Handels- oder Steuerbilanz?",
    "Höhe des zu bewertenden Betrags?",
  ],
  knowledgeFilter: (t) => t === "bilanzsteuerrecht",
  decide: (ctx) => runFirstMatchingRule(BALANCE_SHEET_RULES, ctx),
  regressionTests: [
    {
      id: "bilanz.garantieruecktellung",
      prompt:
        "Eine GmbH verkauft im Dezember 2025 Waren mit einer zweijährigen Garantie. Aufgrund der Erfahrungen der vergangenen Jahre ist mit Garantieaufwendungen von 18.000 € zu rechnen. Die einzelnen Garantiefälle stehen am Bilanzstichtag noch nicht fest. Wie ist der Sachverhalt zum 31.12.2025 bilanziell und steuerlich zu behandeln?",
      expect: ["Rückstellung", "§ 249", "HGB", "18.000", "§ 5 Abs. 1 EStG"],
      mustBeTaxType: "bilanzsteuerrecht",
    },
  ],
};

export default mod;
