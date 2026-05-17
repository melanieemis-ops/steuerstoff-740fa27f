export type Risk = "gruen" | "gelb" | "rot";

export type AnswerMode =
  | "kurz"
  | "pruefnotiz"
  | "mandant"
  | "rueckfrage"
  | "buchung";

export const ANSWER_MODES: { id: AnswerMode; label: string }[] = [
  { id: "kurz", label: "Kurze Antwort" },
  { id: "pruefnotiz", label: "Kanzleiinterne Prüfnotiz" },
  { id: "mandant", label: "Mandantenfreundliche Antwort" },
  { id: "rueckfrage", label: "Rückfragebrief" },
  { id: "buchung", label: "Buchungsvorschlag (DATEV)" },
];

export type Kind =
  | "wissen"
  | "buchung"
  | "npo"
  | "ust"
  | "fall";

export const KIND_LABEL: Record<Kind, string> = {
  wissen: "Wissensfrage",
  buchung: "Buchungsfrage",
  npo: "NPO-Frage",
  ust: "USt-Frage",
  fall: "Komplexer Kanzlei-Fall",
};

export interface AnalysisInput {
  title: string;
  topic: string;
  description: string;
}

export interface KnowledgeAnswer {
  answer: string;
  explanation: string;
  references?: string[];
}

export interface Analysis {
  kind: Kind;
  risk: Risk;
  riskReason: string;
  summary: string;
  missing: string[];
  questions: string[];
  recommendation: string;
  answers: Record<AnswerMode, string>;
  knowledge?: KnowledgeAnswer;
}

// ---------- Knowledge base (kurze Fachantworten) ----------

interface KnowledgeRule {
  keywords: RegExp;
  kind: Exclude<Kind, "fall">;
  answer: string;
  explanation: string;
  references?: string[];
}

