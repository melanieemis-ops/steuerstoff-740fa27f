import type { RuleModule } from "./types";
import type { RuleContext, RuleResult } from "../rules/ruleTypes";

function decideErbSt(ctx: RuleContext): RuleResult {
  const t = ctx.facts.raw.lower;
  let sub = "generic";
  let headline = "Erbschaft- und Schenkungsteuer";
  const legalRefs: string[] = ["§ 1 ErbStG", "§ 3 ErbStG"];
  const schemaSteps: { id: string; label: string }[] = [];
  let narrative =
    "Der Erbschaft- und Schenkungsteuer unterliegen der Erwerb von Todes wegen (§ 3 ErbStG), Schenkungen unter Lebenden (§ 7 ErbStG) und Zweckzuwendungen. Prüfschema: Steuerbarkeit → Bewertung → Freibetrag → Steuerklasse → Tarif.";

  const isSchenkung = /schenkung/i.test(t);
  const isErbe = /(erbe|erbschaft|nachlass|verm(ä|ae)chtnis|erbfall)/i.test(t);

  schemaSteps.push(
    { id: "steuerbarkeit", label: isSchenkung ? "Schenkung unter Lebenden (§ 7 ErbStG)" : "Erwerb von Todes wegen (§ 3 ErbStG)" },
    { id: "bewertung", label: "Bewertung des Erwerbs nach BewG bzw. ErbStG" },
    { id: "steuerklasse", label: "Steuerklasse nach Verwandtschaftsverhältnis (§ 15 ErbStG)" },
    { id: "freibetrag", label: "Persönlicher Freibetrag (§ 16 ErbStG): Ehegatten 500.000 €, Kinder 400.000 €, Enkel 200.000 €, Klasse II 20.000 €, Klasse III 20.000 €" },
    { id: "tarif", label: "Anwendung des Tarifs (§ 19 ErbStG)" },
    { id: "verguenstigungen", label: "Ggf. Verschonungsabschlag Betriebsvermögen (§§ 13a, 13b ErbStG)" },
  );

  if (isSchenkung) {
    sub = "schenkung";
    headline = "Schenkung unter Lebenden (§ 7 ErbStG)";
    legalRefs.push("§ 7 ErbStG", "§ 15 ErbStG", "§ 16 ErbStG", "§ 19 ErbStG");
    narrative =
      "Der Schenkungsteuer unterliegt jede freigebige Zuwendung, soweit der Bedachte auf Kosten des Zuwendenden bereichert wird (§ 7 Abs. 1 Nr. 1 ErbStG). Freibeträge nach § 16 ErbStG können alle 10 Jahre neu genutzt werden.";
  } else if (isErbe) {
    sub = "erbschaft";
    headline = "Erwerb von Todes wegen (§ 3 ErbStG)";
    legalRefs.push("§ 3 ErbStG", "§ 15 ErbStG", "§ 16 ErbStG", "§ 19 ErbStG");
  }

  if (/betriebsverm(ö|oe)gen|unternehmensnachfolge/i.test(t)) {
    schemaSteps.push({ id: "verschonung", label: "Regel-/Optionsverschonung (§§ 13a, 13b, 13c, 28a ErbStG)" });
    legalRefs.push("§ 13a ErbStG", "§ 13b ErbStG");
  }

  return {
    taxType: "erbschaftsteuer",
    scenario: sub,
    subScenario: sub,
    legalRefs,
    confidence: 0.9,
    headline,
    narrative,
    schemaSteps,
  };
}

const mod: RuleModule = {
  taxType: "erbschaftsteuer",
  taxLabel: "Erbschaft- und Schenkungsteuer",
  weakTriggers: [/\berbe\b/i, /nachlass/i, /erbin/i, /erblasser/i],
  mediumTriggers: [
    /erbschaft/i,
    /schenkung/i,
    /freibetrag/i,
    /verm(ä|ae)chtnis/i,
    /pflichtteil/i,
    /steuerklasse\s+i+/i,
    /erbfall/i,
    /unternehmensnachfolge/i,
    /betriebsverm(ö|oe)gen/i,
  ],
  strongTriggers: [
    /erbschaftsteuer/i,
    /schenkungsteuer/i,
    /erbstg?/i,
    /§\s*(3|7|10|13|13a|13b|15|16|17|19|28a)\s*erbstg/i,
  ],
  exclusiveTriggers: [/erbschaftsteuer/i, /schenkungsteuer/i],
  negativeTriggers: [],
  minimumScore: 4,
  scenarioTypes: ["erbschaft", "schenkung", "unternehmensnachfolge"],
  followUpQuestions: [
    "Verwandtschaftsverhältnis zum Erblasser/Schenker?",
    "Wert des Erwerbs?",
    "Betriebsvermögen enthalten?",
  ],
  knowledgeFilter: (t) => t === "erbschaftsteuer" || t === "schenkungsteuer",
  decide: decideErbSt,
  regressionTests: [
    {
      id: "erbst.schenkung",
      prompt:
        "Ein Vater schenkt seinem Sohn 500.000 €. Welche Schenkungsteuer fällt an? Freibetrag, Steuerklasse, Tarif?",
      expect: ["Schenkung", "Freibetrag", "§ 16"],
      mustBeTaxType: "erbschaftsteuer",
    },
    {
      id: "erbst.erbschaft",
      prompt: "Eine Witwe erbt vom verstorbenen Ehemann Vermögen im Wert von 800.000 €. Wie hoch ist die Erbschaftsteuer?",
      expect: ["Erb", "Freibetrag"],
      mustBeTaxType: "erbschaftsteuer",
    },
  ],
};

export default mod;
