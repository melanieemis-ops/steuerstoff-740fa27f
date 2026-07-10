import type { RuleModule } from "./types";
import type { RuleContext, RuleResult } from "../rules/ruleTypes";

function decideNPO(ctx: RuleContext): RuleResult {
  const t = ctx.facts.raw.lower;
  let sub = "generic";
  let headline = "Gemeinnützigkeitsrecht";
  const legalRefs: string[] = ["§ 52 AO", "§ 55 AO"];
  const schemaSteps: { id: string; label: string }[] = [];
  let narrative =
    "Steuerbegünstigt sind Körperschaften, die ausschließlich und unmittelbar gemeinnützige, mildtätige oder kirchliche Zwecke verfolgen (§§ 51 ff. AO). Zu prüfen sind Satzung, tatsächliche Geschäftsführung, Mittelverwendung und die Zuordnung wirtschaftlicher Aktivitäten zu einer der vier Sphären.";

  if (/zweckbetrieb/i.test(t)) {
    sub = "zweckbetrieb";
    headline = "Zweckbetrieb (§§ 65–68 AO)";
    legalRefs.push("§ 65 AO", "§§ 66–68 AO");
    schemaSteps.push(
      { id: "definition", label: "Zweckverwirklichung durch den wirtschaftlichen Betrieb (§ 65 Nr. 1 AO)" },
      { id: "notwendig", label: "Betrieb ist zur Zweckverwirklichung notwendig (§ 65 Nr. 2 AO)" },
      { id: "wettbewerb", label: "Kein vermeidbarer Wettbewerb zu steuerpflichtigen Betrieben (§ 65 Nr. 3 AO)" },
      { id: "katalog", label: "Ggf. Katalog-Zweckbetriebe (§§ 66–68 AO)" },
      { id: "folge", label: "Rechtsfolge: KSt/GewSt-Befreiung, ermäßigter USt-Satz (§ 12 Abs. 2 Nr. 8 UStG)" },
    );
  } else if (/wirtschaftlicher\s+gesch(ä|ae)ftsbetrieb/i.test(t)) {
    sub = "wgb";
    headline = "Wirtschaftlicher Geschäftsbetrieb (§ 14 AO / § 64 AO)";
    legalRefs.push("§ 14 AO", "§ 64 AO");
    schemaSteps.push(
      { id: "definition", label: "Selbstständige nachhaltige Tätigkeit mit Einnahmen (§ 14 AO)" },
      { id: "abgrenzung", label: "Abgrenzung Vermögensverwaltung ↔ WGB ↔ Zweckbetrieb" },
      { id: "grenze", label: "Besteuerungsgrenze 45.000 € (§ 64 Abs. 3 AO)" },
      { id: "folge", label: "KSt/GewSt-Pflicht des WGB; Regel-USt-Satz" },
    );
  } else if (/mittelverwendung|zeitnah/i.test(t)) {
    sub = "mittelverwendung";
    headline = "Mittelverwendung (§ 55 AO)";
    legalRefs.push("§ 55 AO", "§ 62 AO");
    schemaSteps.push(
      { id: "zeitnah", label: "Zeitnahe Mittelverwendung: bis Ende zweites Folgejahr (§ 55 Abs. 1 Nr. 5 AO)" },
      { id: "ruecklagen", label: "Zulässige Rücklagen nach § 62 AO (Projekt-, Betriebsmittel-, freie Rücklage)" },
      { id: "nachweis", label: "Mittelverwendungsrechnung / Nachweis" },
    );
  } else if (/spendenbescheinig|zuwendungsbest/i.test(t)) {
    sub = "spendenbescheinigung";
    headline = "Zuwendungsbestätigung (§ 50 EStDV)";
    legalRefs.push("§ 10b EStG", "§ 50 EStDV");
    schemaSteps.push(
      { id: "amtl-muster", label: "Amtlich vorgeschriebenes Muster verwenden" },
      { id: "voraussetzungen", label: "Empfänger ist gemeinnützig anerkannt (Feststellungsbescheid § 60a AO)" },
      { id: "haftung", label: "Spendenhaftung bei falschen/zweckwidrig verwendeten Zuwendungen (§ 10b Abs. 4 EStG)" },
    );
  } else {
    sub = "spaeren";
    headline = "Vier-Sphären-Modell";
    schemaSteps.push(
      { id: "ideell", label: "Ideeller Bereich — steuerfrei" },
      { id: "vermoegen", label: "Vermögensverwaltung — steuerfrei" },
      { id: "zweckbetrieb", label: "Zweckbetrieb — KSt/GewSt-frei, USt ermäßigt" },
      { id: "wgb", label: "Wirtschaftlicher Geschäftsbetrieb — voll steuerpflichtig (§ 64 AO)" },
    );
  }

  return {
    taxType: "gemeinnuetzigkeit",
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
  taxType: "gemeinnuetzigkeit",
  taxLabel: "Gemeinnützigkeitsrecht",
  weakTriggers: [/\bverein\b/i, /stiftung/i, /gug\b/i, /ggmbh/i],
  mediumTriggers: [
    /gemeinn(ü|ue)tzig/i,
    /zweckbetrieb/i,
    /mittelverwendung/i,
    /verm(ö|oe)gensverwaltung/i,
    /spendenbescheinig/i,
    /zuwendungsbest/i,
    /ideeller?\s+bereich/i,
  ],
  strongTriggers: [
    /wirtschaftlich(er|en)\s+gesch(ä|ae)ftsbetrieb/i,
    /§\s*(14|52|55|58|60a|62|63|64|65|66|67|67a|68)\s*ao\b/i,
    /gemeinn(ü|ue)tzigkeit/i,
  ],
  exclusiveTriggers: [/gemeinn(ü|ue)tzigkeit/i],
  negativeTriggers: [],
  minimumScore: 4,
  scenarioTypes: ["spaeren", "zweckbetrieb", "wgb", "mittelverwendung", "spendenbescheinigung"],
  followUpQuestions: [
    "Ist die Körperschaft nach § 60a AO anerkannt?",
    "Welcher Sphäre ist die Tätigkeit zuzuordnen?",
    "Wie hoch sind die Einnahmen des wirtschaftlichen Geschäftsbetriebs?",
  ],
  knowledgeFilter: (t) => t === "gemeinnuetzigkeit",
  decide: decideNPO,
  regressionTests: [
    {
      id: "npo.zweckbetrieb",
      prompt:
        "Ein gemeinnütziger Verein betreibt eine Sportgaststätte. Handelt es sich um einen Zweckbetrieb oder einen wirtschaftlichen Geschäftsbetrieb?",
      expect: ["Zweckbetrieb", "§ 65"],
      mustBeTaxType: "gemeinnuetzigkeit",
    },
    {
      id: "npo.mittelverwendung",
      prompt: "Wie ist die zeitnahe Mittelverwendung nach § 55 AO umzusetzen?",
      expect: ["Mittelverwendung", "§ 55"],
      mustBeTaxType: "gemeinnuetzigkeit",
    },
  ],
};

export default mod;