const KNOWLEDGE_RULES: KnowledgeRule[] = [
  {
    keywords: /strom.*(umsatzsteuer|ust|mwst|mehrwertsteuer)|(umsatzsteuer|ust|mwst|mehrwertsteuer).*strom/i,
    kind: "ust",
    answer:
      "Auf Stromlieferungen fallen in Deutschland regelmäßig 19 % Umsatzsteuer an.",
    explanation:
      "Der reguläre Umsatzsteuersatz beträgt derzeit 19 % (§ 12 Abs. 1 UStG). In Rechnungen wird er üblicherweise separat ausgewiesen. Der ermäßigte Satz (7 %) ist für Strom nicht anwendbar.",
    references: ["§ 12 Abs. 1 UStG"],
  },
  {
    keywords: /reverse[\s-]?charge|§\s*13b/i,
    kind: "ust",
    answer:
      "Reverse Charge bezeichnet den Übergang der Steuerschuldnerschaft vom leistenden Unternehmer auf den Leistungsempfänger (§ 13b UStG).",
    explanation:
      "Typisch bei sonstigen Leistungen ausländischer Unternehmer an inländische B2B-Empfänger. Der Empfänger meldet und zahlt die Umsatzsteuer selbst und kann sie gleichzeitig als Vorsteuer abziehen, sofern er zum Abzug berechtigt ist. Die Rechnung wird ohne USt-Ausweis mit dem Hinweis „Steuerschuldnerschaft des Leistungsempfängers“ ausgestellt.",
    references: ["§ 13b UStG", "§ 3a Abs. 2 UStG"],
  },
  {
    keywords: /\bvorsteuer\b/i,
    kind: "ust",
    answer:
      "Vorsteuer ist die Umsatzsteuer, die ein Unternehmer auf Eingangsleistungen zahlt und beim Finanzamt vom eigenen Umsatzsteuerbetrag abziehen kann (§ 15 UStG).",
    explanation:
      "Voraussetzung ist eine ordnungsgemäße Rechnung nach § 14 UStG und die Verwendung der Leistung für steuerpflichtige Ausgangsumsätze. Regelsatz 19 %, ermäßigter Satz 7 %.",
    references: ["§ 15 UStG", "§ 14 UStG"],
  },
  {
    keywords: /\barap\b|aktive rechnungsabgrenzung/i,
    kind: "buchung",
    answer:
      "ARAP = Aktiver Rechnungsabgrenzungsposten. Auszahlungen vor dem Bilanzstichtag, die Aufwand für einen bestimmten Zeitraum nach dem Stichtag darstellen (§ 250 Abs. 1 HGB, § 5 Abs. 5 EStG).",
    explanation:
      "Typische Beispiele: vorausbezahlte Miete, Versicherung, Hosting. Der ARAP wird in den Folgeperioden ratierlich als Aufwand aufgelöst, damit die Periodenabgrenzung gewahrt bleibt. Buchung SKR03: 980 ARAP an 1200 Bank; Auflösung an Aufwandskonto.",
    references: ["§ 250 HGB", "§ 5 Abs. 5 EStG"],
  },
  {
    keywords: /zweckbetrieb/i,
    kind: "npo",
    answer:
      "Ein Zweckbetrieb ist ein wirtschaftlicher Geschäftsbetrieb einer gemeinnützigen Körperschaft, der unmittelbar der Verwirklichung steuerbegünstigter Zwecke dient (§§ 65–68 AO).",
    explanation:
      "Erträge aus dem Zweckbetrieb sind körperschaft- und gewerbesteuerfrei und unterliegen umsatzsteuerlich häufig dem ermäßigten Steuersatz (7 %, § 12 Abs. 2 Nr. 8a UStG). Abzugrenzen vom steuerpflichtigen wirtschaftlichen Geschäftsbetrieb.",
    references: ["§§ 65–68 AO", "§ 12 Abs. 2 Nr. 8a UStG"],
  },
  {
    keywords: /umsatzsteuersatz|mehrwertsteuersatz|wie hoch.*(ust|mwst|umsatzsteuer)/i,
    kind: "ust",
    answer:
      "Der reguläre Umsatzsteuersatz in Deutschland beträgt 19 %, der ermäßigte Satz 7 % (§ 12 UStG).",
    explanation:
      "Der ermäßigte Satz gilt u. a. für Lebensmittel, Bücher, Personennahverkehr und Beherbergung. Bestimmte Leistungen sind nach § 4 UStG umsatzsteuerfrei.",
    references: ["§ 12 UStG", "§ 4 UStG"],
  },
  {
    keywords: /kleinunternehmer|§\s*19\s*ustg/i,
    kind: "ust",
    answer:
      "Kleinunternehmer nach § 19 UStG sind Unternehmer, deren Vorjahresumsatz 25.000 € nicht überschritten hat und im laufenden Jahr voraussichtlich 100.000 € nicht überschreitet (Stand 2025).",
    explanation:
      "Kleinunternehmer weisen keine Umsatzsteuer aus und sind nicht zum Vorsteuerabzug berechtigt. Auf der Rechnung ist ein Hinweis auf die Kleinunternehmerregelung erforderlich.",
    references: ["§ 19 UStG"],
  },
  {
    keywords: /spendenbescheinigung|zuwendungsbestätigung/i,
    kind: "npo",
    answer:
      "Zuwendungsbestätigungen müssen nach amtlichem Muster (§ 50 EStDV) ausgestellt werden, damit der Zuwendende den Sonderausgabenabzug erhält.",
    explanation:
      "Bis 300 € genügt der vereinfachte Nachweis (Kontoauszug + Empfangsbestätigung). Bei höheren Beträgen ist das amtliche Muster zwingend; die Körperschaft muss die Mittelverwendung für satzungsmäßige Zwecke bestätigen.",
    references: ["§ 50 EStDV", "§ 10b EStG"],
  },
  {
    keywords: /mittelverwendung/i,
    kind: "npo",
    answer:
      "Gemeinnützige Körperschaften müssen ihre Mittel zeitnah, d. h. spätestens in den auf den Zufluss folgenden zwei Kalender- bzw. Wirtschaftsjahren für satzungsmäßige Zwecke verwenden (§ 55 Abs. 1 Nr. 5 AO).",
    explanation:
      "Nachweis erfolgt über die Mittelverwendungsrechnung. Ausnahmen: zulässige Rücklagen nach § 62 AO (z. B. freie Rücklage, zweckgebundene Rücklage, Wiederbeschaffungsrücklage).",
    references: ["§ 55 AO", "§ 62 AO"],
  },
  {
    keywords: /\bopos\b|offene posten/i,
    kind: "buchung",
    answer:
      "OPOS (Offene-Posten-Buchhaltung) erfasst alle noch nicht ausgeglichenen Forderungen und Verbindlichkeiten je Geschäftspartner.",
    explanation:
      "Grundlage für Mahnwesen, Saldenabstimmung und Wertberichtigungen. Bei dauerhafter Uneinbringlichkeit ist die Umsatzsteuer nach § 17 UStG zu berichtigen.",
    references: ["§ 17 UStG"],
  },
];

