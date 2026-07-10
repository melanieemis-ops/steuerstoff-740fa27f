import type { RuleModule } from "./types";
import type { RuleContext, RuleResult } from "../rules/ruleTypes";

function decideLSt(ctx: RuleContext): RuleResult {
  const t = ctx.facts.raw.lower;
  let sub = "generic";
  let headline = "Lohnsteuer";
  const legalRefs: string[] = ["§ 38 EStG", "§ 39 EStG", "§ 41a EStG"];
  const schemaSteps: { id: string; label: string }[] = [];
  let narrative =
    "Die Lohnsteuer ist eine Erhebungsform der Einkommensteuer. Der Arbeitgeber behält sie bei jeder Lohnzahlung ein (§ 38 EStG) und meldet sie beim Betriebsstättenfinanzamt an (§ 41a EStG). Bemessungsgrundlage ist der steuerpflichtige Arbeitslohn einschließlich geldwerter Vorteile.";

  if (/(firmenwagen|dienstwagen|1[\s-]*%[-\s]*regelung|bruttolistenpreis)/i.test(t)) {
    sub = "firmenwagen";
    headline = "Firmenwagen — 1-%-Regelung / Fahrtenbuch";
    legalRefs.push("§ 8 Abs. 2 Satz 2–5 EStG", "§ 6 Abs. 1 Nr. 4 Satz 2 EStG");
    schemaSteps.push(
      { id: "listenpreis", label: "Bruttolistenpreis inkl. Sonderausstattung bestimmen (abgerundet auf 100 €)" },
      { id: "einsprozent", label: "1 % des Listenpreises pro Monat als geldwerter Vorteil (§ 8 Abs. 2 EStG)" },
      { id: "fahrten", label: "+ 0,03 % je km einfache Entfernung Wohnung — erste Tätigkeitsstätte" },
      { id: "alternative", label: "Wahlrecht Fahrtenbuch: tatsächlicher Privatanteil × Gesamtkosten" },
      { id: "lohnsteuer", label: "Erhöhung des Bruttolohns → Lohnsteuer, SolZ, ggf. KiSt, SV" },
    );
  } else if (/(sachbezug|geldwerter\s+vorteil)/i.test(t)) {
    sub = "sachbezug";
    headline = "Sachbezüge / geldwerter Vorteil";
    legalRefs.push("§ 8 Abs. 2 EStG", "§ 8 Abs. 3 EStG");
    schemaSteps.push(
      { id: "bewertung", label: "Bewertung mit üblichen Endpreisen (§ 8 Abs. 2 S. 1 EStG)" },
      { id: "freigrenze", label: "44/50-€-Freigrenze bzw. Rabattfreibetrag (§ 8 Abs. 3 EStG: 1.080 €)" },
      { id: "lohnsteuer", label: "Lohnsteuer-, SolZ- und SV-Pflicht" },
    );
  } else if (/(minijob|midijob|geringf(ü|ue)gig)/i.test(t)) {
    sub = "minijob";
    headline = "Minijob / Midijob";
    legalRefs.push("§ 40a EStG", "§ 8 SGB IV");
    schemaSteps.push(
      { id: "grenze", label: "Geringfügigkeitsgrenze prüfen (§ 8 SGB IV)" },
      { id: "pauschal", label: "Pauschale Lohnsteuer 2 % / 20 % (§ 40a EStG) — Wahlrecht" },
      { id: "sv", label: "Pauschale Sozialabgaben des Arbeitgebers" },
    );
  } else if (/elstam|steuerklasse/i.test(t)) {
    sub = "elstam";
    headline = "ELStAM / Steuerklassen";
    legalRefs.push("§ 39 EStG", "§ 39e EStG");
    schemaSteps.push(
      { id: "abruf", label: "Elektronischer Abruf der Lohnsteuerabzugsmerkmale (§ 39e EStG)" },
      { id: "klassen", label: "Steuerklassen I–VI, Faktorverfahren möglich" },
      { id: "aenderung", label: "Änderung durch Antrag beim Finanzamt" },
    );
  }

  return {
    taxType: "lohnsteuer",
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
  taxType: "lohnsteuer",
  taxLabel: "Lohnsteuer",
  weakTriggers: [/\blohn/i, /\bgehalt\b/i, /arbeitgeber/i, /arbeitslohn/i, /\barbeitnehmer\b/i],
  mediumTriggers: [
    /elstam/i,
    /sachbezug/i,
    /geldwerter\s+vorteil/i,
    /steuerklasse/i,
    /minijob/i,
    /midijob/i,
    /geringf(ü|ue)gig/i,
    /lohnsteueranmeldung/i,
    /lohnkonto/i,
    /bruttolistenpreis/i,
  ],
  strongTriggers: [
    /lohnsteuer/i,
    /\blstg?\b/i,
    /firmenwagen/i,
    /dienstwagen/i,
    /1[\s-]*%[-\s]*regelung/i,
    /§\s*(38|39|39a|39e|40|40a|41|41a|42|42d)\s*estg\b/i,
  ],
  exclusiveTriggers: [/lohnsteuer/i],
  negativeTriggers: [],
  minimumScore: 5,
  scenarioTypes: ["firmenwagen", "sachbezug", "minijob", "elstam"],
  followUpQuestions: [
    "Wie hoch ist der Bruttolistenpreis des Fahrzeugs?",
    "Wird ein Fahrtenbuch geführt?",
    "Welche Steuerklasse liegt vor?",
  ],
  knowledgeFilter: (t) => t === "lohnsteuer",
  decide: decideLSt,
  regressionTests: [
    {
      id: "lst.firmenwagen",
      prompt:
        "Ein Arbeitnehmer erhält einen Firmenwagen mit Bruttolistenpreis 40.000 €. Wie ist die 1-%-Regelung anzuwenden?",
      expect: ["1 %", "Listenpreis"],
      mustBeTaxType: "lohnsteuer",
    },
    {
      id: "lst.minijob",
      prompt: "Wie wird ein Minijob lohnsteuerlich behandelt?",
      expect: ["Minijob", "§ 40a"],
      mustBeTaxType: "lohnsteuer",
    },
  ],
};

export default mod;
