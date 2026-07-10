import type { RuleModule } from "./types";
import type { RuleContext, RuleResult } from "../rules/ruleTypes";

function decideInt(ctx: RuleContext): RuleResult {
  const t = ctx.facts.raw.lower;
  let sub = "generic";
  let headline = "Internationales Steuerrecht";
  const legalRefs: string[] = ["§ 34c EStG", "OECD-MA"];
  const schemaSteps: { id: string; label: string }[] = [];
  let narrative =
    "Bei grenzüberschreitenden Sachverhalten ist die Steuerpflicht in beiden Staaten zu prüfen. Eine bestehende Doppelbesteuerung wird über bilaterale Doppelbesteuerungsabkommen (DBA) oder unilateral über § 34c EStG / § 26 KStG vermieden (Anrechnung oder Freistellung).";

  if (/wegzug/i.test(t)) {
    sub = "wegzugsbesteuerung";
    headline = "Wegzugsbesteuerung (§ 6 AStG)";
    legalRefs.push("§ 6 AStG", "§ 17 EStG");
    schemaSteps.push(
      { id: "tatbestand", label: "Beendigung der unbeschränkten Steuerpflicht bei > 1 %-Beteiligung" },
      { id: "fiktive-veraeu", label: "Fiktive Veräußerung der Anteile (§ 17 EStG i.V.m. § 6 AStG)" },
      { id: "stundung", label: "Stundung nach § 6 Abs. 4 AStG (Ratenzahlung 7 Jahre)" },
    );
  } else if (/dba|doppelbesteuerungsabkommen|doppelbesteuerung/i.test(t)) {
    sub = "dba";
    headline = "Doppelbesteuerungsabkommen (DBA)";
    legalRefs.push("DBA i.V.m. OECD-MA", "§ 34c EStG");
    schemaSteps.push(
      { id: "ansaessigkeit", label: "Ansässigkeit i.S.d. Art. 4 OECD-MA bestimmen" },
      { id: "einkunftsart", label: "Einkunftsart nach DBA einordnen (Art. 6–21 OECD-MA)" },
      { id: "verteilung", label: "Verteilungsnorm anwenden — Quellen- oder Ansässigkeitsstaat" },
      { id: "methode", label: "Methode: Freistellung mit Progressionsvorbehalt oder Anrechnung (Art. 23 OECD-MA)" },
      { id: "national", label: "Nationale Umsetzung (§ 32b EStG, § 34c EStG)" },
    );
  } else if (/betriebsst(ä|ae)tte/i.test(t)) {
    sub = "betriebsstaette";
    headline = "Betriebsstätte (§ 12 AO, Art. 5 OECD-MA)";
    legalRefs.push("§ 12 AO", "Art. 5 OECD-MA", "§ 1 Abs. 5 AStG");
    schemaSteps.push(
      { id: "definition", label: "Feste Geschäftseinrichtung + Verfügungsmacht (§ 12 AO)" },
      { id: "gewinnabgrenzung", label: "Gewinnabgrenzung nach AOA (§ 1 Abs. 5 AStG, BsGaV)" },
      { id: "besteuerungsrecht", label: "Betriebsstättenstaat hat Besteuerungsrecht (Art. 7 OECD-MA)" },
    );
  } else if (/verrechnungspreis/i.test(t)) {
    sub = "verrechnungspreise";
    headline = "Verrechnungspreise (§ 1 AStG)";
    legalRefs.push("§ 1 AStG", "Art. 9 OECD-MA");
    schemaSteps.push(
      { id: "fremdvergleich", label: "Fremdvergleichsgrundsatz (arm's length)" },
      { id: "methoden", label: "Standardmethoden: CUP, RPM, CPM, TNMM, Profit Split" },
      { id: "doku", label: "Dokumentationspflicht (§ 90 Abs. 3 AO, GAufzV)" },
    );
  } else if (/hinzurechnungsbesteuerung|astg|au(ß|ss)ensteuergesetz/i.test(t)) {
    sub = "hinzurechnungsbesteuerung";
    headline = "Hinzurechnungsbesteuerung (§§ 7 ff. AStG)";
    legalRefs.push("§ 7 AStG", "§ 8 AStG", "§ 10 AStG");
    schemaSteps.push(
      { id: "beteiligung", label: "Beherrschende Beteiligung an ausländischer Zwischengesellschaft" },
      { id: "passive-einkuenfte", label: "Passive, niedrig besteuerte Einkünfte (< 25 %)" },
      { id: "hinzurechnungsbetrag", label: "Hinzurechnungsbetrag nach § 10 AStG" },
    );
  }

  return {
    taxType: "internationales_steuerrecht",
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
  taxType: "internationales_steuerrecht",
  taxLabel: "Internationales Steuerrecht",
  weakTriggers: [/ausland/i, /grenz(ü|ue)berschreitend/i, /ausl(ä|ae)ndisch/i],
  mediumTriggers: [
    /doppelbesteuerung/i,
    /\bdba\b/i,
    /betriebsst(ä|ae)tte/i,
    /quellensteuer/i,
    /ans(ä|ae)ssig/i,
    /grenzg(ä|ae)nger/i,
    /wegzug/i,
    /verrechnungspreis/i,
    /oecd/i,
  ],
  strongTriggers: [
    /doppelbesteuerungsabkommen/i,
    /au(ß|ss)ensteuergesetz/i,
    /\bastg\b/i,
    /hinzurechnungsbesteuerung/i,
    /§\s*(1|6|7|8|10)\s*astg/i,
    /§\s*34c\s*estg/i,
  ],
  exclusiveTriggers: [/doppelbesteuerungsabkommen/i, /\bastg\b/i],
  negativeTriggers: [],
  minimumScore: 4,
  scenarioTypes: ["dba", "betriebsstaette", "verrechnungspreise", "hinzurechnungsbesteuerung", "wegzugsbesteuerung"],
  followUpQuestions: [
    "In welchem Staat ist die Person/Gesellschaft ansässig?",
    "Besteht ein DBA mit dem anderen Staat?",
    "Liegt eine Betriebsstätte vor?",
  ],
  knowledgeFilter: (t) => t === "internationales_steuerrecht",
  decide: decideInt,
  regressionTests: [
    {
      id: "int.dba",
      prompt:
        "Eine in Deutschland ansässige Person erzielt Zinsen aus den USA. Wie wirkt das DBA Deutschland–USA?",
      expect: ["DBA", "Ansässigkeit"],
      mustBeTaxType: "internationales_steuerrecht",
    },
    {
      id: "int.wegzug",
      prompt:
        "Ein Gesellschafter mit 20 % GmbH-Anteilen zieht in die Schweiz. Wegzugsbesteuerung nach § 6 AStG?",
      expect: ["Wegzug", "§ 6 AStG"],
      mustBeTaxType: "internationales_steuerrecht",
    },
  ],
};

export default mod;