// ---------- Fallregeln (komplexe Sachverhalte) ----------

interface CaseRule {
  keywords: RegExp;
  kind: Exclude<Kind, "wissen">;
  risk: Risk;
  riskReason: string;
  summary: string;
  missing: string[];
  questions: string[];
  recommendation: string;
  datev: { konto: string; bezeichnung: string; skr: "SKR03" | "SKR04" | "SKR42" }[];
}

const CASE_RULES: CaseRule[] = [
  {
    keywords: /bewirtung|geschäftsessen|restaurant|teilnehmer/i,
    kind: "ust",
    risk: "gelb",
    riskReason:
      "Vorsteuerabzug und Betriebsausgabenabzug nur bei vollständiger Bewirtungsdokumentation (§ 4 Abs. 5 Nr. 2 EStG, § 15 UStG).",
    summary:
      "Bewirtungsaufwand mit potenziell unvollständiger Belegdokumentation. Zu prüfen sind Angemessenheit, Anlass, Teilnehmerangaben sowie Vorsteuerabzug.",
    missing: [
      "Namen und Funktion aller Teilnehmer (inkl. eigene Mitarbeitende)",
      "Konkreter geschäftlicher Anlass (nicht nur „Geschäftsessen“)",
      "Maschinell erstellte Rechnung mit Steuernummer / USt-ID des Restaurants",
      "Datum, Ort sowie Unterschrift des Bewirtenden",
    ],
    questions: [
      "Können Sie uns die vollständige Teilnehmerliste mit Funktion (Mitarbeitende vs. Geschäftspartner) übermitteln?",
      "Welcher konkrete geschäftliche Anlass lag dem Essen zugrunde?",
      "Liegt eine maschinell erstellte Restaurantrechnung mit ausgewiesener Umsatzsteuer vor?",
    ],
    recommendation:
      "70 % der Nettokosten als Betriebsausgabe (§ 4 Abs. 5 Nr. 2 EStG), 100 % Vorsteuerabzug bei ordnungsgemäßer Rechnung. Eigenbeleg nur ergänzend zulässig — Teilnehmerangaben zwingend nachfordern.",
    datev: [
      { konto: "4650", bezeichnung: "Bewirtungskosten (abzugsfähig 70 %)", skr: "SKR03" },
      { konto: "4654", bezeichnung: "Nicht abzugsfähige Bewirtungskosten (30 %)", skr: "SKR03" },
      { konto: "1576", bezeichnung: "Abziehbare Vorsteuer 19 %", skr: "SKR03" },
    ],
  },
  {
    keywords: /reverse[\s-]?charge|§\s*13b|ausland|eu-leistung/i,
    kind: "ust",
    risk: "gelb",
    riskReason:
      "Reverse-Charge-Verfahren nach § 13b UStG erfordert korrekten Hinweis auf der Rechnung und Anmeldung der Steuerschuldnerschaft.",
    summary:
      "Leistung eines im Ausland ansässigen Unternehmers — Übergang der Steuerschuldnerschaft auf den Leistungsempfänger nach § 13b UStG zu prüfen.",
    missing: [
      "Sitz/USt-ID des leistenden Unternehmers",
      "Leistungsort nach § 3a UStG (B2B Empfängerortprinzip?)",
      "Hinweis „Steuerschuldnerschaft des Leistungsempfängers“ auf Rechnung",
    ],
    questions: [
      "Hat der Leistungserbringer eine gültige ausländische USt-ID?",
      "Liegt die Rechnung ohne Umsatzsteuerausweis mit § 13b-Hinweis vor?",
    ],
    recommendation:
      "Bei B2B-Leistung aus EU/Drittland: USt nach § 13b UStG selbst berechnen, anmelden und gleichzeitig Vorsteuer ziehen. ZM-Meldung bei EU-Leistungen prüfen.",
    datev: [
      { konto: "3123", bezeichnung: "Sonstige Leistungen § 13b UStG 19 %", skr: "SKR03" },
      { konto: "1577", bezeichnung: "Abziehbare Vorsteuer § 13b UStG", skr: "SKR03" },
    ],
  },
  {
    keywords: /arap|aktive rechnungsabgrenzung|hosting|miete vorauszahlung|versicherung/i,
    kind: "buchung",
    risk: "gruen",
    riskReason:
      "Periodengerechte Abgrenzung nach § 250 HGB / § 5 Abs. 5 EStG — Standardvorgang ohne besonderes Risiko, sofern Zeitraum eindeutig.",
    summary:
      "Vorauszahlung für Zeitraum nach Bilanzstichtag — Bildung einer aktiven Rechnungsabgrenzung erforderlich.",
    missing: [
      "Exakter Leistungszeitraum (Beginn / Ende)",
      "Rechnungsbetrag netto und Steuerbetrag",
    ],
    questions: [
      "Welcher Leistungszeitraum ist auf der Rechnung ausgewiesen?",
      "Liegt der Betrag über der GWG-/Wesentlichkeitsgrenze der Kanzleirichtlinie?",
    ],
    recommendation:
      "Aufwand zeitanteilig auf die Perioden verteilen. Über ARAP (Konto 980 SKR03 / 1900 SKR04) abgrenzen, monatliche Auflösung über wiederkehrende Buchung einrichten.",
    datev: [
      { konto: "0980", bezeichnung: "Aktive Rechnungsabgrenzung", skr: "SKR03" },
      { konto: "4380", bezeichnung: "Fremdleistungen / EDV-Kosten", skr: "SKR03" },
    ],
  },
  {
    keywords: /verein|gemeinnützig|npo|mittelverwendung|zweckbetrieb|§\s*62|rücklage/i,
    kind: "npo",
    risk: "gelb",
    riskReason:
      "Mittelverwendung und Rücklagenbildung sind formell streng geregelt (§§ 55, 62 AO). Verstöße gefährden die Gemeinnützigkeit.",
    summary:
      "Sachverhalt im Bereich gemeinnütziger Körperschaften — Sphärenzuordnung (ideell, Vermögensverwaltung, Zweckbetrieb, wirtschaftlicher Geschäftsbetrieb) und Mittelverwendung zu prüfen.",
    missing: [
      "Zuordnung zu einer der vier Sphären",
      "Aktuelle Mittelverwendungsrechnung",
      "Rücklagenkatalog nach § 62 AO (freie Rücklage, zweckgebundene Rücklage)",
    ],
    questions: [
      "Welche Sphäre wird mit dem Sachverhalt berührt?",
      "Wurden die Mittel innerhalb der Zwei-Jahres-Frist nach § 55 Abs. 1 Nr. 5 AO verwendet?",
      "Soll eine Rücklage nach § 62 Abs. 1 Nr. 1–4 AO gebildet werden?",
    ],
    recommendation:
      "Sphärenzuordnung dokumentieren, Mittelverwendungsrechnung aktualisieren. Bei Rücklagenbildung schriftlichen Beschluss des zuständigen Organs einholen und im Anhang erläutern.",
    datev: [
      { konto: "8400", bezeichnung: "Erlöse Zweckbetrieb (SKR42)", skr: "SKR42" },
      { konto: "8500", bezeichnung: "Erlöse wirtschaftlicher Geschäftsbetrieb (SKR42)", skr: "SKR42" },
    ],
  },
  {
    keywords: /opos|offene posten|mahnung|forderung/i,
    kind: "buchung",
    risk: "gruen",
    riskReason: "Operativer OPOS-Vorgang — Risiko nur bei Wertberichtigungs- oder Ausbuchungsbedarf.",
    summary: "Offene-Posten-Verwaltung — Abstimmung Debitoren/Kreditoren und ggf. Wertberichtigung.",
    missing: ["Mahnstufe", "Letzter Zahlungseingang", "Ausfallrisiko (Insolvenz, Bonität)"],
    questions: [
      "Welche Mahnstufe wurde zuletzt versendet?",
      "Liegen Hinweise auf Zahlungsunfähigkeit vor (Insolvenzantrag, SCHUFA, Auskunftei)?",
    ],
    recommendation:
      "Bei begründetem Ausfallrisiko Einzelwertberichtigung bilden. Endgültige Uneinbringlichkeit nach § 17 UStG mit Berichtigung der Umsatzsteuer.",
    datev: [
      { konto: "2400", bezeichnung: "Forderungsverluste", skr: "SKR03" },
      { konto: "1246", bezeichnung: "EWB auf Forderungen", skr: "SKR03" },
    ],
  },
];

