import type { RuleModule } from "./types";
import type { RuleContext, RuleResult } from "../rules/ruleTypes";

function decideAO(ctx: RuleContext): RuleResult {
  const t = ctx.facts.raw.lower;
  let sub = "generic";
  let headline = "Verfahrensrechtliche Frage der Abgabenordnung";
  const legalRefs: string[] = ["§ 3 AO"];
  const schemaSteps: { id: string; label: string; result?: string }[] = [];
  let narrative =
    "Verfahrensrechtliche Einordnung nach der Abgabenordnung. Zuerst ist die einschlägige Verfahrensnorm zu bestimmen; erst danach werden Fristen, Formanforderungen und Rechtsfolgen geprüft.";

  if (/einspruch/i.test(t)) {
    sub = "einspruch";
    headline = "Einspruchsverfahren (§§ 347 ff. AO)";
    legalRefs.push("§ 347 AO", "§ 355 AO", "§ 357 AO", "§ 361 AO");
    narrative =
      "Der Einspruch ist der außergerichtliche Rechtsbehelf gegen Verwaltungsakte der Finanzbehörden (§ 347 AO). Er ist innerhalb eines Monats nach Bekanntgabe (§ 355 AO) schriftlich oder elektronisch (§ 357 AO) einzulegen. Der Einspruch hat keine aufschiebende Wirkung — für die Aussetzung der Vollziehung ist ein gesonderter Antrag nach § 361 AO zu stellen.";
    schemaSteps.push(
      { id: "statthaftigkeit", label: "Statthaftigkeit gegen den Verwaltungsakt (§ 347 AO)" },
      { id: "frist", label: "Einspruchsfrist: 1 Monat nach Bekanntgabe (§ 355 AO)" },
      { id: "form", label: "Form: schriftlich oder elektronisch (§ 357 AO)" },
      { id: "wirkung", label: "Keine aufschiebende Wirkung — ggf. AdV (§ 361 AO)" },
      { id: "entscheidung", label: "Einspruchsentscheidung oder Abhilfe" },
    );
  } else if (/festsetzungsverj|festsetzungsfrist|verj(ä|ae)hrung/i.test(t)) {
    sub = "festsetzungsverjaehrung";
    headline = "Festsetzungsverjährung (§§ 169 ff. AO)";
    legalRefs.push("§ 169 AO", "§ 170 AO", "§ 171 AO");
    narrative =
      "Nach Ablauf der Festsetzungsfrist ist eine Steuerfestsetzung sowie ihre Aufhebung oder Änderung nicht mehr zulässig (§ 169 Abs. 1 AO). Regelfrist 4 Jahre, bei leichtfertiger Steuerverkürzung 5 Jahre, bei Steuerhinterziehung 10 Jahre (§ 169 Abs. 2 AO). Anlauf- und Ablaufhemmungen sind gesondert zu prüfen.";
    schemaSteps.push(
      { id: "regel", label: "Regelfrist 4 Jahre; 5/10 Jahre bei Verkürzung/Hinterziehung (§ 169 AO)" },
      { id: "anlauf", label: "Anlaufhemmung (§ 170 AO)" },
      { id: "ablauf", label: "Ablaufhemmung (§ 171 AO)" },
    );
  } else if (/bekanntgabe|§\s*122/i.test(t)) {
    sub = "bekanntgabe";
    headline = "Bekanntgabe von Verwaltungsakten (§ 122 AO)";
    legalRefs.push("§ 122 AO", "§ 124 AO");
    narrative =
      "Verwaltungsakte werden demjenigen bekannt gegeben, für den sie bestimmt sind (§ 122 Abs. 1 AO). Bei Postübermittlung im Inland gilt die Drei-Tages-Fiktion (§ 122 Abs. 2 Nr. 1 AO). Erst mit Bekanntgabe wird der Verwaltungsakt wirksam (§ 124 AO).";
    schemaSteps.push(
      { id: "art", label: "Bekanntgabeart (schriftlich, elektronisch, mündlich)" },
      { id: "fiktion", label: "Drei-Tages-Fiktion bei Postübermittlung (§ 122 Abs. 2 AO)" },
      { id: "wirksamkeit", label: "Wirksamkeit ab Bekanntgabe (§ 124 AO)" },
    );
  } else if (/(§\s*(129|164|165|172|173|174|175)|(ä|ae)nderungsnorm|schlichte\s+(ä|ae)nderung)/i.test(t)) {
    sub = "aenderung";
    headline = "Änderung von Steuerbescheiden";
    legalRefs.push("§ 129 AO", "§ 164 AO", "§ 165 AO", "§ 173 AO", "§ 175 AO");
    narrative =
      "Steuerbescheide können nur nach den Korrekturnormen der §§ 129, 164, 165, 172–175 AO geändert werden. Erforderlich ist eine passende Änderungsnorm; ansonsten ist der Bescheid bestandskräftig.";
    schemaSteps.push(
      { id: "norm", label: "Einschlägige Änderungsnorm identifizieren" },
      { id: "vorbehalt", label: "Vorbehalt der Nachprüfung (§ 164 AO) — jederzeit änderbar" },
      { id: "neue-tatsachen", label: "Neue Tatsachen (§ 173 AO) — zugunsten/zulasten" },
      { id: "grundlagenbescheid", label: "Folgeänderung nach § 175 Abs. 1 Nr. 1 AO" },
    );
  } else if (/au(ß|ss)enpr(ü|ue)fung|betriebspr(ü|ue)fung/i.test(t)) {
    sub = "aussenpruefung";
    headline = "Außenprüfung / Betriebsprüfung (§§ 193 ff. AO)";
    legalRefs.push("§ 193 AO", "§ 196 AO", "§ 202 AO");
    schemaSteps.push(
      { id: "anordnung", label: "Prüfungsanordnung (§ 196 AO)" },
      { id: "durchfuehrung", label: "Durchführung, Mitwirkungspflichten (§ 200 AO)" },
      { id: "bericht", label: "Prüfungsbericht (§ 202 AO), ggf. Änderungsbescheide" },
    );
  }

  return {
    taxType: "abgabenordnung",
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
  taxType: "abgabenordnung",
  taxLabel: "Abgabenordnung",
  weakTriggers: [/\bfinanzamt\b/i, /\bfrist\b/i, /\bsteuerbescheid\b/i, /verwaltungsakt/i],
  mediumTriggers: [
    /einspruch/i,
    /bekanntgabe/i,
    /festsetzung/i,
    /verj(ä|ae)hrung/i,
    /aussetzung\s+der\s+vollziehung/i,
    /schätzung/i,
    /au(ß|ss)enpr(ü|ue)fung/i,
    /betriebspr(ü|ue)fung/i,
    /(ä|ae)nderungsnorm/i,
  ],
  strongTriggers: [
    /abgabenordnung/i,
    /§\s*(122|129|164|165|169|170|171|172|173|174|175|193|347|355|357|361)\s*ao\b/i,
    /festsetzungsverj(ä|ae)hrung/i,
  ],
  exclusiveTriggers: [/\bao\s*(§|abs|\.|,|\?|$)/i],
  negativeTriggers: [],
  minimumScore: 5,
  scenarioTypes: ["einspruch", "festsetzungsverjaehrung", "bekanntgabe", "aenderung", "aussenpruefung"],
  followUpQuestions: [
    "Wann wurde der Bescheid bekannt gegeben?",
    "Steht der Bescheid unter Vorbehalt der Nachprüfung?",
    "Liegt ein Grundlagenbescheid vor?",
  ],
  knowledgeFilter: (t) => t === "abgabenordnung",
  decide: decideAO,
  regressionTests: [
    {
      id: "ao.einspruch",
      prompt:
        "Ein Steuerbescheid wurde am 05.03. bekannt gegeben. Wie lange ist die Einspruchsfrist nach § 355 AO?",
      expect: ["Einspruch", "§ 355 AO"],
      mustBeTaxType: "abgabenordnung",
    },
    {
      id: "ao.festsetzung",
      prompt: "Wann tritt Festsetzungsverjährung nach § 169 AO ein?",
      expect: ["Festsetzungs", "§ 169 AO"],
      mustBeTaxType: "abgabenordnung",
    },
    {
      id: "ao.negative.gewerbesteuer",
      prompt: "Wie hoch ist der Gewerbesteuerhebesatz in Berlin?",
      mustNotWin: true,
    },
  ],
};

export default mod;
