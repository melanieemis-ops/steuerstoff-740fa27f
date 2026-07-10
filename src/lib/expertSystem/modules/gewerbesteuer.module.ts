import type { RuleModule } from "./types";
import type { RuleContext, RuleResult } from "../rules/ruleTypes";

function decideGewSt(ctx: RuleContext): RuleResult {
  const t = ctx.facts.raw.lower;
  let sub = "generic";
  let headline = "Gewerbesteuer";
  const legalRefs: string[] = ["§ 2 GewStG", "§ 7 GewStG"];
  const schemaSteps: { id: string; label: string }[] = [];
  let narrative =
    "Die Gewerbesteuer wird auf den Gewerbeertrag inländischer Gewerbebetriebe erhoben (§ 2 GewStG). Ausgangsgröße ist der nach EStG/KStG ermittelte Gewinn, korrigiert um Hinzurechnungen (§ 8 GewStG) und Kürzungen (§ 9 GewStG). Auf den Gewerbeertrag wird die Steuermesszahl 3,5 % angewendet; der Steuermessbetrag wird mit dem Hebesatz der Gemeinde multipliziert.";

  if (/hinzurechnung/i.test(t)) {
    sub = "hinzurechnung";
    headline = "Hinzurechnungen nach § 8 GewStG";
    legalRefs.push("§ 8 Nr. 1 GewStG", "§ 8 Nr. 4 GewStG");
    schemaSteps.push(
      { id: "entgelte", label: "Entgelte für Schulden, Renten, Miete, Pacht, Lizenzen erfassen" },
      { id: "quote", label: "Anteilige Hinzurechnung nach § 8 Nr. 1 GewStG (25 % über Freibetrag 200.000 €)" },
      { id: "ergebnis", label: "Erhöhung des Gewerbeertrags" },
    );
  } else if (/k(ü|ue)rzung/i.test(t)) {
    sub = "kuerzung";
    headline = "Kürzungen nach § 9 GewStG";
    legalRefs.push("§ 9 Nr. 1 GewStG", "§ 9 Nr. 2 GewStG");
    schemaSteps.push(
      { id: "grundbesitz", label: "Kürzung Grundbesitz 1,2 % des Einheitswerts (§ 9 Nr. 1 S. 1)" },
      { id: "erw", label: "Ggf. erweiterte Grundstückskürzung (§ 9 Nr. 1 S. 2)" },
      { id: "beteiligungen", label: "Schachtelbeteiligungen (§ 9 Nr. 2a GewStG)" },
    );
  } else if (/zerlegung/i.test(t)) {
    sub = "zerlegung";
    headline = "Zerlegung des Gewerbesteuermessbetrags (§§ 28 ff. GewStG)";
    legalRefs.push("§ 28 GewStG", "§ 29 GewStG");
    schemaSteps.push(
      { id: "betriebsstaetten", label: "Betriebsstätten in mehreren Gemeinden feststellen" },
      { id: "arbeitsloehne", label: "Zerlegungsmaßstab: Arbeitslöhne (§ 29 GewStG)" },
      { id: "zerlegungsbescheid", label: "Zerlegungsbescheid an Gemeinden" },
    );
  } else if (/hebesatz|messbetrag|gewerbeertrag/i.test(t)) {
    sub = "grundschema";
    headline = "Gewerbesteuer — Grundschema";
    schemaSteps.push(
      { id: "ausgang", label: "Gewinn aus Gewerbebetrieb (§ 7 GewStG)" },
      { id: "hinz", label: "+ Hinzurechnungen (§ 8 GewStG)" },
      { id: "kuerz", label: "− Kürzungen (§ 9 GewStG)" },
      { id: "freibetrag", label: "− Freibetrag 24.500 € (§ 11 Abs. 1 GewStG) bei natürlichen Personen/PersG" },
      { id: "messzahl", label: "× 3,5 % Steuermesszahl (§ 11 Abs. 2 GewStG) = Messbetrag" },
      { id: "hebesatz", label: "× Hebesatz der Gemeinde = Gewerbesteuer" },
    );
  }

  return {
    taxType: "gewerbesteuer",
    scenario: sub,
    subScenario: sub,
    legalRefs,
    confidence: 0.92,
    headline,
    narrative,
    schemaSteps,
  };
}

const mod: RuleModule = {
  taxType: "gewerbesteuer",
  taxLabel: "Gewerbesteuer",
  weakTriggers: [/gewerbe\b/i, /betriebsst(ä|ae)tte/i, /gemeinde/i],
  mediumTriggers: [
    /hinzurechnung/i,
    /k(ü|ue)rzung/i,
    /messbetrag/i,
    /hebesatz/i,
    /zerlegung/i,
    /gewerbeertrag/i,
    /gewerbebetrieb/i,
  ],
  strongTriggers: [
    /gewerbesteuer/i,
    /gewstg?/i,
    /§\s*(2|7|8|9|10a|11|28|29)\s*gewstg?\b/i,
  ],
  exclusiveTriggers: [/gewerbesteuer/i],
  negativeTriggers: [],
  minimumScore: 5,
  scenarioTypes: ["grundschema", "hinzurechnung", "kuerzung", "zerlegung"],
  followUpQuestions: [
    "Rechtsform des Gewerbetreibenden?",
    "In wie vielen Gemeinden bestehen Betriebsstätten?",
    "Wie hoch ist der Gewerbeertrag?",
  ],
  knowledgeFilter: (t) => t === "gewerbesteuer",
  decide: decideGewSt,
  regressionTests: [
    {
      id: "gewst.grundschema",
      prompt: "Wie berechnet sich die Gewerbesteuer aus dem Gewerbeertrag mit Hebesatz?",
      expect: ["Hebesatz", "Messbetrag"],
      mustBeTaxType: "gewerbesteuer",
    },
    {
      id: "gewst.hinzurechnung",
      prompt: "Welche Hinzurechnungen nach § 8 GewStG sind bei Mieten und Zinsen zu machen?",
      expect: ["Hinzurechnung", "§ 8"],
      mustBeTaxType: "gewerbesteuer",
    },
  ],
};

export default mod;