const DEFAULT_CASE: Omit<CaseRule, "keywords"> = {
  kind: "fall",
  risk: "gelb",
  riskReason:
    "Sachverhalt erfordert weitere Angaben — eine abschließende Beurteilung ist ohne Rückfragen nicht möglich.",
  summary:
    "Allgemeiner steuerlicher Sachverhalt — strukturierte Aufarbeitung empfohlen. Auf Vollständigkeit der Unterlagen und korrekte Sphären-/Kontenzuordnung achten.",
  missing: [
    "Vollständige Sachverhaltsbeschreibung",
    "Belege / Verträge im Original oder als PDF",
    "Beteiligte Parteien und Leistungszeitraum",
  ],
  questions: [
    "Können Sie den Sachverhalt mit Zeitraum und beteiligten Parteien näher beschreiben?",
    "Liegen alle zugehörigen Belege und Verträge vor?",
  ],
  recommendation:
    "Sachverhalt vollständig dokumentieren, Belege anfordern und anschließend rechtliche Würdigung vornehmen. Ggf. fachliche Zweitprüfung einplanen.",
  datev: [
    { konto: "1200", bezeichnung: "Bank", skr: "SKR03" },
    { konto: "1800", bezeichnung: "Privatentnahmen / Verrechnungskonto", skr: "SKR03" },
  ],
};

// ---------- Klassifizierung ----------

function isLikelyKnowledge(input: AnalysisInput): boolean {
  const desc = input.description.trim();
  const title = input.title.trim();
  if (desc.length === 0) return false;

  const startsWithQuestionWord =
    /^(was|wie|wann|wer|wo|warum|welche|wieso|wofür|wie\s*viel|wieviel|wie hoch|gibt es|gilt|gelten|kann man|muss man|darf man|braucht man)\b/i;

  const looksLikeQuestion =
    /\?\s*$/.test(desc) ||
    startsWithQuestionWord.test(desc) ||
    startsWithQuestionWord.test(title);

  // Konkrete Sachverhaltsmerkmale → eher Fall, nicht reine Wissensfrage
  const factMarkers =
    /\d+[.,]?\d*\s*(€|eur|euro)|rechnung\s+(vom|über|aus|nr\.?|nummer)|beleg|mandant|teilnehmer|leistungszeitraum|kontoauszug|bilanzstichtag|insolvenz|mahnstufe|wertberichtigung|geschäftsjahr\s+\d|01\.\d{2}\.\d{4}/i;

  const hasFactMarkers = factMarkers.test(`${title}\n${desc}`);
  const short = desc.length < 280;

  return looksLikeQuestion && short && !hasFactMarkers;
}

function pickKnowledgeRule(input: AnalysisInput): KnowledgeRule | null {
  const text = `${input.title}\n${input.description}\n${input.topic}`;
  for (const r of KNOWLEDGE_RULES) if (r.keywords.test(text)) return r;
  return null;
}

function pickCaseRule(input: AnalysisInput): CaseRule {
  const text = `${input.title}\n${input.description}\n${input.topic}`;
  for (const r of CASE_RULES) if (r.keywords.test(text)) return r;
  return { keywords: /.*/, ...DEFAULT_CASE };
}

// ---------- Antworttexte ----------

function buildCaseAnswers(input: AnalysisInput, r: CaseRule): Record<AnswerMode, string> {
  const datevLines = r.datev
    .map((d) => `  ${d.skr} ${d.konto} — ${d.bezeichnung}`)
    .join("\n");
  const missingList = r.missing.map((m) => `- ${m}`).join("\n");
  const qList = r.questions.map((q, i) => `${i + 1}. ${q}`).join("\n");

  return {
    kurz: `${r.summary}\n\nRisiko: ${riskLabel(r.risk)}. ${r.recommendation}`,
    pruefnotiz: `PRÜFNOTIZ — ${input.title}\n\nSachverhalt:\n${input.description.trim() || "(keine Beschreibung)"}\n\nRechtliche Würdigung:\n${r.summary}\n\nRisikoeinstufung: ${riskLabel(r.risk)}\nBegründung: ${r.riskReason}\n\nFehlende Angaben:\n${missingList}\n\nEmpfehlung:\n${r.recommendation}\n\nBearbeiter: ____________  Datum: ____________`,
    mandant: `Sehr geehrte Damen und Herren,\n\nvielen Dank für die Übermittlung des Sachverhalts „${input.title}“.\n\nNach einer ersten Sichtung können wir den Vorgang wie folgt einordnen: ${r.summary}\n\nDamit wir die Bearbeitung abschließen können, benötigen wir noch folgende Informationen:\n${missingList}\n\nSobald uns die Angaben vorliegen, setzen wir die Bearbeitung umgehend fort. Für Rückfragen stehen wir Ihnen jederzeit gern zur Verfügung.\n\nMit freundlichen Grüßen\nIhre Kanzlei`,
    rueckfrage: `Sehr geehrte/r Mandant/in,\n\nzur abschließenden Bearbeitung von „${input.title}“ bitten wir Sie um Beantwortung der folgenden Punkte:\n\n${qList}\n\nBitte senden Sie uns die Angaben zusammen mit den zugehörigen Belegen per E-Mail oder über das Mandantenportal zu.\n\nVielen Dank und freundliche Grüße\nIhre Kanzlei`,
    buchung: `BUCHUNGSVORSCHLAG (DATEV-Logik)\n\nSachverhalt: ${input.title}\nKontenrahmen: ${r.datev[0]?.skr ?? "SKR03"}\n\nVorgeschlagene Konten:\n${datevLines}\n\nHinweise:\n- Belegnummer fortlaufend vergeben\n- Buchungstext: kurz, eindeutig, mit Bezug zum Beleg\n- Steuerschlüssel nach Vorgang prüfen (z. B. 9 = 19 % VSt)\n\n${r.recommendation}`,
  };
}

function buildKnowledgeAnswers(input: AnalysisInput, k: KnowledgeAnswer): Record<AnswerMode, string> {
  const refs = k.references?.length ? `\n\nRechtsgrundlage: ${k.references.join(", ")}` : "";
  const kurz = `${k.answer}\n\n${k.explanation}${refs}`;
  return {
    kurz,
    pruefnotiz: `FACHHINWEIS — ${input.title}\n\nFrage:\n${input.description.trim()}\n\nAntwort:\n${k.answer}\n\nErläuterung:\n${k.explanation}${refs}`,
    mandant: `Sehr geehrte Damen und Herren,\n\ngern beantworten wir Ihre Frage:\n\n${k.answer}\n\n${k.explanation}${refs}\n\nFür Rückfragen stehen wir Ihnen gern zur Verfügung.\n\nMit freundlichen Grüßen\nIhre Kanzlei`,
    rueckfrage: kurz,
    buchung: kurz,
  };
}

// ---------- Public API ----------

export function riskLabel(r: Risk): string {
  return r === "gruen" ? "Grün (gering)" : r === "gelb" ? "Gelb (mittel)" : "Rot (hoch)";
}

export function analyze(input: AnalysisInput): Analysis {
  // 1) Wissensfrage?
  if (isLikelyKnowledge(input)) {
    const rule = pickKnowledgeRule(input);
    const knowledge: KnowledgeAnswer = rule
      ? { answer: rule.answer, explanation: rule.explanation, references: rule.references }
      : {
          answer:
            "Zu dieser Frage liegt aktuell keine hinterlegte Kurzantwort vor. Bitte präzisiere die Frage oder beschreibe den Sachverhalt etwas ausführlicher.",
          explanation:
            "steuerstoff erkennt häufige Wissensfragen (z. B. zu Umsatzsteuer, Reverse Charge, ARAP, Zweckbetrieb, Spendenrecht). Bei spezifischen Mandantenfällen liefert die App stattdessen eine vollständige Sachverhaltsanalyse mit Rückfragen und Risikoeinstufung.",
        };

    return {
      kind: rule?.kind ?? "wissen",
      risk: "gruen",
      riskReason: "Reine Wissensfrage — keine fallbezogene Risikoeinstufung erforderlich.",
      summary: knowledge.answer,
      missing: [],
      questions: [],
      recommendation: knowledge.explanation,
      knowledge,
      answers: buildKnowledgeAnswers(input, knowledge),
    };
  }

  // 2) Komplexer Sachverhalt
  const r = pickCaseRule(input);
  return {
    kind: r.kind,
    risk: r.risk,
    riskReason: r.riskReason,
    summary: r.summary,
    missing: r.missing,
    questions: r.questions,
    recommendation: r.recommendation,
    answers: buildCaseAnswers(input, r),
  };
}
